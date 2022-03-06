require("@nomiclabs/hardhat-web3");

async function main() {
  const addressLP = '0xA705a06aD314496271BD4Eba3d8766D9955F6D5a'
  const addressRewards = '0x9eB02B48372d2B3335CE78362a65Ab6B5863Ed25'
  time = 10 // minutes
  percent = 20

  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(addressLP, addressRewards, time, percent);

  console.log("Staking address:", staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
