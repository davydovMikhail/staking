const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-web3");

task("claim", "claim")
    .setAction(async function (taskArgs, hre) {
        const staking = await hre.ethers.getContractAt("Staking", process.env.ADDR_CONTRACT);
        try {
            await staking.claim()
            console.log('you received a reward');
        } catch (e) {
            console.log('error',e)
        }
    });