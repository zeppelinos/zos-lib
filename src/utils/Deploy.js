async function deploy(contract, args = [], txParams = {}) {
  // If gas is set explicitly, use it
  if (txParams.gas) {
    return contract.new(... args, txParams);
  }

  // Required by truffle
  await contract.detectNetwork();

  // Get raw binary transaction for creating the contract
  const txOpts = { data: contract.binary, ... txParams };
  const txData = web3.eth.contract(contract.abi).new.getData(...args, txOpts);
  
  // Use json-rpc method estimateGas to retrieve estimated value
  const estimatedGas = await new Promise((resolve, reject) => {
    web3.eth.estimateGas({ data: txData, ... txParams }, 
      function(err, gas) {
        if (err) reject(err);
        else resolve(gas);
      }
    );
  });

  // Deploy the contract using estimated gas
  return contract.new(...args, { gas: estimatedGas, ... txParams });
}

export default deploy;
