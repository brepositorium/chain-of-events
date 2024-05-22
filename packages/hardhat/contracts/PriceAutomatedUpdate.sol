// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AutomationCompatibleInterface } from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./ExtraNft.sol";

contract TestAuto is AutomationCompatibleInterface {
	address public admin;
	ExtraNft public extraContract;
	uint256 public scheduledTime;
	uint256 public newPrice;

	constructor(address _extraContract) {
		admin = msg.sender;
		extraContract = ExtraNft(_extraContract);
	}

	function schedulePriceUpdate(uint256 _newPrice, uint256 _time) external {
		require(msg.sender == admin, "Unauthorized");
		newPrice = _newPrice;
		scheduledTime = _time;
	}

	function checkUpkeep(
		bytes calldata
	) external view override returns (bool upkeepNeeded, bytes memory) {
		upkeepNeeded = (block.timestamp >= scheduledTime && scheduledTime != 0);
	}

	function performUpkeep(bytes calldata) external override {
		require(block.timestamp >= scheduledTime, "Too early to update price");
		extraContract.updatePrice(newPrice);
		scheduledTime = 0;
	}
}
