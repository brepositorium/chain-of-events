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
		bool isActive;
	}

	event EventCreated(uint256 indexed eventId, Event createdEvent);
	event DescriptionChanged(uint256 indexed eventId, string newDescription);
	event LocationChanged(uint256 indexed eventId, string newLocation);
	event LogoUrlChanged(uint256 indexed eventId, string newLogoUrl);
	event NumberOfTicketsChanged(
		uint256 indexed eventId,
		uint256 newNumberOfTickets
	);
	event EventDeleted(uint256 indexed eventId);
	event EventReactivated(uint256 indexed eventId);

	mapping(uint256 => Event) public events;

	//the key represents the id of an event, while the address array represents all the extras' addresses owned by that event
	mapping(uint256 => address[]) public extras;

	//the key represents the id of an event, while the address array represents all the wallets allowed to redeem an Extra
	mapping(uint256 => mapping(address => bool)) public allowedList;

	mapping(uint256 => uint256) public mintedTickets;

	uint256 public eventCounter;

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
			numberOfTickets,
			true
		);
		emit EventCreated(eventId, events[eventId]);
	}

	function addExtra(
		address deployedExtraAddress,
		uint256 eventId,
		address caller
	) public isCallerAdmin(eventId, caller) {
		extras[eventId].push(deployedExtraAddress);
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
		emit DescriptionChanged(eventId, newDescription);
	}

	function changeLocation(
		string calldata newLocation,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].location = newLocation;
		emit LocationChanged(eventId, newLocation);
	}

	function changeLogo(
		string calldata newLogoUrl,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].logoUrl = newLogoUrl;
		emit LogoUrlChanged(eventId, newLogoUrl);
	}

	function changeNumberOfTickets(
		uint256 newNumberOfTickets,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].numberOfTickets = newNumberOfTickets;
		emit NumberOfTicketsChanged(eventId, newNumberOfTickets);
	}

	function deleteEvent(uint256 eventId) public isSenderAdmin(eventId) {
		events[eventId].isActive = false;
		emit EventDeleted(eventId);
	}

	function reactivateEvent(uint256 eventId) public isSenderAdmin(eventId) {
		events[eventId].isActive = true;
		emit EventReactivated(eventId);
	}

	function increaseMintedTickets(uint256 eventId) external {
		mintedTickets[eventId]++;
	}

	function getMintedTickets(uint256 eventId) public view returns (uint256) {
		return mintedTickets[eventId];
	}

	function getNumberOfTickets(uint256 eventId) public view returns (uint256) {
		return events[eventId].numberOfTickets;
	}

	function getExtras(uint256 eventId) public view returns (address[] memory) {
		return extras[eventId];
	}

	function isAllowed(
		uint256 eventId,
		address addressToCheck
	) public view returns (bool) {
		return allowedList[eventId][addressToCheck];
	}
}
