import {ethers,getAbi,DEPLOYED_CONTRACT_ADDRESS,PRIVATE_KEY,BSC_TESTNET_URL} from './setup'
async function main() {
    let provider = ethers.getDefaultProvider(BSC_TESTNET_URL);
    const abi = await getAbi()
    let signer = new ethers.Wallet(`0x${PRIVATE_KEY}`, provider);
    const contract = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, abi, signer);

    const participationTime = 181
    let tx = await contract.setParticipationTime(participationTime);
    await tx.wait();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});