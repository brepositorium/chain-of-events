// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotTheAdmin(uint256 eventId);

contract EventCreation {
	struct Event {
		uint256 id;
		string name;
		string description;
		string location;
		string logoUrl;
		address admin;
		uint256 numberOfTickets;
	}

	event EventCreated(Event createdEvent);

	mapping(uint256 => Event) public events;

	//the key represents the id of an event, while the address array represents all the extras' addresses owned by that event
	mapping(uint256 => address[]) public extras;

	//the key represents the id of an event, while the address array represents all the wallets allowed to redeem an Extra
	mapping(uint256 => mapping(address => bool)) public allowedList;

	uint256 public eventCounter;

	uint256 mintedTickets;

	modifier isSenderAdmin(uint256 eventId) {
		if (events[eventId].admin != msg.sender) {
			revert NotTheAdmin(eventId);
		}
		_;
	}

	modifier isCallerAdmin(uint256 eventId, address caller) {
		if (events[eventId].admin != caller) {
			revert NotTheAdmin(eventId);
		}
		_;
	}

	function createEvent(
		string calldata name,
		string calldata description,
		string calldata location,
		string calldata logoUrl,
		uint256 numberOfTickets
	) public {
		uint256 eventId = eventCounter++;
		events[eventId] = Event(
			eventId,
			name,
			description,
			location,
			logoUrl,
			msg.sender,
			numberOfTickets
		);
		emit EventCreated(events[eventId]);
	}

	function addExtra(
		address deployedExtraAddress,
		uint256 eventId,
		uint256 extraType,
		address caller
	) public isCallerAdmin(eventId, caller) {
		extras[eventId].push(deployedExtraAddress);
		if (extraType == 0) {
			mintedTickets++;
		}
	}

	function addAllowedAddress(
		address allowedAddress,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		allowedList[eventId][allowedAddress] = true;
	}

	function changeDescription(
		string calldata newDescription,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].description = newDescription;
	}

	function changeLocation(
		string calldata newLocation,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].location = newLocation;
	}

	function changeLogo(
		string calldata newLogoUrl,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].logoUrl = newLogoUrl;
	}

	function changeNumberOfTickets(
		uint256 newNumberOfTickets,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].numberOfTickets = newNumberOfTickets;
	}

	function getExtras(uint256 eventId) public view returns (address[] memory) {
		//TODO check that it doesnt exist already
		return extras[eventId];
	}

	function isAllowed(
		uint256 eventId,
		address addressToCheck
	) public view returns (bool) {
		//TODO check that it doesnt exist already
		return allowedList[eventId][addressToCheck];
	}
}
