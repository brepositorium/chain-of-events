// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EventCreation.sol";

error NotEnoughMoneySent(uint256 moneySent, uint256 price);
error NotOnAllowList(uint256 eventId, address sendersAddress);
error ExtraNonexistent(uint256 tokenId);
error NumberOfTicketsLimitReached(uint256 eventId);
error MintLimitReached(uint256 currentMintCount);

contract ExtraNft is ERC721, ERC721URIStorage, ERC721Pausable, Ownable {
	EventCreation eventCreation;

	uint256 private _nextTokenId;

	uint256 public price;

	uint256 public eventId;

	string public uri;

	uint256 public mintLimit = type(uint256).max;

	//0 for ticket, 1 for consumable
	uint256 public immutable EXTRA_TYPE;

	mapping(uint256 => bool) public redemptionMap;

	modifier enoughMoneySent(uint256 moneySent) {
		if (moneySent < price) {
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
		if (_exists(_tokenId) == false) {
			revert ExtraNonexistent(_tokenId);
		}
		_;
	}

	modifier checkTicketsLimitNotReached(uint256 _eventId) {
		if (
			eventCreation.getMintedTickets(_eventId) >=
			eventCreation.getNumberOfTickets(_eventId)
		) {
			revert NumberOfTicketsLimitReached(_eventId);
		}
		_;
	}

	modifier checkMintLimit() {
		if (_nextTokenId >= mintLimit && mintLimit != type(uint256).max) {
			revert MintLimitReached(_nextTokenId);
		}
		_;
	}

	constructor(
		string memory _name,
		string memory _symbol,
		string memory _uri,
		uint256 _extraType,
		uint256 _price,
		address _eventCreationAddress,
		uint256 _eventId
	) ERC721(_name, _symbol) Ownable() {
		eventCreation = EventCreation(_eventCreationAddress);
		eventCreation.addExtra(address(this), _eventId, msg.sender);
		eventId = _eventId;
		price = _price;
		uri = _uri;
		EXTRA_TYPE = _extraType;
	}

	function safeMint(
		address to
	)
		public
		payable
		enoughMoneySent(msg.value)
		whenNotPaused
		checkTicketsLimitNotReached(eventId)
		checkMintLimit
	{
		uint256 tokenId = _nextTokenId++;

		redemptionMap[tokenId] = false;

		if (EXTRA_TYPE == 0) {
			eventCreation.increaseMintedTickets(eventId);
		}

		_safeMint(to, tokenId);
		_setTokenURI(tokenId, uri);
	}

	function redeem(
		uint256 tokenId
	) public onlyAllowList(eventId) isTokenMinted(tokenId) {
		redemptionMap[tokenId] = true;
	}

	function updatePrice(uint256 updatedPrice) public onlyOwner {
		price = updatedPrice;
	}

	function updateUri(string calldata updatedUri) public onlyOwner {
		uri = updatedUri;
	}

	function updateMintLimit(uint256 updatedLimit) public onlyOwner {
		mintLimit = updatedLimit;
	}

	function pause() public onlyOwner {
		_pause();
	}

	function unpause() public onlyOwner {
		_unpause();
	}

	// The following functions are overrides required by Solidity.

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	) public view override(ERC721, ERC721URIStorage) returns (bool) {
		return super.supportsInterface(interfaceId);
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 firstTokenId,
		uint256 batchSize
	) internal override(ERC721, ERC721Pausable) {}

	function _exists(
		uint256 tokenId
	) internal view override(ERC721) returns (bool) {
		return super._exists(tokenId);
	}

	function owner() public view override(Ownable) returns (address) {
		return super.owner();
	}
}
