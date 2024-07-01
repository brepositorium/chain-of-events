"use client";

import { useEffect, useState } from "react";
import EventCreation from "../../../../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import { useReadContract } from "wagmi";
import BundleList from "~~/components/BundlesList";
import ExtraCard from "~~/components/ExtraCard";
import useContractAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails } from "~~/utils/chain-of-events/deployContract";

type PageProps = {
  params: { id: number; extraType: number };
};

interface ExtraDetail {
  address?: string;
  description: string;
  imageUrl: string;
  extraType: bigint;
  name: string;
  symbol: string;
  price: bigint;
  uri: string;
}

const ShopPage = ({ params }: PageProps) => {
  const id = params.id;
  const extraType = params.extraType;

  const [filteredExtras, setFilteredExtras] = useState<ExtraDetail[]>([]);

  const contractAddress = useContractAddress();

  const { data, error, isLoading } = useReadContract({
    abi: EventCreation.abi,
    address: contractAddress,
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  const addresses = data as string[] | undefined;

  useEffect(() => {
    const fetchExtras = async () => {
      if (!addresses || addresses.length === 0) {
        setFilteredExtras([]);
        return;
      }
      const promises = addresses.map(address =>
        fetchExtraDetails(address)
          .then(details => (Number(details?.extraType) === Number(extraType) ? { address, ...details } : null))
          .catch(error => ({ address, error: error.message })),
      );

      const results = await Promise.all(promises);
      const filteredExtras = results.filter(item => item !== null) as ExtraDetail[];

      setFilteredExtras(filteredExtras);
    };

    fetchExtras();
  }, [data]);

  return (
    <div className="container mx-auto px-11 md:px-20 xl:px-40">
      <h1 className="text-2xl my-4 font-bold">Extras for Sell</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {extraType == 2 ? (
          <BundleList eventId={id} contractAddress={contractAddress!} isAdmin={false} />
        ) : filteredExtras.length > 0 ? (
          filteredExtras.map((extra, index) => (
            <ExtraCard
              extraName={extra.name}
              description={extra.description}
              imageUrl={extra.imageUrl}
              extraAddress={extra.address}
              price={Number(extra.price) / 100}
              hasQuantity={true}
              action={ACTIONS.BUY}
              extraType={Number(extra.extraType)}
            />
          ))
        ) : (
          <p>No extras available.</p>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
