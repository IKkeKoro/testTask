import { ethers } from "hardhat";

async function main() {
  const testTask = await ethers.deployContract("testTask");

  await testTask.waitForDeployment();

  console.log(
    `deployed to ${testTask.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
