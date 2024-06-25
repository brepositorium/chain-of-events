// BundleDetailsModal.js
import React, { useEffect, useState } from "react";
import EventCreation from "../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import ExtraCard from "./ExtraCard";
import { useReadContract } from "wagmi";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import {
  addExtraToBundle,
  fetchBundleBasics,
  fetchExtraDetails,
  fetchExtraNameAndAddress,
} from "~~/utils/chain-of-events/deployContract";

interface BundleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundleAddress: string;
  eventId: number;
  contractAddress: string;
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
}) => {
  const [bundleDetails, setBundleDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [extraDetails, setExtraDetails] = useState<any[]>([]);
  const [extraNameAndAddress, setExtraNameAndAddress] = useState<any[]>([]);
  const [selectedExtra, setSelectedExtra] = useState("");
  const [amount, setAmount] = useState(0);

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
        console.log(extrasDetailsPromises);
        const extrasDetails = await Promise.all(extrasDetailsPromises);
        console.log(extraDetails);
        if (extrasDetails) {
          setBundleDetails({ ...basics, extrasDetails });
          console.log(extraDetails);
          console.log(bundleDetails);
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

  if (fetchError) return <div>Error: {fetchError}</div>;

  return (
    <dialog open className="modal" onClose={onClose}>
      <div className="modal-box bg-base-200 rounded-xl text-black">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        {bundleDetails ? (
          <>
            <h2>{bundleDetails.name}</h2>
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
                  />
                ),
              )
            ) : (
              <></>
            )}
            <select
              onChange={e => setSelectedExtra(e.target.value)}
              className="select select-md select-bordered w-80 bg-secondary-content rounded text-black"
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
            <p className="self-start font-medium font-poppins">Number of Tickets</p>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(parseInt(e.target.value) || 0)}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black -mt-3"
            />
            <button
              onClick={() => addExtraToBundle(bundleAddress, selectedExtra, amount)}
              className="btn btn-primary rounded btn-sm w-20 mt-2"
              disabled={selectedExtra === ""}
            >
              Save
            </button>
          </>
        ) : (
          <></>
        )}
      </div>
    </dialog>
  );
};

export default BundleDetailsModal;
