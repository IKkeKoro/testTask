var fs = require('fs');
import { ethers } from "hardhat";
import 'dotenv/config'

const fsPromises = fs.promises;
const ABI_FILE_PATH = 'artifacts/contracts/testTask.sol/testTask.json';
const DEPLOYED_CONTRACT_ADDRESS = '0x40726a68E9917a5a50E8ce2fB147a3862CF8e998';
const { PRIVATE_KEY } = process.env;
const { BSC_TESTNET_URL} = process.env;
async function getAbi(){
  const data = await fsPromises.readFile(ABI_FILE_PATH, 'utf8');
  const abi = JSON.parse(data)['abi'];
  return abi;
}

export {ethers,getAbi,DEPLOYED_CONTRACT_ADDRESS,PRIVATE_KEY,BSC_TESTNET_URL}
