// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotTheAdmin(uint256 eventId);

/// @title Event Creation and Management for Chain of Events Platform
/// @author radub.xyz
/// @notice You can use this contract to manage event details and ticketing information on the blockchain
/// @dev This contract includes functions for creating and managing events, adding extras, and handling allowed addresses for ticket redemption
contract EventCreation {
	struct Event {
		uint256 id;
		string name;
		string description;
		string location;
		string logoUrl;
		address admin;
		uint256 numberOfTickets;
		uint256 startTime;
		uint256 endTime;
		bool isActive;
	}

	event EventCreated(Event createdEvent);
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

	/// @notice Retrieves the list of extra addresses associated with an event
	/// @dev Maps event IDs to their corresponding arrays of extra addresses
	mapping(uint256 => address[]) public extras;

	/// @notice Check if a specific address is allowed to redeem tickets for a particular event
	/// @dev Maps event IDs to a mapping of addresses allowed to redeem tickets
	mapping(uint256 => mapping(address => bool)) public allowedList;

	mapping(uint256 => uint256) public mintedTickets;

	//key is the id of the event and value is another mapping where key is the participant's address and the value is an array of his/her redeemed tickets
	mapping(uint256 => mapping(address => address[])) public participantsWithTickets;

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

	/// @notice Creates a new event with given details
	/// @dev Emits an EventCreated event upon success
	/// @param name Name of the event
	/// @param description Description of the event
	/// @param location Location of the event
	/// @param logoUrl URL of the event's logo
	/// @param numberOfTickets Total number of tickets available for the event
	function createEvent(
		string calldata name,
		string calldata description,
		string calldata location,
		string calldata logoUrl,
		uint256 numberOfTickets,
		uint256 startTime,
		uint256 endTime
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
			startTime,
			endTime,
			true
		);
		emit EventCreated(events[eventId]);
	}

	/// @notice Adds an extra address for a specific event
	/// @param deployedExtraAddress The contract address of the deployed extra (e.g., tickets, VIP passes)
	/// @param eventId The ID of the event
	/// @param caller The address attempting to add the extra
	function addExtra(
		address deployedExtraAddress,
		uint256 eventId,
		address caller
	) public isCallerAdmin(eventId, caller) {
		extras[eventId].push(deployedExtraAddress);
	}

	function addParticipantWithTicket(uint256 eventId, address participant, address ticket) public {
		participantsWithTickets[eventId][participant].push(ticket);
	}

	/// @notice Allows an address to redeem tickets for an event
	/// @param allowedAddress The address to allow
	/// @param eventId The ID of the event
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

	/// @notice Marks an event as inactive and effectively deletes it from active listings
	/// @dev Emits an EventDeleted event upon successfully marking the event as inactive
	/// @param eventId The ID of the event to delete
	/// @custom:security admin-only This function can only be called by the admin of the event
	function deleteEvent(uint256 eventId) public isSenderAdmin(eventId) {
		events[eventId].isActive = false;
		emit EventDeleted(eventId);
	}

	/// @notice Reactivates a previously deactivated event, making it active and visible again
	/// @dev Emits an EventReactivated event upon successfully reactivating the event
	/// @param eventId The ID of the event to reactivate
	/// @custom:security admin-only This function can only be called by the admin of the event
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

	function getAdmin(uint256 eventId) public view returns (address) {
		return events[eventId].admin;
	}

	function isAllowed(
		uint256 eventId,
		address addressToCheck
	) public view returns (bool) {
		return allowedList[eventId][addressToCheck];
	}
}
