import ExtraNft from '../../../hardhat/artifacts/contracts/ExtraNft.sol/ExtraNft.json';
import PriceFeedHandler from '../../../hardhat/artifacts/contracts/PriceFeedHandler.sol/PriceFeedHandler.json';
import PriceAutomatedUpdate from '../../../hardhat/artifacts/contracts/PriceAutomatedUpdate.sol/PriceAutomatedUpdate.json';
import MintLimitAutomatedUpdate from '../../../hardhat/artifacts/contracts/MintLimitAutomatedUpdate.sol/MintLimitAutomatedUpdate.json';
import PauseAutomatedUpdate from '../../../hardhat/artifacts/contracts/PauseAutomatedUpdate.sol/PauseAutomatedUpdate.json';
import axios from "axios";
import { ethers } from 'ethers';

type PinataResponse = {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  };

const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
if (!privateKey) {
    throw new Error('Private key not found in environment variables');
}

const priceFeedHandlerAddress = process.env.NEXT_PUBLIC_PRICE_FEED_HANDLER_ADDRESS;

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
if (!rpcUrl) {
  throw new Error('RPC URL must be provided');
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

export const deployContract = async (name: string, symbol: string, uri: string, extraType: number, price: BigInt, eventAddress: string, eventId: BigInt) => {
  const factory = new ethers.ContractFactory(ExtraNft.abi, ExtraNft.bytecode, wallet);
  const contract = await factory.deploy(name, symbol, uri, extraType, price, eventAddress, eventId);
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const deployContractForType = async (extraAddress: string, updateType: string) => {
  const contractFactory = new ethers.ContractFactory(`${updateType}AutomatedUpdate.abi`, `${updateType}AutomatedUpdate.bytecode`, wallet);
  const contract = await contractFactory.deploy(extraAddress, process.env.NEXT_PUBLIC_LINK_TOKEN_INTERFACE, process.env.NEXT_PUBLIC_CHAINLINK_REGISTRAR);
  console.log("Contract deployed at ", await contract.getAddress());
  return await contract.getAddress();
};

export const registerUpkeepForType = async (chainlinkContractAddress: string, name: string, updateType: string) => {
  const contract = new ethers.Contract(chainlinkContractAddress, `${updateType}AutomatedUpdate.abi`, wallet);
  await contract.registerUpkeep(name, BigInt(500000), BigInt(2000000000000000000)); //2e18
  console.log("Upkeep registration");
};

export const schedulePriceUpdate = async (chainlinkContractAddress: string, newValue: BigInt, scheduleTime: number) => {
  const contract = new ethers.Contract(chainlinkContractAddress, PriceAutomatedUpdate.abi, wallet);
  await contract.scheduleUpdate(newValue, BigInt(scheduleTime));
  console.log("Schedule price update");
};

export const scheduleMintLimitUpdate = async (chainlinkContractAddress: string, newValue: BigInt, scheduleTime: number) => {
  const contract = new ethers.Contract(chainlinkContractAddress, MintLimitAutomatedUpdate.abi, wallet);
  await contract.scheduleUpdate(newValue, BigInt(scheduleTime));
  console.log("Schedule mint limit update");
};

export const schedulePause = async (chainlinkContractAddress: string, scheduleTime: number) => {
  const contract = new ethers.Contract(chainlinkContractAddress, PauseAutomatedUpdate.abi, wallet);
  await contract.scheduleUpdate(BigInt(scheduleTime));
  console.log("Schedule pause");
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

  export const getUnredeemedBalanceOf = async (contractAddress:string, callerAddress: string) => {
    const contract = new ethers.Contract(contractAddress, ExtraNft.abi, provider);
    try {
      const balance = await contract.getUnredeemedBalance(callerAddress);
      return balance;
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return null;
    }
  };

  export const transferExtra = async (extraAddress:string, to: string, amount: BigInt) => {
    const contract = new ethers.Contract(extraAddress, ExtraNft.abi, provider);
    try {
      const tx = await contract.bulkTransferUnredeemedTokens(to, amount);
      console.log('Transaction sent! Hash:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed!');
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const getEthPriceFromUsd = async (usdAmount: BigInt) => {
    
    const contract = new ethers.Contract(priceFeedHandlerAddress!, PriceFeedHandler.abi, provider);
    try {
      const valueInEth: BigInt = await contract.calculateEthAmount(usdAmount);
      console.log(valueInEth)
      return valueInEth;
    } catch (error) {
      console.error("Failed to fetch value in ETH:", error);
      return null;
    }
  };

  export const mintNft = async (extraAddress: string, to: string, ticketPrice: number, amount: number) => {
    const contract = new ethers.Contract(extraAddress, ExtraNft.abi, wallet);
    try {
        const totalPrice = ticketPrice * amount;
        const valueInEth = await getEthPriceFromUsd(BigInt(totalPrice * 100));

        const txResponse = await contract.safeMint(to, amount, { value: valueInEth });
        console.log('Transaction response:', txResponse);
        const receipt = await txResponse.wait();
        console.log('Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error pausing the contract:', error);
    }
  };

export const pauseSellingForExtra = async (address: string) => {
    const contract = new ethers.Contract(address, ExtraNft.abi, wallet);
    try {
        const txResponse = await contract.pause();
        console.log('Transaction response:', txResponse);
        const receipt = await txResponse.wait();
        console.log('Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error pausing the contract:', error);
    }
  };

  export const unpauseSellingForExtra = async (address: string) => {
    const contract = new ethers.Contract(address, ExtraNft.abi, wallet);
    try {
        const txResponse = await contract.unpause();
        console.log('Transaction response:', txResponse);
        const receipt = await txResponse.wait();
        console.log('Transaction receipt:', receipt);
    } catch (error) {
        console.error('Error pausing the contract:', error);
    }
  };

  export const getPausedStatus = async (contractAddress:string) => {
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
    data.append('file', file);
    const response = await axios.post<PinataResponse>(url, data, {
        headers: {
            'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
            'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_API_SECRET!
        }
    });
    console.log(`Pinned file at https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`);
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
};

  const pinJSONToIPFS = async (json: Object): Promise<string> => {
      const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
      const response = await axios.post<PinataResponse>(url, json, {
          headers: {
              'Content-Type': 'application/json',
              'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_API_KEY!,
              'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_API_SECRET!
          }
      });
      return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  };

  export const constructExtraUri = async(name: string, description: string, external_url: string, buyPrice: number, image: File) => {
      try {
          const imageUrl = await pinFileToIPFS(image);
          const metadata = {
              name,
              description,
              external_url,
              image: imageUrl,
              attributes: [{
                  trait_type: "Buying Price",
                  value: buyPrice
              }
          ]
          };
          const metadataUrl = await pinJSONToIPFS(metadata);
          console.log(`Metadata URL: ${metadataUrl}`);
          return metadataUrl;
      } catch (error) {
          console.error('Error pinning to IPFS:', error);
      }
  };