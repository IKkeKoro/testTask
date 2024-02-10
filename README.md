# Sample Hardhat Project

This is a test task where users enter values ​​within the allotted time.

If time has passed and the number of participants is at least 20, the median is calculated from all values, after which the winner is determined
________________________________________________________________________________________________________________________________________________

CONTRACT : path (contracts/testTask.sol)
TEST     : path (test/TestTask.test.ts)
SCRIPTS  : path (scripts/)

SETUP PROJECT:
    npm i 
    create .env file and add:

    PRIVATE_KEY=""        //  how to : https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key
    
    Add an URL for your network, for example bsc testnet:
    
    BSC_TESTNET_URL=""   // you can use https://dashboard.quicknode.com/ or similar platfroms

    To verify contract you need to add API of choosed network in scan like https://bscscan.com/ (log in to account and you can find it in settings)

    BSC_API=""


SETUP SCRIPTS: 
   Basic setup is in scripts/setup.ts file
   ABI_FILE_PATH = 'artifacts/contracts/testTask.sol/testTask.json'; 
   DEPLOYED_CONTRACT_ADDRESS = '$contract address';
 
```shell
to deploy contract :

    npx hardhat compile
    npx hardhat run scripts/deploy.ts --network $network_name

to verify contract :

    npx hardhat verify $contract_address --network $network_name

to run tests:

    npx hardhat test


to run scripts:

    npx hardhat run scripts/$file_name.ts --network $network_name

