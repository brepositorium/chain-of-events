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

    address[] public extras;

    mapping(address => uint256) public extrasWithAmounts;

    uint256 public price;

    uint256 public eventId;

    bool public isActive;

    event BundleCreated(address indexed bundleAddress, uint256 eventId);

    event AddedToBundle(address indexed bundleAddress, address extraAddress, uint256 amount);

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

    modifier isActivated() {
		if (!isActive) {
			revert NotActivated();
		}
		_;
	}

    constructor(
		address _eventCreationAddress,
		address _priceFeedHandlerAddress,
        uint256 _eventId,
        uint256 _price
	) {
		eventCreation = EventCreation(_eventCreationAddress);
		priceFeedHandler = PriceFeedHandler(_priceFeedHandlerAddress);
        eventId = _eventId;
        price = _price;
        isActive = false;
        emit BundleCreated(address(this), _eventId);
	}

    function addExtraToBundle(address _extraAddress, uint256 _amount) public onlyAdmin(eventId) {
        if (extrasWithAmounts[_extraAddress] == 0) {
            extras.push(_extraAddress);
        }
        extrasWithAmounts[_extraAddress] = _amount;
        emit AddedToBundle(address(this), _extraAddress, _amount);
    }

    function mintBundle(address _to) public payable enoughMoneySent(msg.value, price) isActivated() {
        for (uint i = 0; i < extras.length; i++) {
            address extraAddress = extras[i];
            ExtraNft(extraAddress).mintForBundle(_to, extrasWithAmounts[extraAddress]);
        }
    }

    function activate() public onlyAdmin(eventId) {
        require(!isActive, "Already active");
        isActive = true;
    }

    function deactivate() public onlyAdmin(eventId) onlyAdmin(eventId) isActivated(){
        isActive = false;
    }

    function withdraw() public onlyAdmin(eventId){
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }
}
