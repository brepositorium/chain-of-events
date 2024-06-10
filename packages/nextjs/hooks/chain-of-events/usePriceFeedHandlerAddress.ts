import { useChainId } from "wagmi";

export const usePriceFeedHandlerAddress = () => {
  const chainId = useChainId();

  switch (chainId) {
    case 8453:
      return process.env.NEXT_PUBLIC_PRICE_FEED_HANDLER_ADDRESS_BASE;
    case 43113:
      return process.env.NEXT_PUBLIC_PRICE_FEED_HANDLER_ADDRESS_FUJI;
    default:
      return process.env.NEXT_PUBLIC_PRICE_FEED_HANDLER_ADDRESS_BASE;
  }
};
