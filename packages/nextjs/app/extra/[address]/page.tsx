"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ChainlinkContractManager from "~~/components/ChainlinkContractsManager";
import ExtraTemplates from "~~/components/ExtraTemplates";
import SimpleModal from "~~/components/SimpleModal";
import {
  fetchExtraDetails,
  getPausedStatus,
  pauseSellingForExtra,
  unpauseSellingForExtra,
  withdrawFundsFromExtra,
} from "~~/utils/chain-of-events/deployContract";

type PageProps = {
  params: { address: string };
};

interface ExtraDetails {
  name: string;
  symbol: string;
  price: number;
  extraType: string;
  uri: string;
  description: string;
  imageUrl: string;
}

const ExtraPage = ({ params }: PageProps) => {
  const address = params.address;

  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chainlinkContractAddress, setChainlinkContractAddress] = useState("");
  const [extraDetails, setExtraDetails] = useState<ExtraDetails | null>(null);

  useEffect(() => {
    const fetchPausedStatus = async () => {
      setLoading(true);
      const status = await getPausedStatus(address);
      setIsPaused(status);
      const details = await fetchExtraDetails(address);
      if (details) {
        details.price = Number(details.price) / 100;
        setExtraDetails(details);
      } else {
        console.error("Failed to fetch extra details");
      }
      setLoading(false);
    };

    if (address) {
      fetchPausedStatus();
    }
  }, [address]);

  const handlePause = async () => {
    const pausePromise = pauseSellingForExtra(address);

    toast.promise(
      pausePromise,
      {
        loading: "Pausing selling...",
        success: "Selling paused successfully!",
        error: "Failed to pause selling.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "✅" },
      },
    );

    try {
      await pausePromise;
      setIsPaused(true);
    } catch (error) {
      console.error("Error pausing the contract:", error);
    }
  };

  const handleUnpause = async () => {
    const unpausePromise = unpauseSellingForExtra(address);

    toast.promise(
      unpausePromise,
      {
        loading: "Unpausing selling...",
        success: "Selling unpaused successfully!",
        error: "Failed to unpause selling.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "✅" },
      },
    );

    try {
      await unpausePromise;
      setIsPaused(false);
    } catch (error) {
      console.error("Error unpausing the contract:", error);
    }
  };

  const handleWithdraw = async () => {
    const withdrawPromise = withdrawFundsFromExtra(address);

    toast.promise(
      withdrawPromise,
      {
        loading: "Withdrawing funds...",
        success: "Funds withdrawn successfully!",
        error: "Failed to withdraw funds.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "💰" },
      },
    );

    try {
      await withdrawPromise;
    } catch (error) {
      console.error("Error withdrawing funds:", error);
    }
  };

  const handleEditClick = (field: string, chainlinkContractAddress?: string) => {
    if (chainlinkContractAddress) {
      setChainlinkContractAddress(chainlinkContractAddress);
    }
    setCurrentField(field);
    setIsSimpleModalOpen(true);
  };

  const handleSimpleModalClose = () => {
    setIsSimpleModalOpen(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="flex flex-col gap-4 mt-12 p-6 max-w-screen md:max-w-4xl mx-auto bg-secondary-content rounded-xl shadow-md space-x-4">
        <div className="flex flex-col md:flex-row md:justify-around">
          <div className="flex flex-col items-center md:mt-8 bg-base-200 p-4 rounded-xl shadow-xl">
            <img src={extraDetails?.imageUrl} alt="Logo" height={300} width={300} />
            <div className="flex flex-col items-center">
              <div>
                <p className="font-medium font-poppins text-2xl">
                  {extraDetails?.name}{" "}
                  <span className="text-green-500">&nbsp; ${`${extraDetails?.price?.toFixed(2)}`}</span>
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-medium font-poppins text-lg">About</p>
                <p className="-mt-4">{extraDetails?.description}</p>
              </div>
              <div className="flex flex-col items-center relative group">
                <p className="-mb-4 font-medium font-poppins text-lg">Address</p>
                <p>{address}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center mt-8 justify-around bg-base-200 p-4 rounded-xl shadow-xl">
            <button
              className="btn btn-primary rounded btn-md w-40"
              onClick={() => handleEditClick("createdEvent_price")}
            >
              Change Price
            </button>
            <button
              className="btn btn-primary rounded btn-md w-40"
              onClick={() => handleEditClick("createdEvent_mintLimit")}
            >
              Change Mint Limit
            </button>
            <button className="btn btn-primary rounded btn-md w-40" disabled={isPaused} onClick={handlePause}>
              Pause
            </button>
            <button className="btn btn-primary rounded btn-md w-40" disabled={!isPaused} onClick={handleUnpause}>
              Unpause
            </button>
            <button
              className="btn btn-primary rounded btn-md w-40"
              onClick={() => handleEditClick("createdEvent_allowedChainlinkContract")}
            >
              Add Approved Chainlink Address
            </button>
            <button className="btn btn-primary rounded btn-md w-40" onClick={handleWithdraw}>
              Withdraw
            </button>
          </div>
        </div>

        <div className="mt-8 divider"></div>
        <ChainlinkContractManager extraAddress={address} onScheduleButtonClick={handleEditClick} />
        <div className="divider"></div>
        <ExtraTemplates extraAddress={address} />
        <SimpleModal
          isOpen={isSimpleModalOpen}
          onClose={handleSimpleModalClose}
          fieldName={currentField.replace("createdEvent_", "")}
          extraAddress={address}
          chainlinkContractAddress={chainlinkContractAddress}
        />
      </div>
    </div>
  );
};

export default ExtraPage;
