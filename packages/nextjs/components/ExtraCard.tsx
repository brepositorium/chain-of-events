import React, { useState } from "react";
import Link from "next/link";
import Card from "./BaseCard";
import SimpleModal from "./SimpleModal";
import { useAccount } from "wagmi";
import { usePriceFeedHandlerAddress } from "~~/hooks/chain-of-events/usePriceFeedHandlerAddress";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { mintNft, redeemExtra } from "~~/utils/chain-of-events/deployContract";

interface ExtraCardProps {
  extraName?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  noOfItems?: number;
  hasQuantity: boolean;
  extraType: number;
  action: ACTIONS;
  manageUrl?: string;
  extraAddress?: string;
  extraOwner?: string;
}

const ExtraCard: React.FC<ExtraCardProps> = ({
  extraName,
  description,
  imageUrl,
  price,
  noOfItems,
  hasQuantity,
  extraType,
  action,
  manageUrl,
  extraAddress,
  extraOwner,
}) => {
  const [quantity, setQuantity] = useState(0); // Initialize quantity with 0
  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");

  const { address } = useAccount();
  const priceFeedHandlerAddress = usePriceFeedHandlerAddress();

  const handleIncrease = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity(prevQuantity => Math.max(0, prevQuantity - 1)); // Prevent negative values
  };

  function handleTransfer(): void {
    setCurrentField("transfer");
    setIsSimpleModalOpen(true);
  }

  async function handleBuy(extraAddress: string, extraPrice: number, quantity: number): Promise<void> {
    if (address) {
      try {
        await mintNft(extraAddress, address, extraPrice, quantity, priceFeedHandlerAddress!);
        console.log("Minting successful");
      } catch (e) {
        console.error("Error minting:", e);
      }
    }
  }

  function handleRedeem(): void {
    redeemExtra(extraAddress!, extraOwner!, BigInt(quantity));
  }

  const handleSimpleModalClose = () => {
    setIsSimpleModalOpen(false);
  };

  return (
    <Card
      className={
        extraType === 0
          ? "w-72 bg-blue-pattern bg-cover bg-no-repeat rounded-lg"
          : "w-72 bg-green-pattern bg-cover bg-no-repeat rounded-lg"
      }
    >
      <img src={imageUrl} alt={extraName} className="w-full h-52 object-cover rounded-lg" />
      {noOfItems ? (
        <div className="indicator">
          <span className="indicator-item badge badge-warning">{`x${noOfItems}`}</span>
        </div>
      ) : (
        <div></div>
      )}
      <div className="flex flex-col h-full p-2">
        <h2 className="text-center font-bold font-outfit">{extraName}</h2>
        <p className="text-sm font-outfit h-32 overflow-auto">{description}</p>
        <p className="text-sm text-center font-bold font-outfit">{`$${price?.toFixed(2)}`}</p>
        {hasQuantity ? (
          <div className="flex items-center justify-center my-2">
            <button className="btn text-xl" onClick={handleDecrease}>
              -
            </button>
            <span className="mx-4">{quantity}</span>
            <button className="btn text-xl" onClick={handleIncrease}>
              +
            </button>
          </div>
        ) : (
          <div></div>
        )}
        <div className="flex flex-wrap justify-evenly mt-4 ">
          {action === ACTIONS.MANAGE && manageUrl ? (
            <Link href={manageUrl} className={`btn btn-gradient-primary rounded-xl w-36 border-0`}>
              Manage
            </Link>
          ) : action === ACTIONS.TRANSFER ? (
            <button className={`btn btn-gradient-primary rounded-xl w-36 border-0`} onClick={handleTransfer}>
              Transfer
            </button>
          ) : action === ACTIONS.BUY ? (
            <button
              className={`btn btn-gradient-primary rounded-xl w-36 border-0`}
              onClick={() => handleBuy(extraAddress!, price!, quantity)}
            >
              Buy
            </button>
          ) : action === ACTIONS.REDEEM ? (
            <button className={`btn btn-gradient-primary rounded-xl w-36 border-0`} onClick={() => handleRedeem()}>
              Redeem
            </button>
          ) : (
            <div></div>
          )}
        </div>
        <SimpleModal
          isOpen={isSimpleModalOpen}
          onClose={handleSimpleModalClose}
          fieldName={currentField}
          quantity={quantity}
          extraAddress={extraAddress}
        />
      </div>
    </Card>
  );
};

export default ExtraCard;
