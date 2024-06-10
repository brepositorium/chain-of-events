import { useChainId } from "wagmi";

const useTheGraphUri = () => {
  const chainId = useChainId();

  switch (chainId) {
    case 8453:
      return process.env.NEXT_PUBLIC_THE_GRAPH_URI_BASE;
    case 43113:
      return process.env.NEXT_PUBLIC_THE_GRAPH_URI_FUJI;
    default:
      return process.env.NEXT_PUBLIC_THE_GRAPH_URI_BASE;
  }
};

export default useTheGraphUri;
