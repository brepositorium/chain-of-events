import BundleDiscounts from "../../../hardhat/artifacts/contracts/BundleDiscounts.sol/BundleDiscounts.json";
import EventCreation from "../../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import ExtraNft from "../../../hardhat/artifacts/contracts/ExtraNft.sol/ExtraNft.json";
import MintLimitAutomatedUpdate from "../../../hardhat/artifacts/contracts/MintLimitAutomatedUpdate.sol/MintLimitAutomatedUpdate.json";
import Participants from "../../../hardhat/artifacts/contracts/Participants.sol/Participants.json";
import PauseAutomatedUpdate from "../../../hardhat/artifacts/contracts/PauseAutomatedUpdate.sol/PauseAutomatedUpdate.json";
import PriceAutomatedUpdate from "../../../hardhat/artifacts/contracts/PriceAutomatedUpdate.sol/PriceAutomatedUpdate.json";
import PriceFeedHandler from "../../../hardhat/artifacts/contracts/PriceFeedHandler.sol/PriceFeedHandler.json";
import indexerAbi from "./indexerAbi.json";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);

export async function checkVerifiedAccount(userAddress: string) {
  const verifiedAccountSchemaId = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";
  const indexerAddress = "0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C";

  const attestationIndexerContract = new ethers.Contract(indexerAddress, indexerAbi, provider);
  try {
    const attestationUid = await attestationIndexerContract.getAttestationUid(userAddress, verifiedAccountSchemaId);

    const isVerified = attestationUid !== "0x0000000000000000000000000000000000000000000000000000000000000000";

    return isVerified;
  } catch (error) {
    console.error("Error checking verified account:", error);
    return false;
  }
}

const loadContractArtifacts = async (updateType: any) => {
  if (
    !"PriceAutomatedUpdate".includes(updateType.toString()) &&
    !"MintLimitAutomatedUpdate".includes(updateType.toString()) &&
    !"PauseAutomatedUpdate".includes(updateType.toString())
  ) {
    throw new Error("Unsupported update type");
  }
  const module = await import(
    `../../../hardhat/artifacts/contracts/${updateType}AutomatedUpdate.sol/${updateType}AutomatedUpdate.json`
  );
  return module.default;
};

export const createEvent = async (
  name: string,
  description: string,
  location: string,
  logoUrl: string,
  numberOfTickets: BigInt,
  startTimestamp: BigInt,
  endTimestamp: BigInt,
  eventCreationAddress: string,
) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.createEvent(name, description, location, logoUrl, numberOfTickets, startTimestamp, endTimestamp);
  console.log("Create event");
};

export const getEventAdmin = async (address: string, eventId: number) => {
  const contract = new ethers.Contract(address, EventCreation.abi, provider);

  try {
    const admin = await contract.getAdmin(BigInt(eventId));

    return { admin };
  } catch (error) {
    console.error("Failed to fetch event admin:", error);
    return null;
  }
};

export const changeDescription = async (newDescription: string, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeDescription(newDescription, eventId);
  console.log("Change description");
};

export const changeNumberOfTickets = async (
  newNumberOfTickets: string,
  eventId: BigInt,
  eventCreationAddress: string,
) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeNumberOfTickets(newNumberOfTickets, eventId);
  console.log("Change number of tickets");
};

export const changeLocation = async (newLocation: string, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeLocation(newLocation, eventId);
  console.log("Change location");
};

export const changeLogo = async (newLogo: string, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeLogo(newLogo, eventId);
  console.log("Change logo");
};

export const changeStartTime = async (newStartTime: BigInt, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeStartTime(newStartTime, eventId);
  console.log("Change start time");
};

export const changeEndTime = async (newEndTime: BigInt, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.changeEndTime(newEndTime, eventId);
  console.log("Change end time");
};

export const addAllowedAddress = async (allowedAddress: string, eventId: BigInt, eventCreationAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.addAllowedAddress(allowedAddress, eventId);
  console.log("Add allowed address");
};

