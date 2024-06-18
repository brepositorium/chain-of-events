import React, { useCallback } from "react";
import { CSSProperties } from "react";
import { CoinbaseWalletLogo } from "./CoinbaseWalletLogo";
import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";

const buttonStyles: CSSProperties = {
  background: "transparent",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: 150,
  height: 40,
  fontFamily: "Arial, sans-serif",
  fontWeight: "bold",
  fontSize: 14,
  backgroundColor: "#0052FF",
  paddingLeft: 9,
  paddingRight: 11,
  borderRadius: 10,
};

interface BlueCreateWalletButtonProps {
  handleSuccess: (address: string) => void;
  handleError: (error: Error) => void;
}

const sdk = new CoinbaseWalletSDK({
  appName: "Chain of Events",
  appLogoUrl: "https://example.com/logo.png",
  appChainIds: [84532],
});

let provider: any;
if (typeof window !== "undefined") {
  const provider = sdk.makeWeb3Provider();
}

export function BlueCreateWalletButton({ handleSuccess, handleError }: BlueCreateWalletButtonProps) {
  const createWallet = useCallback(async () => {
    try {
      const addresses: string[] = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const address = addresses[0];
      handleSuccess(address);
    } catch (error: any) {
      handleError(error);
    }
  }, [handleSuccess, handleError]);

  return (
    <button
      style={buttonStyles}
      className="text-white duration-300 hover:border-2 border-secondary ease-in-out"
      onClick={createWallet}
    >
      <CoinbaseWalletLogo />
      Create Wallet
    </button>
  );
}
