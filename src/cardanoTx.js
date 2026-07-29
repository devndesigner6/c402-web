import * as CSL from '@emurgo/cardano-serialization-lib-asmjs';

const hexToBytes = (hex) => Uint8Array.from(hex.match(/.{1,2}/g) || [], byte => parseInt(byte, 16));
const bytesToHex = (bytes) => Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

/**
 * Build a Cardano transaction that pays the merchant address.
 * Enforces Preprod network, validates UTxO selection, calculates fees, and returns unsigned CBOR hex.
 */
export async function buildPaymentTx(walletApi, recipientAddr, lovelaceAmount, protocolParams) {
  // 1. Validate preprod network (networkId 0 = preprod, 1 = mainnet)
  const networkId = await walletApi.getNetworkId();
  if (networkId !== 0) {
    throw new Error("Wallet must be on Cardano Preprod testnet (networkId: 0)");
  }

  // 2. Get wallet UTxOs and change address
  const utxosHex = await walletApi.getUtxos();
  if (!utxosHex || utxosHex.length === 0) {
    throw new Error("No UTxOs available in wallet. Fund the wallet with test ADA from the faucet.");
  }

  const changeAddrHex = await walletApi.getChangeAddress();
  if (!changeAddrHex) {
    throw new Error("Could not retrieve change address from wallet");
  }

  // 3. Parse UTxOs and addresses with CSL
  const utxos = utxosHex.map(hex => {
    try {
      return CSL.TransactionUnspentOutput.from_bytes(hexToBytes(hex));
    } catch (e) {
      throw new Error(`Failed to parse UTxO: ${e.message}`);
    }
  });

  const changeAddr = CSL.Address.from_bytes(hexToBytes(changeAddrHex));
  const recipientAddress = CSL.Address.from_bech32(recipientAddr);

  // 4. Build transaction with protocol parameters
  const txBuilder = CSL.TransactionBuilder.new(
    CSL.TransactionBuilderConfigBuilder.new()
      .fee_algo(CSL.LinearFee.new(
        CSL.BigNum.from_str(protocolParams.min_fee_a.toString()),
        CSL.BigNum.from_str(protocolParams.min_fee_b.toString())
      ))
      .pool_deposit(CSL.BigNum.from_str(protocolParams.pool_deposit))
      .key_deposit(CSL.BigNum.from_str(protocolParams.key_deposit))
      .max_value_size(protocolParams.max_val_size)
      .max_tx_size(protocolParams.max_tx_size)
      .coins_per_utxo_byte(CSL.BigNum.from_str(protocolParams.coins_per_utxo_size))
      .build()
  );

  // 5. Bind this payment to the gateway challenge in transaction metadata.
  txBuilder.add_json_metadatum_with_schema(
    CSL.BigNum.from_str('402'),
    JSON.stringify({ protocol: 'c402-v1', recipient: recipientAddr, amount_lovelaces: lovelaceAmount }),
    CSL.MetadataJsonSchema.BasicConversions
  );

  // 6. Add output: payment to merchant
  txBuilder.add_output(
    CSL.TransactionOutput.new(
      recipientAddress,
      CSL.Value.new(CSL.BigNum.from_str(lovelaceAmount.toString()))
    )
  );

  // 7. Add inputs using CSL coin selection
  const txInputs = CSL.TransactionUnspentOutputs.new();
  utxos.forEach(utxo => txInputs.add(utxo));
  txBuilder.add_inputs_from(txInputs, CSL.CoinSelectionStrategyCIP2.LargestFirstMultiAsset);

  // 8. Add change output
  txBuilder.add_change_if_needed(changeAddr);

  // 8. Build transaction body and create transaction
  try {
    const txBody = txBuilder.build();
    const witnesses = CSL.TransactionWitnessSet.new();
    const tx = CSL.Transaction.new(txBody, witnesses);

    return bytesToHex(tx.to_bytes());
  } catch (err) {
    throw new Error(`Failed to build transaction: ${err.message}`);
  }
}
