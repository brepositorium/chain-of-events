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

contract ExtraNft is ERC721, ERC721URIStorage, ERC721Pausable, Ownable {
	EventCreation eventCreation;

	uint256 private _nextTokenId;

	uint256 public price;

	uint256 public eventId;

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

	modifier isTokenMinted(uint256 tokenId) {
		if (_exists(tokenId) == false) {
			revert ExtraNonexistent(tokenId);
		}
		_;
	}

	constructor(
		string memory name,
		string memory symbol,
		uint256 extraType,
		uint256 _price,
		address _eventCreationAddress,
		uint256 _eventId
	) ERC721(name, symbol) Ownable() {
		eventCreation = EventCreation(_eventCreationAddress);
		eventCreation.addExtra(address(this), _eventId, extraType, msg.sender);
		eventId = _eventId;
		price = _price;
		EXTRA_TYPE = extraType;
	}

	function safeMint(
		address to,
		string memory uri
	) public payable enoughMoneySent(msg.value) whenNotPaused {
		uint256 tokenId = _nextTokenId++;
		redemptionMap[tokenId] = false;
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
