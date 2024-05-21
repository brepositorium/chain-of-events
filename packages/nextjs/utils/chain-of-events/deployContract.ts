import ExtraNft from '../../../hardhat/artifacts/contracts/ExtraNft.sol/ExtraNft.json';
import axios from "axios";
import { ContractRunner, ethers, parseEther, parseUnits } from 'ethers';

type PinataResponse = {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  };

const privateKey = process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY;
if (!privateKey) {
    throw new Error('Private key not found in environment variables');
}

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

export const fetchExtraDetails = async (address: string) => {
  const contract = new ethers.Contract(address, ExtraNft.abi, provider);
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const price = await contract.price();
    const extraType = await contract.EXTRA_TYPE();
    const uri = await contract.uri();
    console.log(extraType)
    return { name, symbol, price, extraType, uri };
  } catch (error) {
    console.error("Failed to fetch contract data:", error);
    return null;
  }
};

export const getBalanceOf = async (contractAddress:string, callerAddress: string) => {
    const contract = new ethers.Contract(contractAddress, ExtraNft.abi, provider);
    try {
      const balance = await contract.balanceOf(callerAddress);
      console.log(balance);
      return balance;
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      return null;
    }
  };

export const mintNft = async (address: string, to: string, ticketPrice: string) => {
    const contract = new ethers.Contract(address, ExtraNft.abi, wallet);
    try {
        const txResponse = await contract.safeMint(to, { value: ethers.parseUnits(ticketPrice, 0) });
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