// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { VRFConsumerBaseV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "https://github.com/brepositorium/chain-of-events/blob/main/packages/hardhat/contracts/ExtraNft.sol";
import "https://github.com/brepositorium/chain-of-events/blob/main/packages/hardhat/contracts/EventCreation.sol";

contract ExtraLottery is VRFConsumerBaseV2Plus {
	bytes32 internal keyHash;
	uint256 internal fee;

	uint32 callbackGasLimit = 500000;
	uint16 requestConfirmations = 3;
	uint32 numWords = 1;

	uint256[] public s_randomWords;
	uint256 public s_requestId;

	address public eventAdmin;
	ExtraNft public ticketContract;
	EventCreation public eventCreation;

	uint256 public s_subscriptionId;

	mapping(uint256 => address[]) public lotteryParticipants;
	uint256 public currentLotteryId;
	address public lastWinner;

	constructor(
		uint256 subscriptionId,
		address vrfCoordinator,
		bytes32 s_keyHash,
		address _ticketContractAddress,
		address _eventCreationAddress
	) VRFConsumerBaseV2Plus(vrfCoordinator) {
		s_subscriptionId = subscriptionId;
		keyHash = s_keyHash;

		ticketContract = ExtraNft(_ticketContractAddress);
		eventCreation = EventCreation(_eventCreationAddress);
		eventAdmin = msg.sender;
	}

	function initiateLottery() public {
		currentLotteryId++;

		uint256 totalTickets = eventCreation.getMintedTickets(
			ticketContract.eventId()
		);
		for (uint256 i = 0; i < totalTickets; i++) {
			if (ticketContract.ownerOf(i) != address(0)) {
				lotteryParticipants[currentLotteryId].push(
					ticketContract.ownerOf(i)
				);
			}
		}

		requestRandomWords();
	}

	function requestRandomWords() public returns (uint256 requestId) {
		s_requestId = s_vrfCoordinator.requestRandomWords(
			VRFV2PlusClient.RandomWordsRequest({
				keyHash: keyHash,
				subId: s_subscriptionId,
				requestConfirmations: requestConfirmations,
				callbackGasLimit: callbackGasLimit,
				numWords: numWords,
				extraArgs: VRFV2PlusClient._argsToBytes(
					VRFV2PlusClient.ExtraArgsV1({ nativePayment: false })
				)
			})
		);
		return requestId;
	}

	function fulfillRandomWords(
		uint256 requestId,
		uint256[] memory randomWords
	) internal override {
		require(requestId == s_requestId, "Request ID does not match");
		s_randomWords = randomWords;
		pickWinner();
	}

	function pickWinner() private returns (address) {
		uint256 numberOfParticipants = lotteryParticipants[currentLotteryId]
			.length;
		if (numberOfParticipants == 0) return address(0);

		uint256 winnerIndex = s_randomWords[0] % numberOfParticipants;
		address winner = lotteryParticipants[currentLotteryId][winnerIndex];
		lastWinner = winner;
		delete lotteryParticipants[currentLotteryId];
		return winner;
	}
}
