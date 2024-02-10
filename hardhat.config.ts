import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

const { PRIVATE_KEY } = process.env;
const { BSC_TESTNET_URL,POLYGON_URL,MUMBAI_URL } = process.env;
const { BSC_API } = process.env;
const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks:{
    testnet:{
      url:BSC_TESTNET_URL,
      accounts:[`0x${PRIVATE_KEY}`]
    },
    polygon:{
      url:POLYGON_URL,
      accounts:[`0x${PRIVATE_KEY}`]
    },
    mumbai:{
      url:MUMBAI_URL,
      accounts:[`0x${PRIVATE_KEY}`]
    }
  },
  etherscan:{
      apiKey: BSC_API
  }
};

export default config;
