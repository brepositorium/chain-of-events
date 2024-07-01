import React, { useEffect, useState } from "react";
import EventCreation from "../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import ExtraCard from "./ExtraCard";
import { useReadContract } from "wagmi";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchBundleDetails } from "~~/utils/chain-of-events/deployContract";

interface BundleListProps {
  eventId: number;
  contractAddress: string;
  isAdmin: boolean;
}

const BundleList: React.FC<BundleListProps> = ({ eventId, contractAddress, isAdmin }) => {
  const [bundleDetails, setBundleDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const { data, error, isLoading } = useReadContract({
    abi: EventCreation.abi,
    address: contractAddress,
    functionName: "getBundles",
    args: [BigInt(eventId)],
  });

  const bundleAddresses = data as string[] | undefined;

  useEffect(() => {
    const fetchAllBundles = async () => {
      if (bundleAddresses && bundleAddresses!.length > 0) {
        setLoading(true);
        try {
          const bundleDetailsPromises = bundleAddresses.map(address =>
            fetchBundleDetails(address).then(details => ({
              ...details,
              address,
            })),
          );
          const bundleDetails = await Promise.all(bundleDetailsPromises);
          setBundleDetails(bundleDetails);
        } catch (err) {
          setFetchError("Failed to fetch bundles");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    if (bundleAddresses && !isLoading && !error) {
      fetchAllBundles();
    } else if (error) {
      setFetchError(error.message);
    }
  }, [bundleAddresses, isLoading, error]);

  if (loading) return <div>Loading bundles...</div>;
  if (error) return <div>Error: {fetchError}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {bundleDetails.map((bundle, index) =>
        isAdmin ? (
          <ExtraCard
            key={index}
            extraName={bundle.name}
            price={Number(bundle.price) / 100}
            extraType={2}
            hasQuantity={false}
            action={ACTIONS.MANAGE}
            bundleAddress={bundle.address}
            eventId={eventId}
            contractAddress={contractAddress}
          />
        ) : (
          <ExtraCard
            key={index}
            extraName={bundle.name}
            price={Number(bundle.price) / 100}
            extraType={2}
            hasQuantity={false}
            action={ACTIONS.DETAILS}
            bundleAddress={bundle.address}
            eventId={eventId}
            contractAddress={contractAddress}
          />
        ),
      )}
    </div>
  );
};

export default BundleList;