export const createAndRegisterExtra = async (
  name: string,
  symbol: string,
  uri: string,
  extraType: number,
  price: number,
  eventId: BigInt,
  eventCreationAddress: string,
  priceFeedHandlerAddress: string,
  participantsContractAddress: string,
) => {
  console.log("Create extra");
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.createAndRegisterExtra(
    name,
    symbol,
    uri,
    extraType,
    BigInt(Math.round(price * 100)),
    eventId,
    priceFeedHandlerAddress,
    participantsContractAddress,
  );
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const createAndRegisterBundle = async (
  eventCreationAddress: string,
  eventId: BigInt,
  name: string,
  price: number,
  priceFeedHandlerAddress: string,
) => {
  console.log("Create bundle");
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(eventCreationAddress, EventCreation.abi, signer);
  await contract.createAndRegisterBundle(name, BigInt(Math.round(price * 100)), eventId, priceFeedHandlerAddress);
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const deployContractForType = async (extraAddress: string, updateType: string, chainId: number) => {
  const signer = await provider.getSigner();
  const { abi, bytecode } = await loadContractArtifacts(updateType);
  const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
  const [linkTokenInterface, chainlinkRegistrar] = getChainlinkAddresses(chainId);

  const contract = await contractFactory.deploy(extraAddress, linkTokenInterface, chainlinkRegistrar);
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const registerUpkeepForType = async (chainlinkContractAddress: string, name: string, updateType: string) => {
  const signer = await provider.getSigner();
  const { abi } = await loadContractArtifacts(updateType);
  const contract = new ethers.Contract(chainlinkContractAddress, abi, signer);
  await contract.registerUpkeep(name, BigInt(500000), BigInt(2000000000000000000)); //2e18
  console.log("Upkeep registration");
};

export const schedulePriceUpdate = async (chainlinkContractAddress: string, newValue: number, scheduleTime: number) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(chainlinkContractAddress, PriceAutomatedUpdate.abi, signer);
  await contract.scheduleUpdate(BigInt(newValue), BigInt(scheduleTime));
  console.log("Schedule price update");
};

export const scheduleMintLimitUpdate = async (
  chainlinkContractAddress: string,
  newValue: number,
  scheduleTime: number,
) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(chainlinkContractAddress, MintLimitAutomatedUpdate.abi, signer);
  await contract.scheduleUpdate(BigInt(newValue), BigInt(scheduleTime));
  console.log("Schedule mint limit update");
};

export const schedulePause = async (extraAddress: string, scheduleTime: number) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, PauseAutomatedUpdate.abi, signer);
  await contract.scheduleUpdate(BigInt(scheduleTime));
  console.log("Schedule pause");
};

export const updatePrice = async (extraAddress: string, newPrice: number) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.updatePrice(BigInt(Math.round(newPrice * 100)));
  console.log("Update price");
};

export const updateMintLimit = async (extraAddress: string, newMintLimit: number) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.updateMintLimit(BigInt(newMintLimit));
  console.log("Update price");
};

export const addApprovedChainlinkContract = async (chainlinkContractAddress: string, extraAddress: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.addApprovedChainlinkContract(chainlinkContractAddress);
  console.log("Add approved Chainlink Contract");
};

export const fetchExtraNameAndAddress = async (address: string) => {
  const contract = new ethers.Contract(address, ExtraNft.abi, provider);
  try {
    const name = await contract.name();

    return { name, address };
  } catch (error) {
    console.error("Failed to fetch contract data:", error);
    return null;
  }
};

export const fetchExtraDetails = async (address: string) => {
  const contract = new ethers.Contract(address, ExtraNft.abi, provider);
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const price = await contract.price();
    const extraType = await contract.EXTRA_TYPE();
    const uri = await contract.uri();
    const response = await fetch(uri);
    const jsonData = await response.json();

    return { name, symbol, price, extraType, uri, description: jsonData.description, imageUrl: jsonData.image };
  } catch (error) {
    console.error("Failed to fetch contract data:", error);
    return null;
  }
};

export const fetchBundleDetails = async (address: string) => {
  const contract = new ethers.Contract(address, BundleDiscounts.abi, provider);
  try {
    const name = await contract.name();
    const price = await contract.price();
    return { name, price };
  } catch (error) {
    console.error("Failed to fetch bundle data:", error);
    return null;
  }
};

export const fetchBundleBasics = async (bundleAddress: string) => {
  const contract = new ethers.Contract(bundleAddress, BundleDiscounts.abi, provider);
  try {
    const name = await contract.name();
    const price = await contract.price();
    let extrasAddresses = [];
    try {
      extrasAddresses = await contract.getExtras();
    } catch (error) {
      console.warn("No extras found for this bundle", error);
    }
    return {
      name,
      price,
      extrasAddresses,
    };
  } catch (error) {
    console.error("Failed to fetch bundle details:", error);
    return null;
  }
};

export const fetchParticipants = async (address: string, eventId: number) => {
  const contract = new ethers.Contract(address, Participants.abi, provider);
  try {
    const participants = await contract.getParticipants(BigInt(eventId));
    return participants;
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return null;
  }
};

export const fetchParticipantsTickets = async (contractAddress: string, participantAddress: string) => {
  const contract = new ethers.Contract(contractAddress, Participants.abi, provider);
  try {
    const tickets = await contract.getReedemedTicketsOfParticipant(participantAddress);
    return tickets;
  } catch (error) {
    console.error("Failed to fetch redeemed tickets:", error);
    return null;
  }
};

export const addExtraToBundle = async (bundleAddress: string, extraAddress: string, amount: number) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(bundleAddress, BundleDiscounts.abi, signer);
  await contract.addExtraToBundle(extraAddress, BigInt(amount));
  console.log("Add Extra to Bundle");
};

