// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ExtraNft.sol";
import "./EventCreation.sol";

error BundleIsNotCreated(uint256 _bundleId);
error EventDoesNotExist(uint256 _eventId);
error NotActivated();

contract BundleDiscounts {

    EventCreation eventCreation;
	PriceFeedHandler priceFeedHandler;

    string public name;

    address[] public extras;

    mapping(address => uint256) public extrasWithAmounts;

    uint256 public price;

    uint256 public eventId;

    modifier onlyAdmin(uint256 _eventId) {
		if (eventCreation.getAdmin(_eventId) != msg.sender) {
			revert NotTheAdmin(_eventId);
		}
		_;
	}

    modifier enoughMoneySent(uint256 moneySent, uint256 _price) {
		uint256 requiredWei = priceFeedHandler.calculateEthAmount(_price);
		if (moneySent < requiredWei) {
			revert NotEnoughMoneySent(moneySent, _price);
		}
		_;
	}

    constructor(
		address _eventCreationAddress,
		address _priceFeedHandlerAddress,
        uint256 _eventId,
        string memory _name,
        uint256 _price
	) {
		eventCreation = EventCreation(_eventCreationAddress);
		priceFeedHandler = PriceFeedHandler(_priceFeedHandlerAddress);
        eventId = _eventId;
        name = _name;
        price = _price;
	}

    function addExtraToBundle(address _extraAddress, uint256 _amount) public onlyAdmin(eventId) {
        if (extrasWithAmounts[_extraAddress] == 0) {
            extras.push(_extraAddress);
        }
        extrasWithAmounts[_extraAddress] = _amount;
    }

    function mintBundle(address _to) public payable enoughMoneySent(msg.value, price){
        for (uint i = 0; i < extras.length; i++) {
            address extraAddress = extras[i];
            ExtraNft(extraAddress).mintForBundle(_to, extrasWithAmounts[extraAddress]);
        }
    }
 
    function withdraw() public onlyAdmin(eventId){
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    function getExtras() public view returns (address[] memory) {
		return extras;
	}
}
