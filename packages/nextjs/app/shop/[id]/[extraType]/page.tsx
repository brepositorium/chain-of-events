"use client";

import { useEffect, useState } from "react";
import ExtraCard from "~~/components/ExtraCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails, mintNft } from "~~/utils/chain-of-events/deployContract";

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

  const { data } = useScaffoldReadContract({
    contractName: "EventCreation",
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  useEffect(() => {
    const fetchExtras = async () => {
      if (!data || data.length === 0) {
        setFilteredExtras([]);
        return;
      }
      const promises = data.map(address =>
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
    <div className="container mx-auto px-40">
      <h1 className="text-2xl font-bold my-4">Available extras</h1>
      <div className="grid grid-cols-3 gap-4">
        {filteredExtras.length > 0 ? (
          filteredExtras.map((extra, index) => (
            <ExtraCard
              extraName={extra.name}
              description={extra.description}
              imageUrl={extra.imageUrl}
              extraAddress={extra.address}
              price={Number(extra.price)}
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
