"use client";

import { useEffect, useState } from "react";
import ChainlinkContractManager from "~~/components/ChainlinkContractsManager";
import ExtraTemplates from "~~/components/ExtraTemplates";
import SimpleModal from "~~/components/SimpleModal";
import {
  getPausedStatus,
  pauseSellingForExtra,
  unpauseSellingForExtra,
  withdrawFundsFromExtra,
} from "~~/utils/chain-of-events/deployContract";

type PageProps = {
  params: { address: string };
};

const ExtraPage = ({ params }: PageProps) => {
  const address = params.address;

  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chainlinkContractAddress, setChainlinkContractAddress] = useState("");

  useEffect(() => {
    const fetchPausedStatus = async () => {
      setLoading(true);
      const status = await getPausedStatus(address);
      setIsPaused(status);
      setLoading(false);
    };

    if (address) {
      fetchPausedStatus();
    }
  }, [address]);

  const handlePause = async () => {
    await pauseSellingForExtra(address);
    setIsPaused(true);
  };

  const handleUnpause = async () => {
    await unpauseSellingForExtra(address);
    setIsPaused(false);
  };

  const handleWithdraw = async () => {
    await withdrawFundsFromExtra(address);
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
      <div className="flex flex-col gap-4 mt-12 items-center p-6 max-w-2xl mx-auto bg-gradient-to-b from-secondary via-primary to-secondary ... rounded-xl shadow-md space-x-4">
        <div className="text-xl font-outfit mb-8">
          Extra's address: <span className="font-extrabold">{address}</span>
        </div>
        <button
          className="btn btn-gradient-primary rounded btn-md w-40"
          onClick={() => handleEditClick("createdEvent_price")}
        >
          Change price
        </button>
        <button
          className="btn btn-gradient-primary rounded btn-md w-40"
          onClick={() => handleEditClick("createdEvent_mintLimit")}
        >
          Change Mint Limit
        </button>
        <button className="btn btn-gradient-primary rounded btn-md w-40" disabled={isPaused} onClick={handlePause}>
          Pause
        </button>
        <button className="btn btn-gradient-primary rounded btn-md w-40" disabled={!isPaused} onClick={handleUnpause}>
          Unpause
        </button>
        <button
          className="btn btn-gradient-primary rounded btn-md w-40"
          onClick={() => handleEditClick("createdEvent_allowedChainlinkContract")}
        >
          Add Approved Chainlink Address
        </button>
        <button className="btn btn-gradient-primary rounded btn-md w-40" onClick={handleWithdraw}>
          Withdraw
        </button>
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
