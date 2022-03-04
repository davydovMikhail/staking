//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// import "hardhat/console.sol";

contract Staking {
    using SafeERC20 for IERC20;
    address private tokenLP; // адрес контракта ЛП токенов
    address private tokenReward; // адрес контракта, с токенами которые идут в качестве награды
    address private owner; // адрес владельца контракта
    uint256 private percent; // процент который берется от того что застейкано
    uint256 private freezingTime; // время заморозки застейканного в минутах

    mapping(address => uint256) private _stakes; // сколько застейкано
    mapping(address => uint256) private _rewards; // награды по пользователям
    mapping(address => uint256) private _timestamps; // метки времени, взятые в момент вызова stake()

    constructor(
        address _lpAddress,
        address _rewardAddress,
        uint256 _minutes,
        uint256 _percent
    ) {
        tokenLP = _lpAddress;
        tokenReward = _rewardAddress;
        owner = msg.sender;
        freezingTime = _minutes * 60;
        percent = _percent;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this feature is only available to the owner of the contract"
        );
        _;
    }

    modifier checkTime() {
        require(
            block.timestamp > _timestamps[msg.sender] + freezingTime,
            "not yet time"
        );
        _;
    }

    function stake(uint256 _amount) external {
        IERC20(tokenLP).safeTransferFrom(msg.sender, address(this), _amount);
        _stakes[msg.sender] += _amount;
        _rewards[msg.sender] += rewardCalc(_amount);
        _timestamps[msg.sender] = block.timestamp;
    }

    function claim() external checkTime returns (bool) {
        IERC20(tokenReward).safeTransfer(msg.sender, _rewards[msg.sender]);
        _rewards[msg.sender] = 0;
        return true;
    }

    function unstake() external checkTime {
        IERC20(tokenLP).safeTransfer(msg.sender, _stakes[msg.sender]);
        _stakes[msg.sender] = 0;
    }

    function rewardCalc(uint256 _amountLP) public view returns (uint256) {
        return (_amountLP * percent) / 100;
    }

    function setNewTime(uint256 _minutes) external onlyOwner {
        freezingTime = _minutes * 60;
    }

    function setRewardPercentage(uint256 _percent) external onlyOwner {
        percent = _percent;
    }
}
