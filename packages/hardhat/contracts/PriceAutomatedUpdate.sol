// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import { LinkTokenInterface } from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "./ExtraNft.sol";

struct RegistrationParams {
	string name;
	bytes encryptedEmail;
	address upkeepContract;
	uint32 gasLimit;
	address adminAddress;
	uint8 triggerType;
	bytes checkData;
	bytes triggerConfig;
	bytes offchainConfig;
	uint96 amount;
}

interface AutomationRegistrarInterface {
	function registerUpkeep(
		RegistrationParams calldata requestParams
	) external returns (uint256);
}

contract PriceAutomatedUpdate is AutomationCompatibleInterface {
	address public admin;
	ExtraNft public extraContract;
	uint256 public scheduledTime;
	uint256 public newPrice;
	uint256 public _upkeepId;
	LinkTokenInterface public immutable i_link;
	AutomationRegistrarInterface public immutable i_registrar;

	constructor(
		address _extraContract,
		LinkTokenInterface link,
		AutomationRegistrarInterface registrar
	) {
		extraContract = ExtraNft(_extraContract);
		admin = extraContract.owner();
		i_link = link;
		i_registrar = registrar;
	}

	function getContractBalance() external view returns (uint256) {
		return i_link.balanceOf(address(this));
	}

	function scheduleUpdate(uint256 _newPrice, uint256 _time) external {
		require(msg.sender == admin, "Unauthorized");
		newPrice = _newPrice;
		scheduledTime = _time;
	}

	function checkUpkeep(
		bytes calldata
	) external view override returns (bool upkeepNeeded, bytes memory data) {
		upkeepNeeded = (block.timestamp >= scheduledTime && scheduledTime != 0);
		data = "";
		return (upkeepNeeded, data);
	}

	function performUpkeep(bytes calldata) external override {
		require(block.timestamp >= scheduledTime, "Too early to update price");
		extraContract.updatePrice(newPrice);
		scheduledTime = 0;
	}

	function registerUpkeep(
		string calldata name,
		uint32 gasLimit,
		uint96 amount
	) external returns (uint256) {
		RegistrationParams memory params = RegistrationParams({
			name: name,
			encryptedEmail: "0x",
			upkeepContract: address(this),
			gasLimit: gasLimit,
			adminAddress: admin,
			triggerType: 0,
			checkData: "0x",
			triggerConfig: "0x",
			offchainConfig: "0x",
			amount: amount
		});

		i_link.approve(address(i_registrar), params.amount);
		_upkeepId = i_registrar.registerUpkeep(params);
		return _upkeepId;
	}
}
