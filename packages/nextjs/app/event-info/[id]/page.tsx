"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import { useAccount } from "wagmi";
import ExtraCard from "~~/components/ExtraCard";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails, getUnredeemedBalanceOf } from "~~/utils/chain-of-events/deployContract";
import { GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries";

type PageProps = {
  params: { id: number };
};

interface ExtraDetail {
  balance: string;
  extraType?: bigint;
  extraAddress: string;
  name?: string;
  symbol?: string;
  description?: string;
  imageUrl?: string;
  price?: bigint;
  uri?: string;
}

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache(),
});

const EditDashboardPage = ({ params }: PageProps) => {
  const id = params.id;
  const {
    loading: loadingEvents,
    error: errorEvents,
    data: dataEvents,
  } = useQuery(GET_EVENT_DETAILS_BY_ID, {
    variables: { id },
    client: client,
  });

  const { address } = useAccount();

  const { data } = useScaffoldReadContract({
    contractName: "EventCreation",
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  const [extraDetails, setExtraDetails] = useState<ExtraDetail[]>([]);

  useEffect(() => {
    const fetchExtras = async () => {
      if (!data || data.length === 0) {
        setExtraDetails([]);
        return;
      }

      const balancePromises = data.map(extra => getUnredeemedBalanceOf(extra, address!));
      const balances = await Promise.all(balancePromises);

      const nonZeroExtras = data.filter((extra, index) => balances[index] > 0);

      const detailPromises = nonZeroExtras.map(extra => fetchExtraDetails(extra));
      const details = await Promise.all(detailPromises);

      const combinedDetails = nonZeroExtras.map((extra, index) => ({
        ...details[index],
        balance: balances[data.indexOf(extra)],
        extraAddress: extra,
      }));
      setExtraDetails(combinedDetails);
    };

    if (address) {
      fetchExtras();
    }
  }, [data, address]);

  if (loadingEvents)
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );
  if (errorEvents) return <p>Error loading events</p>;

  return (
    <div className="h-[650px] bg-circles bg-no-repeat">
      <div className="flex flex-col items-center mt-12 gap-4 p-6 max-w-2xl mx-auto bg-gradient-to-b from-secondary via-primary to-secondary ... rounded-xl shadow-md space-x-4">
        <div className="text-2xl font-extrabold mb-6 font-outfit ml-8">
          {dataEvents.eventCreateds[0].createdEvent_name}
        </div>
        <div className="text-lg w-96 border p-2 font-outfit">
          {dataEvents.eventCreateds[0].createdEvent_description}
        </div>
        <div className="text-lg w-96 border p-2 font-outfit">{dataEvents.eventCreateds[0].createdEvent_location}</div>
        <div className="flex my-8 justify-center gap-2">
          <Link href={"/shop/" + id + "/0"} className="btn btn-gradient-primary rounded w-32">
            Buy ticket
          </Link>
          <Link href={"/shop/" + id + "/1"} className="btn btn-gradient-primary rounded w-32">
            Buy drink/snack
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-40">
        <h1 className="text-2xl font-bold my-4 mt-8">Your assets</h1>
        <div className="grid grid-cols-3 gap-4">
          {extraDetails.length > 0 ? (
            extraDetails.map((detail, index) => (
              <ExtraCard
                extraName={detail.name}
                description={detail.description}
                imageUrl={detail.imageUrl}
                extraAddress={detail.extraAddress}
                price={Number(detail.price)}
                hasQuantity={true}
                noOfItems={Number(detail.balance)}
                action={ACTIONS.TRANSFER}
                extraType={Number(detail.extraType)}
              />
            ))
          ) : (
            <p className="font-outfit">No extra details available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDashboardPage;
