// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EventCreation.sol";

contract Participants {

    EventCreation eventCreation;

    /// @notice Retrieves the list of participant addresses for each event
	/// @dev Maps event IDs to arrays of participant addresses who have redeemed tickets
	mapping(uint256 => address[]) public participants;

	/// @notice Retrieves the list of tickets redeemed by a participant
	/// @dev Maps participant addresses to arrays of redeemed ticket addresses
	mapping(address => address[]) public participantsTickets;

    modifier isCallFromExtraContract(uint256 eventId) {
    if (eventCreation.isExtraPartOfEvent(eventId, msg.sender) == false) {
        revert NotFromExtraContract(eventId);
    }
    _;
	}

    constructor(
		address _eventCreationAddress
	) {
		eventCreation = EventCreation(_eventCreationAddress);
	}

    /// @notice Registers a ticket for a participant for a specific event once the ticket was redeemed
	/// @dev Adds a participant address to the event's participant list and maps their ticket to their address
	/// @param eventId ID of the event the ticket is for
	/// @param participant Address of the participant redeeming the ticket
	/// @param extraAddress Address of the redeemed ticket contract
	function addParticipantWithTicket(uint256 eventId, address participant, address extraAddress) external 
	isCallFromExtraContract(eventId)
	{
		if(participantsTickets[participant].length == 0) {
			participants[eventId].push(participant);
		}
		participantsTickets[participant].push(extraAddress);
	}

	function getParticipants(uint256 eventId) public view returns (address[] memory) {
		return participants[eventId];
	}

	function getNumberOfParticipants(uint256 eventId) public view returns (uint256) {
		return participants[eventId].length;
	}

	function getReedemedTicketsOfParticipant(address participantAddress) public view returns (address[] memory) {
		return participantsTickets[participantAddress];
	}

}