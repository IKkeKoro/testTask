import {ethers,getAbi,DEPLOYED_CONTRACT_ADDRESS,PRIVATE_KEY,BSC_TESTNET_URL} from './setup'
async function main() {
    let provider = ethers.getDefaultProvider(BSC_TESTNET_URL);
    const abi = await getAbi()
    let signer = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
    const contract = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, abi, signer);

    const userAddress = '0xE25AE7BFdcFAC05913c439b225D533f619b8fF9a'
    let tx = await contract.getUserData(userAddress,0);
    console.log(Number(tx))
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});