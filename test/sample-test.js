const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers/lib/utils");



describe("Staking test", function () {
  beforeEach(async() => {
    [owner, user1, user2, user3] = await ethers.getSigners()
    let TokenF = await ethers.getContractFactory("Token") // фабрика ерц20
    let StakingF = await ethers.getContractFactory("Staking") // фабрика стейкинаг
    primaryTotalSupply = parseEther("10000") 
    tokenLP = await TokenF.connect(owner).deploy(primaryTotalSupply) // деплой токена лп токена
    tokenRewards = await TokenF.connect(owner).deploy(primaryTotalSupply) // деплой токена для наград
    time = 20 // время зморозки
    percent = 30 // награда в процентах
    staking = await StakingF.connect(owner).deploy(tokenLP.address, tokenRewards.address, time, percent)
    rewardContractBalance = parseEther("5000")
    tokenRewards.connect(owner).transfer(staking.address, rewardContractBalance)
    userBalanceLP = parseEther("50")
    tokenLP.connect(owner).transfer(user1.address, userBalanceLP)
  })

  it("main event loop", async function () {
    const stakeAmount = parseEther("25");
    await tokenLP.connect(user1).approve(staking.address, stakeAmount)
    await staking.connect(user1).stake(stakeAmount);
    await expect(staking.connect(user1).claim()).to.be.revertedWith("not yet time")
    await expect(staking.connect(user1).unstake()).to.be.revertedWith("not yet time")
    const timeFreezing = time * 60
    await ethers.provider.send("evm_increaseTime", [timeFreezing])
    await ethers.provider.send("evm_mine")
    expect(await tokenRewards.balanceOf(user1.address)).to.equal(0);
    await staking.connect(user1).claim()
    const rewardResult = (( stakeAmount * percent ) / 100).toString()
    expect(await tokenRewards.balanceOf(user1.address)).to.equal(rewardResult);
    expect(await tokenLP.balanceOf(user1.address)).to.equal(userBalanceLP.sub(stakeAmount));
    await staking.connect(user1).unstake()
    expect(await tokenLP.balanceOf(user1.address)).to.equal(userBalanceLP);
  });

  it("setNewTime and setRewardPercentage", async () => {
    const stakeAmount = parseEther("25");
    const newTime = 25 // minutes
    const newPercent = 40 // percent
    await expect(staking.connect(user1).setNewTime(newTime)).to.be.revertedWith("this feature is only available to the owner of the contract")
    await expect(staking.connect(user1).setRewardPercentage(newPercent)).to.be.revertedWith("this feature is only available to the owner of the contract")
    await staking.connect(owner).setNewTime(newTime)
    await staking.connect(owner).setRewardPercentage(newPercent)
    await tokenLP.connect(user1).approve(staking.address, stakeAmount)
    await staking.connect(user1).stake(stakeAmount);
    const timeFreezing = newTime * 60
    await ethers.provider.send("evm_increaseTime", [timeFreezing])
    await ethers.provider.send("evm_mine")
    await staking.connect(user1).claim()
    const rewardResult = (( stakeAmount * newPercent ) / 100).toString()
    expect(await tokenRewards.balanceOf(user1.address)).to.equal(rewardResult);
  });
});
