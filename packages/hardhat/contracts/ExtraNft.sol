// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EventCreation.sol";
import "./PriceFeedHandler.sol";

error NotEnoughMoneySent(uint256 moneySent, uint256 price);
error NotOnAllowList(uint256 eventId, address sendersAddress);
error ExtraNonexistent(uint256 tokenId);
error NumberOfTicketsLimitReached(uint256 eventId);
error MintLimitReached(uint256 currentMintCount);
error NotEnoughUnredeemedTokens(address _ticketOwner);

/// @title A contract for creating and managing ERC721 tokens for events
/// @author radub.xyz
/// @notice This contract allows for the minting and management of event-specific NFTs like tickets and consumables
/// @dev Extends OpenZeppelin's ERC721, ERC721URIStorage, ERC721Pausable, and ERC721Enumerable for comprehensive NFT functionality
contract ExtraNft is
	ERC721,
	ERC721URIStorage,
	ERC721Pausable,
	ERC721Enumerable,
	Ownable
{
	EventCreation eventCreation;
	PriceFeedHandler public priceFeedHandler;

	uint256 private _nextTokenId;

	uint256 public price;

	uint256 public eventId;

	string public uri;

	uint256 public mintLimit = type(uint256).max;

	mapping(address => bool) public approvedChainlinkContracts;

	//0 for ticket, 1 for consumable
	uint256 public immutable EXTRA_TYPE;

	mapping(uint256 => bool) public redemptionMap;

	modifier enoughMoneySent(uint256 moneySent, uint256 amount) {
		uint256 requiredWei = priceFeedHandler.calculateEthAmount(price);
		if (moneySent < requiredWei * amount) {
			revert NotEnoughMoneySent(moneySent, price);
		}
		_;
	}

	modifier onlyAllowList(uint256 _eventId) {
		if (eventCreation.isAllowed(_eventId, msg.sender) == false) {
			revert NotOnAllowList(eventId, msg.sender);
		}
		_;
	}

	modifier isTokenMinted(uint256 _tokenId) {
		if (ownerOf(_tokenId) == address(0)) {
			revert ExtraNonexistent(_tokenId);
		}
		_;
	}

	modifier checkTicketsLimitNotReached(
		uint256 _eventId,
		uint256 amountToMint
	) {
		if (
			eventCreation.getMintedTickets(_eventId) + amountToMint >
			eventCreation.getNumberOfTickets(_eventId)
		) {
			revert NumberOfTicketsLimitReached(_eventId);
		}
		_;
	}

	modifier checkMintLimit(uint256 _amount) {
		if (
			_nextTokenId + _amount > mintLimit && mintLimit != type(uint256).max
		) {
			revert MintLimitReached(_nextTokenId);
		}
		_;
	}

	modifier onlyOwnerOrChainlinkContract() {
		if (
			msg.sender != owner() &&
			approvedChainlinkContracts[msg.sender] != true
		) {
			revert OwnableUnauthorizedAccount(_msgSender());
		}
		_;
	}

	modifier hasEnoughUnredeemedTokens(address _ticketOwner, uint256 _amount) {
		if (getUnredeemedBalance(_ticketOwner) < _amount) {
			revert NotEnoughUnredeemedTokens(_ticketOwner);
		}
		_;
	}

	/// @notice Creates a new ExtraNft contract
	/// @dev Sets ownership to the creator and initializes connected contracts
	/// @param _name Name of the token collection
	/// @param _symbol Symbol of the token collection
	/// @param _uri Base URI for token metadata
	/// @param _extraType Type of the extra (0 for tickets, 1 for consumables)
	/// @param _price Initial price of the tokens
	/// @param _eventCreationAddress Address of the EventCreation contract
	/// @param _eventId ID of the event related to these tokens
	/// @param _priceFeedHandlerAddress Address of the PriceFeedHandler contract
	constructor(
		string memory _name,
		string memory _symbol,
		string memory _uri,
		uint256 _extraType,
		uint256 _price,
		address _eventCreationAddress,
		uint256 _eventId,
		address _priceFeedHandlerAddress
	) ERC721(_name, _symbol) Ownable(msg.sender) {
		eventCreation = EventCreation(_eventCreationAddress);
		eventId = _eventId;
		price = _price;
		uri = _uri;
		EXTRA_TYPE = _extraType;
		priceFeedHandler = PriceFeedHandler(_priceFeedHandlerAddress);
		eventCreation.addExtra(address(this), _eventId, msg.sender);
	}

	/// @notice Mints new tokens
	/// @dev Ensures not paused, checks tickets limit and mint limit before minting
	/// @param to Address to mint tokens to
	/// @param _amount Number of tokens to mint
	function safeMint(
		address to,
		uint256 _amount
	)
		public
		payable
		enoughMoneySent(msg.value, _amount)
		whenNotPaused
		checkTicketsLimitNotReached(eventId, _amount)
		checkMintLimit(_amount)
	{
		for (uint i = 0; i < _amount; i++) {
			uint256 tokenId = _nextTokenId++;

			redemptionMap[tokenId] = false;

			if (EXTRA_TYPE == 0) {
				eventCreation.increaseMintedTickets(eventId);
			}

			_safeMint(to, tokenId);
			_setTokenURI(tokenId, uri);
		}
	}

	/// @notice Adds a Chainlink contract to the approved list for direct interactions
	/// @dev This function is restricted to the contract owner
	/// @param chainlinkContractAddress The address of the Chainlink contract to approve
	function addApprovedChainlinkContract(
		address chainlinkContractAddress
	) public onlyOwner {
		approvedChainlinkContracts[chainlinkContractAddress] = true;
	}

	/// @notice Redeems a token to mark it as used
	/// @dev Can only be called by an address on the allow list for the event associated with the token
	/// @param tokenId The ID of the token to redeem
	function redeem(
		uint256 tokenId
	) public onlyAllowList(eventId) isTokenMinted(tokenId) {
		redemptionMap[tokenId] = true;
	}

	function updatePrice(
		uint256 updatedPrice
	) public onlyOwnerOrChainlinkContract {
		price = updatedPrice;
	}

	function updateUri(
		string calldata updatedUri
	) public onlyOwnerOrChainlinkContract {
		uri = updatedUri;
	}

	function updateMintLimit(
		uint256 updatedLimit
	) public onlyOwnerOrChainlinkContract {
		mintLimit = updatedLimit;
	}

	function pause() public onlyOwnerOrChainlinkContract {
		_pause();
	}

	function unpause() public onlyOwnerOrChainlinkContract {
		_unpause();
	}

	function withdraw() public payable onlyOwner {
		uint256 balance = address(this).balance;
		require(balance > 0, "No ether left to withdraw");
		(bool sent, ) = msg.sender.call{ value: balance }("");
		require(sent, "Failed to send Ether");
	}

	function tokenOfOwnerByIndex(
		address owner,
		uint256 index
	) public view override returns (uint256) {
		return super.tokenOfOwnerByIndex(owner, index);
	}

	function ownerOf(
		uint256 tokenId
	) public view override(IERC721, ERC721) returns (address) {
		return super._ownerOf(tokenId);
	}

	/// @notice Calculates the number of unredeemed tokens owned by a specific address
	/// @dev Iterates over all tokens owned by the address and counts those not yet redeemed
	/// @param _ticketOwner The owner of the tokens to check
	/// @return The count of unredeemed tokens
	function getUnredeemedBalance(
		address _ticketOwner
	) public view returns (uint256) {
		uint256 unredeemedBalance;
		for (uint256 i; i < balanceOf(_ticketOwner); i++) {
			uint256 _tokenId = tokenOfOwnerByIndex(_ticketOwner, i);
			if (redemptionMap[_tokenId] == false) {
				unredeemedBalance++;
			}
		}
		return unredeemedBalance;
	}

	/// @notice Transfers a specified number of unredeemed tokens from the caller to another address
	/// @dev Ensures the sender has enough unredeemed tokens before transferring
	/// @param _to The recipient address
	/// @param _amount The number of unredeemed tokens to transfer
	function bulkTransferUnredeemedTokens(
		address _to,
		uint256 _amount
	) public hasEnoughUnredeemedTokens(msg.sender, _amount) {
		uint256 transfered;
		uint256 balance = balanceOf(msg.sender);
		for (uint256 i; i <= balance; i++) {
			if (transfered < _amount) {
				uint256 _tokenId = tokenOfOwnerByIndex(msg.sender, i);
				if (redemptionMap[_tokenId] == false) {
					transferFrom(msg.sender, _to, _tokenId);
					transfered++;
				}
			}
		}
	}

	/// @notice Redeems multiple tokens for a given ticket owner
	/// @dev This function ensures that enough unredeemed tokens are available before redeeming
	/// @param _ticketOwner The owner of the tokens to be redeemed
	/// @param _amount The number of tokens to redeem
	function bulkRedeem(
		address _ticketOwner,
		uint256 _amount
	)
		public
		onlyAllowList(eventId)
		hasEnoughUnredeemedTokens(_ticketOwner, _amount)
	{
		uint256 redeemed;
		uint256 balance = balanceOf(_ticketOwner);
		for (uint256 i; i <= balance; i++) {
			if (redeemed < _amount) {
				uint256 _tokenId = tokenOfOwnerByIndex(_ticketOwner, i);
				if (redemptionMap[_tokenId] == false) {
					redeem(_tokenId);
					redeemed++;
				}
			}
		}
	}

	// The following functions are overrides required by Solidity.

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(ERC721, ERC721URIStorage, ERC721Enumerable)
		returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}

	function _update(
		address to,
		uint256 tokenId,
		address auth
	)
		internal
		override(ERC721, ERC721Pausable, ERC721Enumerable)
		returns (address)
	{
		return super._update(to, tokenId, auth);
	}

	function _increaseBalance(
		address account,
		uint128 value
	) internal override(ERC721, ERC721Enumerable) {
		super._increaseBalance(account, value);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}
}
