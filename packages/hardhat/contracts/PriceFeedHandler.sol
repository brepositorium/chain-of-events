// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AggregatorV3Interface } from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PriceFeedHandler {
	AggregatorV3Interface internal priceFeed;

	constructor(address _priceFeedAddress) {
		priceFeed = AggregatorV3Interface(_priceFeedAddress);
	}

	function getLatestPrice() public view returns (uint256) {
		(, int price, , , ) = priceFeed.latestRoundData();
		require(price > 0, "Invalid price data");
		return uint256(price);
	}

	function calculateEthAmount(
		uint256 usdAmount
	) public view returns (uint256) {
		uint256 ethPriceInUsd = getLatestPrice();
		return ((usdAmount * 1e18) / ethPriceInUsd) * 1e4;
	}
}
