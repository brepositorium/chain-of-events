// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { VRFConsumerBaseV2Plus } from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import { VRFV2PlusClient } from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "./ExtraNft.sol";
import "./EventCreation.sol";

contract EventLottery is VRFConsumerBaseV2Plus {
	bytes32 internal keyHash;
	uint256 internal fee;

	uint32 callbackGasLimit = 500000;
	uint16 requestConfirmations = 3;
	uint32 numWords = 1;

	uint256[] public s_randomWords;
	uint256 public s_requestId;

	address public eventAdmin;
	ExtraNft public extraContract;
	EventCreation public eventCreation;

	uint256 public s_subscriptionId;

	address vrfCoordinator = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
	bytes32 s_keyHash =
		0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887;

	mapping(uint256 => address[]) public lotteryParticipants;
	uint256 public currentLotteryId;
	address public lastWinner;

	constructor(
		uint256 subscriptionId,
		address _extraContractAddress,
		address _eventCreationAddress
	) VRFConsumerBaseV2Plus(vrfCoordinator) {
		s_subscriptionId = subscriptionId;
		keyHash = s_keyHash;

		extraContract = ExtraNft(_extraContractAddress);
		eventCreation = EventCreation(_eventCreationAddress);
	}

	function initiateLottery() public onlyOwnerOrCoordinator {
		currentLotteryId++;

		uint256 totalTickets = eventCreation.getMintedTickets(
			extraContract.eventId()
		);
		for (uint256 i = 0; i < totalTickets; i++) {
			if (extraContract.ownerOf(i) != address(0)) {
				lotteryParticipants[currentLotteryId].push(
					extraContract.ownerOf(i)
				);
			}
		}

		requestRandomWords();
	}

	function requestRandomWords() private returns (uint256 requestId) {
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
