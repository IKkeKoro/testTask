var fs = require('fs');
import { ethers } from "hardhat";
import 'dotenv/config'

const fsPromises = fs.promises;
const ABI_FILE_PATH = 'artifacts/contracts/testTask.sol/testTask.json';
const DEPLOYED_CONTRACT_ADDRESS = '0xa6B47460d1eE82823c11Ac0d8cE4Fb4dd80c446F';
const { PRIVATE_KEY } = process.env;
const { BSC_TESTNET_URL} = process.env;
async function getAbi(){
  const data = await fsPromises.readFile(ABI_FILE_PATH, 'utf8');
  const abi = JSON.parse(data)['abi'];
  return abi;
}

export {ethers,getAbi,DEPLOYED_CONTRACT_ADDRESS,PRIVATE_KEY,BSC_TESTNET_URL}
