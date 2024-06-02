import ExtraNft from "../../../hardhat/artifacts/contracts/ExtraNft.sol/ExtraNft.json";
import MintLimitAutomatedUpdate from "../../../hardhat/artifacts/contracts/MintLimitAutomatedUpdate.sol/MintLimitAutomatedUpdate.json";
import PauseAutomatedUpdate from "../../../hardhat/artifacts/contracts/PauseAutomatedUpdate.sol/PauseAutomatedUpdate.json";
import PriceAutomatedUpdate from "../../../hardhat/artifacts/contracts/PriceAutomatedUpdate.sol/PriceAutomatedUpdate.json";
import PriceFeedHandler from "../../../hardhat/artifacts/contracts/PriceFeedHandler.sol/PriceFeedHandler.json";
import axios from "axios";
import { ethers } from "ethers";
import toast from "react-hot-toast";

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Private key not found in environment variables");
}

const priceFeedHandlerAddress = process.env.NEXT_PUBLIC_PRICE_FEED_HANDLER_ADDRESS;

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (!rpcUrl) {
  throw new Error("RPC URL must be provided");
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
let wprovider: any;
if (typeof window !== "undefined") {
  const wprovider = new ethers.BrowserProvider(window.ethereum);
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

export const deployContract = async (
  name: string,
  symbol: string,
  uri: string,
  extraType: number,
  price: number,
  eventAddress: string,
  eventId: BigInt,
  priceFeedHandlerAddress?: string,
) => {
  const signer = await wprovider.getSigner();
  const factory = new ethers.ContractFactory(ExtraNft.abi, ExtraNft.bytecode, signer);
  const contract = await factory.deploy(
    name,
    symbol,
    uri,
    extraType,
    BigInt(price * 100),
    eventAddress,
    eventId,
    priceFeedHandlerAddress,
  );
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const deployContractForType = async (extraAddress: string, updateType: string) => {
  const signer = await wprovider.getSigner();
  const { abi, bytecode } = await loadContractArtifacts(updateType);
  const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await contractFactory.deploy(
    extraAddress,
    process.env.NEXT_PUBLIC_LINK_TOKEN_INTERFACE,
    process.env.NEXT_PUBLIC_CHAINLINK_REGISTRAR,
  );
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const registerUpkeepForType = async (chainlinkContractAddress: string, name: string, updateType: string) => {
  const signer = await wprovider.getSigner();
  const { abi } = await loadContractArtifacts(updateType);
  const contract = new ethers.Contract(chainlinkContractAddress, abi, signer);
  await contract.registerUpkeep(name, BigInt(500000), BigInt(2000000000000000000)); //2e18
  console.log("Upkeep registration");
};

export const schedulePriceUpdate = async (chainlinkContractAddress: string, newValue: number, scheduleTime: number) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(chainlinkContractAddress, PriceAutomatedUpdate.abi, signer);
  console.log(chainlinkContractAddress);
  await contract.scheduleUpdate(BigInt(newValue), BigInt(scheduleTime));
  console.log("Schedule price update");
};

export const scheduleMintLimitUpdate = async (
  chainlinkContractAddress: string,
  newValue: number,
  scheduleTime: number,
) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(chainlinkContractAddress, MintLimitAutomatedUpdate.abi, signer);
  await contract.scheduleUpdate(BigInt(newValue), BigInt(scheduleTime));
  console.log("Schedule mint limit update");
};

export const schedulePause = async (extraAddress: string, scheduleTime: number) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(extraAddress, PauseAutomatedUpdate.abi, signer);
  await contract.scheduleUpdate(BigInt(scheduleTime));
  console.log("Schedule pause");
};

export const updatePrice = async (extraAddress: string, newPrice: number) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.updatePrice(BigInt(newPrice * 100));
  console.log("Update price");
};

export const updateMintLimit = async (extraAddress: string, newMintLimit: number) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.updateMintLimit(BigInt(newMintLimit));
  console.log("Update price");
};

export const addApprovedChainlinkContract = async (chainlinkContractAddress: string, extraAddress: string) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  await contract.addApprovedChainlinkContract(chainlinkContractAddress);
  console.log("Add approved Chainlink Contract");
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
  const signer = await wprovider.getSigner();
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
  const signer = await wprovider.getSigner();
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

const getEthPriceFromUsd = async (usdAmount: BigInt) => {
  const contract = new ethers.Contract(priceFeedHandlerAddress!, PriceFeedHandler.abi, provider);
  try {
    const valueInEth: BigInt = await contract.calculateEthAmount(usdAmount);
    return valueInEth;
  } catch (error) {
    console.error("Failed to fetch value in ETH:", error);
    return null;
  }
};

export const mintNft = async (extraAddress: string, to: string, ticketPrice: number, amount: number) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(extraAddress, ExtraNft.abi, signer);
  try {
    const totalPrice = ticketPrice * amount;
    const valueInEth = await getEthPriceFromUsd(BigInt(totalPrice * 100));
    console.log(extraAddress);
    const txResponse = await contract.safeMint(to, amount, { value: valueInEth });
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
  }
};

export const pauseSellingForExtra = async (address: string) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.pause();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
  }
};

export const unpauseSellingForExtra = async (address: string) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.unpause();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
  }
};

export const withdrawFundsFromExtra = async (address: string) => {
  const signer = await wprovider.getSigner();
  const contract = new ethers.Contract(address, ExtraNft.abi, signer);
  try {
    const txResponse = await contract.withdraw();
    console.log("Transaction response:", txResponse);
    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);
  } catch (error) {
    console.error("Error pausing the contract:", error);
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
