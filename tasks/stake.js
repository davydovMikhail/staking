const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-web3");

task("stake", "stake")
    .addParam("amount", "stake's amount")
    .setAction(async function (taskArgs, hre) {
        const staking = await hre.ethers.getContractAt("Staking", process.env.ADDR_CONTRACT);
        try {
            await staking.stake(web3.utils.toWei(taskArgs.amount, 'ether'))
            console.log(`you staked ${taskArgs.amount} LP tokens`);
        } catch (e) {
            console.log('error',e)
        }
    });