export const getUnredeemedBalanceOf = async (contractAddress: string, callerAddress: string) => {
  const contract = new ethers.Contract(contractAddress, ExtraNft.abi, provider);
  try {
    const balance = await contract.getUnredeemedBalance(callerAddress);
    return balance;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
    return null;
  }
};

export const getExtraOwner = async (extraAddress: string) => {
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, provider);
  try {
    const owner = await contract.owner();
    return owner;
  } catch (error) {
    console.error("Failed to fetch owner:", error);
    return null;
  }
};

export const transferExtra = async (extraAddress: string, to: string, amount: BigInt) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  try {
    const tx = await contract.bulkTransferUnredeemedTokens(to, amount);
    console.log("Transaction sent! Hash:", tx.hash);

    await tx.wait();
    console.log("Transaction confirmed!");
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
};

export const redeemExtra = async (extraAddress: string, extraOwner: string, amount: BigInt) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  try {
    const tx = await contract.bulkRedeem(extraOwner, amount);
    console.log("Transaction sent! Hash:", tx.hash);

    await tx.wait();
    console.log("Transaction confirmed!");
    toast.success("Redeemed");
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
};

const getEthPriceFromUsd = async (usdAmount: BigInt, priceFeedHandlerAddress: string) => {
  const contract = new ethers.Contract(priceFeedHandlerAddress, PriceFeedHandler.abi, provider);
  try {
    const valueInEth: BigInt = await contract.calculateEthAmount(usdAmount);
    return valueInEth;
  } catch (error) {
    console.error("Failed to fetch value in ETH:", error);
    return null;
  }
};

export const mintNft = async (
  extraAddress: string,
  to: string,
  ticketPrice: number,
  amount: number,
  priceFeedHandlerAddress: string,
) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  try {
    const totalPrice = ticketPrice * amount;
    const valueInEth = await getEthPriceFromUsd(BigInt(Math.round(totalPrice * 100)), priceFeedHandlerAddress);
    const txResponse = await contract.safeMint(to, amount, { value: valueInEth });
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error minting:", error);
    throw error;
  }
};

export const mintBundle = async (
  to: string,
  bundlePrice: number,
  bundleAddress: string,
  priceFeedHandlerAddress: string,
) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(bundleAddress, BundleDiscounts.abi, signer);
  try {
    const valueInEth = await getEthPriceFromUsd(BigInt(Math.round(bundlePrice)), priceFeedHandlerAddress);
    const txResponse = await contract.mintBundle(to, { value: valueInEth });
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error minting:", error);
    throw error;
  }
};

export const pauseSellingForExtra = async (address: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.pause();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
    throw error;
  }
};

export const unpauseSellingForExtra = async (address: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.unpause();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
    throw error;
  }
};

export const withdrawFundsFromExtra = async (address: string) => {
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.withdraw();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
    throw error;
  }
};

export const getPausedStatus = async (contractAddress: string) => {
  const contract = new ethers.Contract(contractAddress, ExtraNft.abi, provider);
  try {
    const pausedStatus = await contract.paused();

    return pausedStatus;
  } catch (error) {
    console.error("Failed to fetch paused status:", error);
    return null;
  }
};

export const pinFileToIPFS = async (file: File): Promise<string> => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", file);
  const response = await axios.post<PinataResponse>(url, data, {
    headers: {
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
      pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
    },
  });
  console.log(`Pinned file at https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
};

const pinJSONToIPFS = async (json: Object): Promise<string> => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  const response = await axios.post<PinataResponse>(url, json, {
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
      pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_API_SECRET!,
    },
  });
  return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
};

export const constructExtraUri = async (
  name: string,
  description: string,
  external_url: string,
  buyPrice: number,
  image: File,
) => {
  try {
    const imageUrl = await pinFileToIPFS(image);
    const metadata = {
      name,
      description,
      external_url,
      image: imageUrl,
      attributes: [
        {
          trait_type: "Buying Price",
          value: buyPrice,
        },
      ],
    };
    const metadataUrl = await pinJSONToIPFS(metadata);
    console.log(`Metadata URL: ${metadataUrl}`);
    return metadataUrl;
  } catch (error) {
    console.error("Error pinning to IPFS:", error);
  }
};

const getChainlinkAddresses = (chainId: number): [string, string] => {
  switch (chainId) {
    case 8453:
      return [process.env.NEXT_PUBLIC_LINK_TOKEN_INTERFACE_BASE!, process.env.NEXT_PUBLIC_CHAINLINK_REGISTRAR_BASE!];
    case 43113:
      return [process.env.NEXT_PUBLIC_LINK_TOKEN_INTERFACE_FUJI!, process.env.NEXT_PUBLIC_CHAINLINK_REGISTRAR_FUJI!];
    default:
      return [process.env.NEXT_PUBLIC_LINK_TOKEN_INTERFACE_BASE!, process.env.NEXT_PUBLIC_CHAINLINK_REGISTRAR_BASE!];
  }
};
