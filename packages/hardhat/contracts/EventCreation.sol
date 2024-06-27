// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BundleDiscounts.sol";
import "./ExtraNft.sol";

error NotTheAdmin(uint256 eventId);
error NotFromExtraContract(uint256 eventId);
error NotFromBundleContractOfAdmin(uint256 eventId);

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
	event StartTimeChanged(uint256 indexed eventId, uint256 newStartTime);
	event EndTimeChanged(uint256 indexed eventId, uint256 newEndTime);

	mapping(uint256 => Event) public events;

	/// @notice Retrieves the list of extra addresses associated with an event
	/// @dev Maps event IDs to their corresponding arrays of extra addresses
	mapping(uint256 => address[]) public extras;

	/// @dev Maps event IDs to mappings of extra addresses to their inclusion status, ensuring only valid extras are considered for each event.
	mapping(uint256 => mapping(address => bool)) extrasMapping;

	/// @notice Check if a specific address is allowed to redeem tickets for a particular event
	/// @dev Maps event IDs to a mapping of addresses allowed to redeem tickets
	mapping(uint256 => mapping(address => bool)) public allowedList;

	mapping(uint256 => uint256) public mintedTickets;

	/// @notice Retrieves the list of bundle contract addresses associated with an event
	/// @dev Maps event IDs to arrays of bundle contract addresses
	mapping(uint256 => address[]) public bundles;

	/// @dev Maps event IDs to mappings of bundle addresses to their inclusion status, ensuring only valid bundles are considered for each event.
	mapping(uint256 => mapping(address => bool)) bundlesMapping;

	uint256 public eventCounter;

	modifier isSenderAdmin(uint256 eventId) {
		if (events[eventId].admin != msg.sender) {
			revert NotTheAdmin(eventId);
		}
		_;
	}

	modifier isCallFromExtraContract(uint256 eventId) {
		if (extrasMapping[eventId][msg.sender] == false) {
			revert NotFromExtraContract(eventId);
		}
		_;
	}

	/// @notice Creates a new event with specified details and registers it on the blockchain
	/// @dev Emits an EventCreated event upon successful creation
	/// @param name Name of the event
	/// @param description Description of the event
	/// @param location Location of the event as coordinates
	/// @param logoUrl URL of the event's logo
	/// @param numberOfTickets Total number of tickets available for the event
	/// @param startTime Start time of the event as a Unix timestamp
	/// @param endTime End time of the event as a Unix timestamp
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
	function addExtra(
		address deployedExtraAddress,
		uint256 eventId
	) private isSenderAdmin(eventId){
		extras[eventId].push(deployedExtraAddress);
		extrasMapping[eventId][deployedExtraAddress] = true;
	}

	/// @notice Adds a bundle contract to the specified event
	/// @dev Adds the contract address to the bundles array and sets its mapping status to true
	/// @param deployedBundleAddress The contract address of the deployed bundle
	/// @param eventId The ID of the event to associate with the bundle
	function addBundleContract(
		address deployedBundleAddress,
		uint256 eventId
	) private isSenderAdmin(eventId){
		bundles[eventId].push(deployedBundleAddress);
		bundlesMapping[eventId][deployedBundleAddress] = true;
	}

	/// @notice Creates a new bundle discount contract and registers it for the specified event
	/// @dev Deploys a new BundleDiscounts contract and registers it using addBundleContract
	/// @param _price Discount price for the bundle
	/// @param _eventId ID of the event the bundle is associated with
	/// @param _priceFeedHandlerAddress Address of the price feed handler for real-time pricing
	function createAndRegisterBundle(
		string calldata _name,
        uint256 _price,
        uint256 _eventId,
        address _priceFeedHandlerAddress
    ) public isSenderAdmin(_eventId) {
        BundleDiscounts newBundleDiscount = new BundleDiscounts(
            address(this),
            _priceFeedHandlerAddress,
			_eventId,
			_name,
            _price
        );
        addBundleContract(address(newBundleDiscount), _eventId);
    }

	/// @notice Creates a new ExtraNFT contract and registers it for the specified event
	/// @dev Deploys a new ExtraNft contract, sets the caller as the owner, and registers it using addExtra
	/// @param name Name of the extra
	/// @param symbol Symbol of the extra NFT
	/// @param uri URI for the extra's metadata
	/// @param extraType Type identifier for the extra
	/// @param price Price of the extra
	/// @param eventId ID of the event the extra is associated with
	/// @param priceFeedHandlerAddress Address of the price feed handler for real-time pricing
	function createAndRegisterExtra(
        string memory name,
        string memory symbol,
        string memory uri,
        uint256 extraType,
        uint256 price,
        uint256 eventId,
        address priceFeedHandlerAddress,
		address participantsContractAddress
    ) public isSenderAdmin(eventId) {
        ExtraNft newExtra = new ExtraNft(
            name,
            symbol,
            uri,
            extraType,
            price,
            address(this),
            eventId,
            priceFeedHandlerAddress,
			participantsContractAddress
        );
		newExtra.transferOwnership(msg.sender);
        addExtra(address(newExtra), eventId);
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

	function changeStartTime(
		uint256 newStartTime,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].startTime = newStartTime;
		emit StartTimeChanged(eventId, newStartTime);
	}

	function changeEndTime(
		uint256 newEndTime,
		uint256 eventId
	) public isSenderAdmin(eventId) {
		events[eventId].endTime = newEndTime;
		emit EndTimeChanged(eventId, newEndTime);
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

	function increaseMintedTickets(uint256 eventId) external isCallFromExtraContract(eventId) {
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

	function getBundles(uint256 eventId) public view returns (address[] memory) {
		return bundles[eventId];
	}

	function isBundleContractPartOfEvent(uint256 _eventId, address _address) public view returns (bool) {
		return bundlesMapping[_eventId][_address];
	}

	function isExtraPartOfEvent(uint256 _eventId, address _address) public view returns (bool) {
		return extrasMapping[_eventId][_address];
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
