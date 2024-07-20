import React, { useState } from "react";
import Link from "next/link";
import Card from "./BaseCard";
import BundleDetailsModal from "./BundleDetailsModal";
import SimpleModal from "./SimpleModal";
import toast from "react-hot-toast";
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
  isPaused?: boolean;
  action: ACTIONS;
  manageUrl?: string;
  extraAddress?: string;
  extraOwner?: string;
  bundleAddress?: string;
  eventId?: number;
  contractAddress?: string;
  isBundle?: boolean;
}

const ExtraCard: React.FC<ExtraCardProps> = ({
  extraName,
  description,
  imageUrl,
  price,
  noOfItems,
  hasQuantity,
  extraType,
  isPaused,
  action,
  manageUrl,
  extraAddress,
  extraOwner,
  bundleAddress,
  eventId,
  contractAddress,
  isBundle,
}) => {
  const [quantity, setQuantity] = useState(0); // Initialize quantity with 0
  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [selectedBundleAddress, setSelectedBundleAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
    if (!extraAddress || !address) {
      toast.error("Please provide the required address.");
      return;
    }

    const mintPromise = mintNft(extraAddress, address, extraPrice, quantity, priceFeedHandlerAddress!);

    toast.promise(
      mintPromise,
      {
        loading: "⏳ Processing your purchase...",
        success: " Thank you for your purchase!",
        error: " Could not process sell.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "🎉" },
      },
    );

    try {
      await mintPromise;
      console.log("Minting successful");
    } catch (e) {
      console.error("Error minting:", e);
    }
  }

  async function handleRedeem(): Promise<void> {
    try {
      await redeemExtra(extraAddress!, extraOwner!, BigInt(quantity));
      toast.success("Extra Redeemed Successfully!");
      console.log("Redeeming successful");
    } catch (e) {
      toast.error("Could Not Redeem Extra." + e);
      console.error("Error redeeming:", e);
    }
  }

  const handleSimpleModalClose = () => {
    setIsSimpleModalOpen(false);
  };

  const handleManageBundle = (address: string, isAdmin: boolean) => {
    setSelectedBundleAddress(address);
    setIsAdmin(isAdmin);
  };

  return (
    <>
      {extraType === 2 ? (
        <Card className={"w-72 bg-green-pattern bg-cover bg-no-repeat rounded-lg text-primary-content"}>
          <div className="flex flex-col h-full p-2">
            <h2 className="text-center font-bold text-lg">{extraName}</h2>
            <p className="text-lg text-center font-bold">{!isPaused ? "SELLING PAUSED" : `$${price?.toFixed(2)}`}</p>
            <div className="flex flex-wrap justify-evenly mt-4 ">
              {action === ACTIONS.MANAGE ? (
                <button
                  className={`btn btn-primary rounded-xl w-36 border-0`}
                  onClick={() => handleManageBundle(bundleAddress!, true)}
                >
                  Manage
                </button>
              ) : action === ACTIONS.DETAILS ? (
                <button
                  className={`btn btn-primary rounded-xl w-36 border-0`}
                  onClick={() => handleManageBundle(bundleAddress!, false)}
                >
                  See Details
                </button>
              ) : (
                <></>
              )}
            </div>
          </div>
          <BundleDetailsModal
            isOpen={!!selectedBundleAddress}
            onClose={() => setSelectedBundleAddress("")}
            bundleAddress={selectedBundleAddress}
            eventId={eventId!}
            contractAddress={contractAddress!}
            isAdmin={isAdmin}
          />
        </Card>
      ) : isBundle ? (
        <Card className={"w-full bg-neutral-content rounded-lg text-primary-content flex justify-around gap-8"}>
          <div className="">
            <img src={imageUrl} alt={extraName} className="h-20 w-20 object-cover rounded-lg" />
          </div>
          <div className="flex gap-24 mt-2">
            <div>
              <p className="font-bold text-lg">{extraName}</p>
            </div>
            <div>
              <p className="text-lg font-bold ">{`$${price?.toFixed(2)}`}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card
          className={
            extraType === 0
              ? "w-72 bg-blue-pattern bg-cover bg-no-repeat rounded-lg text-primary-content"
              : "w-72 bg-green-pattern bg-cover bg-no-repeat rounded-lg text-primary-content"
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
            <h2 className="text-center font-bold text-lg">{extraName}</h2>
            <p className="text-sm font-poppins h-32 overflow-auto">{description}</p>

            <p className="text-lg text-center font-bold">{isPaused ? "BUNDLE NOT ACTIVE" : `$${price?.toFixed(2)}`}</p>
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
                <Link href={manageUrl} className={`btn btn-primary rounded-xl w-36 border-0`}>
                  Manage
                </Link>
              ) : action === ACTIONS.TRANSFER ? (
                <button className={`btn btn-primary rounded-xl w-36 border-0`} onClick={handleTransfer}>
                  Transfer
                </button>
              ) : action === ACTIONS.BUY ? (
                <button
                  className={`btn btn-primary rounded-xl w-36 border-0`}
                  onClick={() => handleBuy(extraAddress!, price!, quantity)}
                >
                  Buy
                </button>
              ) : action === ACTIONS.REDEEM ? (
                <button className={`btn btn-primary rounded-xl w-36 border-0`} onClick={() => handleRedeem()}>
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
      )}
    </>
  );
};

export default ExtraCard;
