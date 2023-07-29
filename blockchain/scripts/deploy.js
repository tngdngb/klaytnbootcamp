const { ethers } = require("hardhat");
require("dotenv").config();

const votingOptions = Array.from(new Set(process.env.VOTING_OPTIONS.split(",")));

async function main() {
  const deployerAddr = "0xb451aC1459e5a346167F7a2910bCA807313003D3";
  const deployer = await ethers.getSigner(deployerAddr);

  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(
    `Account balance: ${(
      await ethers.provider.getBalance(deployerAddr)
    ).toString()}`
  );

  const contract = await ethers.getContractFactory("Voting");
  const deployedContact = await contract.deploy();

  await deployedContact.setOptions(votingOptions, {
    gasLimit: 3000000
  });

  console.log(
    `Congratulations! You have just successfully deployed your voting contract.`
  );
  console.log(
    `vt contract address is ${await deployedContact.getAddress()} You can verify on https://baobab.scope.klaytn.com/account/${await deployedContact.getAddress()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
