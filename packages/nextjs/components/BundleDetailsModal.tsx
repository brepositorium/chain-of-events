import React, { useEffect, useState } from "react";
import EventCreation from "../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import ExtraCard from "./ExtraCard";
import toast from "react-hot-toast";
import { useAccount, useReadContract } from "wagmi";
import { usePriceFeedHandlerAddress } from "~~/hooks/chain-of-events/usePriceFeedHandlerAddress";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import {
  activateBundleSelling,
  addExtraToBundle,
  deactivateBundleSelling,
  fetchBundleBasics,
  fetchExtraDetails,
  fetchExtraNameAndAddress,
  mintBundle,
  withdrawFundsFromBundle,
} from "~~/utils/chain-of-events/deployContract";

interface BundleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleAddress: string;
  eventId: number;
  contractAddress: string;
  isAdmin: boolean;
}

interface ExtraDetails {
  name: string;
  symbol: string;
  price: string;
  extraType: number;
  uri: string;
  description: string;
  imageUrl: string;
}

export interface BundleBasics {
  name: string;
  price: string;
  extrasAddresses: string[];
  extraDetails: ExtraDetails;
}

const BundleDetailsModal: React.FC<BundleDetailsModalProps> = ({
  isOpen,
  onClose,
  bundleAddress,
  eventId,
  contractAddress,
  isAdmin,
}) => {
  const [bundleDetails, setBundleDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [extraDetails, setExtraDetails] = useState<any[]>([]);
  const [extraNameAndAddress, setExtraNameAndAddress] = useState<any[]>([]);
  const [selectedExtra, setSelectedExtra] = useState("");
  const [amount, setAmount] = useState(0);

  const { address } = useAccount();
  const priceFeedHandlerAddress = usePriceFeedHandlerAddress();

  const { data, error, isLoading } = useReadContract({
    abi: EventCreation.abi,
    address: contractAddress,
    functionName: "getExtras",
    args: [BigInt(eventId)],
  });

  const addresses = data as string[] | undefined;

  useEffect(() => {
    const fetchBundleExtras = async () => {
      if (!isOpen) return;
      setLoading(true);

      try {
        const basics = await fetchBundleBasics(bundleAddress);

        const extrasDetailsPromises = basics?.extrasAddresses.map((address: string) => fetchExtraDetails(address));

        const extrasDetails = await Promise.all(extrasDetailsPromises);
        if (extrasDetails) {
          setBundleDetails({ ...basics, extrasDetails });
        } else {
          setBundleDetails(basics);
        }
      } catch (fetchError) {
        setFetchError("Failed to fetch bundle details: " + fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchBundleExtras();
  }, [isOpen, bundleAddress]);

  useEffect(() => {
    const fetchData = async () => {
      if (!addresses || addresses.length === 0) {
        setExtraDetails([]);
        return;
      }
      const promises = addresses.map(address => fetchExtraNameAndAddress(address));

      const results = await Promise.all(promises);
      setExtraNameAndAddress(results);
    };
    fetchData();
  }, [isOpen, data]);
  if (!isOpen) return null;

  async function handleBuy(): Promise<void> {
    if (!bundleAddress || !address) {
      toast.error("Please provide the required address.");
      return;
    }

    const mintPromise = mintBundle(address, Number(bundleDetails.price), bundleAddress, priceFeedHandlerAddress!);

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

  const handleDeactivation = async () => {
    const deactivationPromise = deactivateBundleSelling(bundleAddress);

    toast.promise(
      deactivationPromise,
      {
        loading: "Deactivating bundle selling...",
        success: "Selling deactivated successfully!",
        error: "Failed to deactivate selling.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "✅" },
      },
    );

    try {
      await deactivationPromise;
    } catch (error) {
      console.error("Error deactivating the selling:", error);
    }
  };

  const handleActivation = async () => {
    const activationPromise = activateBundleSelling(bundleAddress);

    toast.promise(
      activationPromise,
      {
        loading: "Activating bundle selling...",
        success: "Selling activated successfully!",
        error: "Failed to activate selling.",
      },
      {
        style: { minWidth: "250px" },
        success: { duration: 5000, icon: "✅" },
      },
    );

    try {
      await activationPromise;
    } catch (error) {
      console.error("Error activating the selling:", error);
    }
  };

  const handleWithdraw = async () => {
    const withdrawPromise = withdrawFundsFromBundle(bundleAddress);

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
  };

  if (fetchError) return <div>Error: {fetchError}</div>;

  return (
    <dialog open className="modal" onClose={onClose}>
      <div className="modal-box bg-base-200 rounded-xl text-black flex flex-col gap-4 justify-center">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        {bundleDetails ? (
          <>
            <h2 className="text-lg text-center font-bold">{bundleDetails.name}</h2>
            <p className="text-lg text-center font-bold">{`$${(Number(bundleDetails.price) / 100).toFixed(2)}`}</p>
            {bundleDetails.extrasDetails && bundleDetails.extrasDetails.length > 0 ? (
              bundleDetails.extrasDetails.map(
                (
                  extra: {
                    name: string | undefined;
                    description: string | undefined;
                    imageUrl: string | undefined;
                    price: any;
                    address: any;
                    extraType: any;
                  },
                  index: React.Key | null | undefined,
                ) => (
                  <ExtraCard
                    key={index}
                    extraName={extra.name}
                    description={extra.description}
                    imageUrl={extra.imageUrl}
                    price={Number(extra.price) / 100}
                    hasQuantity={false}
                    action={ACTIONS.MANAGE}
                    manageUrl={`/extra/${extra.address}`}
                    extraType={Number(extra.extraType)}
                    isBundle={true}
                  />
                ),
              )
            ) : (
              <></>
            )}
            {isAdmin ? (
              <>
                <button
                  className="self-center btn btn-primary rounded w-40 mt-2"
                  disabled={bundleDetails.isActive}
                  onClick={handleActivation}
                >
                  Activate
                </button>
                <button
                  className="self-center btn btn-primary rounded w-40 mt-2"
                  disabled={!bundleDetails.isActive}
                  onClick={handleDeactivation}
                >
                  Deactivate
                </button>
                <button className="self-center btn btn-primary rounded w-40 mt-2" onClick={handleWithdraw}>
                  Withdraw
                </button>
                <select
                  onChange={e => setSelectedExtra(e.target.value)}
                  className="select select-md select-bordered w-80 bg-secondary-content rounded text-black mt-4 self-center"
                >
                  <option disabled selected>
                    Add an Extra to this Bundle
                  </option>
                  {extraNameAndAddress.map((item, index) => (
                    <option key={index} value={item.address}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <p className="self-center font-medium font-poppins">Number of Tickets</p>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  className="self-center input input-md input-bordered w-80 bg-secondary-content rounded text-black -mt-3"
                />
                <button
                  onClick={() => addExtraToBundle(bundleAddress, selectedExtra, amount)}
                  className="self-center btn btn-primary rounded btn-sm w-40 mt-2"
                  disabled={selectedExtra === ""}
                >
                  Save
                </button>
              </>
            ) : (
              <button onClick={handleBuy} className="self-center btn btn-primary rounded-xl w-32 mt-2">
                Buy Bundle
              </button>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </dialog>
  );
};

export default BundleDetailsModal;
