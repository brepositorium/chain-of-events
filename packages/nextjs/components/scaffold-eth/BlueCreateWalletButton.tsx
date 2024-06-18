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

let provider: any;
if (typeof window !== "undefined") {
  const sdk = new CoinbaseWalletSDK({
    appName: "Chain of Events",
    appLogoUrl:
      "https://first-bucket-190624.s3.eu-north-1.amazonaws.com/logo.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEHcaCmV1LW5vcnRoLTEiSDBGAiEAyDeuSoYDDR%2FsoSz%2Fuf8n%2FLPlJjLspWS9AoE0Cdr8I%2B0CIQDl2zwAjQd%2Bv22TL60dsB0YB4WHYnwRvwyZ302JB71gRyrkAgghEAAaDDkwNTQxODA5NTk5MSIMn%2Fm5DgMnmczqhbFwKsEC6ASEq2W2k%2BsxmEPg%2FC94ENWtIbR1UbcT28%2Fs66MR6DSwS2CrleLZr4UOvusPTwJYO4WUZApPFZju0Zh81AJEYffSVBd6V8iea8IUn74l9ILEhe9MP0ZuzkmL1m%2BXqaQ9vwtqz4KCznElfjGp2chWcDicMR3QHHRhRZ6T%2F8pRXh3666%2FiRvTRaG6RnhfnyOs%2Fv83knGf6BM1uBRj5H5ozyErcri3FibcBJPnS8Ew%2BrQ6aiNDdgehg03Vgyjqqf9T8c5j8cg6NyUvQkwaz6mmSg8xP9MB%2FhxzI1LeFg4NkIUdGojA7kIQwekfZPuciX%2Fv4GkwHm11zwIoAv9337bpjVz55BEzh484YzCcooe51WOceaeJWeo%2BhoyvlGgp2ZhQAjxCBJSflQu15fI8n313l2uHK%2FBaulv9C3ww7ib9wIYbJMLCtyLMGOrIC4Uvr4Snav4R464UumYqVm8N2b7kSL5XcnTfy5Wj851jJ4TAxe%2BZdifgSuToto50h59UCNQNMqfdz8ebIvj1r6Rb5c5FfLyLTGNkXSa7ikh%2BNxilsN3PLQOTFiZ8rHOEfHtdEkjDFpyEFosm1VvfcAEgjIRRNYnvyUI6ZGsrcwcisol0t1w%2BRKz6kFqncsLHaDurHIyJRxmps%2Boe6aOO0BjfJz4SzGkwvvkjYMkieW7lJW3xAoHHWFwh3uCO%2FM4eZz%2BfPrO0HCvZmXCOLg7DQ2H0g65chjZTJ%2BmvxQpalmYj7oAKUPhI%2Fjx2kBb6ncYj%2F8k%2FTnzMwDs%2BKqnN5LRt8TfwZDrldt2oWSiFRZpJahLAtJjPd2YWMXWuLFOujFDTb14Jj4Zb8DpZle0RJvHCM2m96&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240618T232438Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIA5FTY7XV3WHOIQVLT%2F20240618%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Signature=76a00581fd75c617fdbe05cd8673a2f65d8404424dd36b98d1d8a7d139eedcc9",
    appChainIds: [84532],
  });
  provider = sdk.makeWeb3Provider();
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
