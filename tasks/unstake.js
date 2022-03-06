const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-web3");

task("unstake", "unstake")
    .setAction(async function (taskArgs, hre) {
        const staking = await hre.ethers.getContractAt("Staking", process.env.ADDR_CONTRACT);
        try {
            await staking.unstake()
            console.log('LP tokens returned');
        } catch (e) {
            console.log('error',e)
        }
    });