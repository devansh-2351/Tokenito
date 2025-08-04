const hre = require("hardhat");

async function main() {
  const initialSupply = hre.ethers.parseEther("1000");
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(initialSupply);
  await simpleToken.waitForDeployment();
  console.log("SimpleToken deployed to:", await simpleToken.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 