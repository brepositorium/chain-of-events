import { useChainId } from "wagmi";

const useParticipantsContractAddress = () => {
  const chainId = useChainId();

  switch (chainId) {
    case 8453:
      return process.env.NEXT_PUBLIC_PARTICIPANTS_CONTRACT_ADDRESS_BASE;
    case 43113:
      return process.env.NEXT_PUBLIC_PARTICIPANTS_CONTRACT_ADDRESS_FUJI;
    default:
      return process.env.NEXT_PUBLIC_PARTICIPANTS_CONTRACT_ADDRESS_BASE;
  }
};

export default useParticipantsContractAddress;
