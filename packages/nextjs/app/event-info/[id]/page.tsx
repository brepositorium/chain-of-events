"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCreation from "../../../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import { useQuery } from "@apollo/client";
import { useAccount, useReadContract } from "wagmi";
import ExtraCard from "~~/components/ExtraCard";
import useApolloClient from "~~/hooks/chain-of-events/useApolloClient";
import useContractAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
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

const EditDashboardPage = ({ params }: PageProps) => {
  const id = params.id;
  const client = useApolloClient();

  const {
    loading: loadingEvents,
    error: errorEvents,
    data: dataEvents,
  } = useQuery(GET_EVENT_DETAILS_BY_ID, {
    variables: { id },
    client,
  });

  const { address } = useAccount();
  const contractAddress = useContractAddress();

  const { data, error, isLoading } = useReadContract({
    abi: EventCreation.abi,
    address: contractAddress,
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  const addresses = data as string[] | undefined;

  const [extraDetails, setExtraDetails] = useState<ExtraDetail[]>([]);

  useEffect(() => {
    const fetchExtras = async () => {
      if (!addresses || addresses.length === 0) {
        setExtraDetails([]);
        return;
      }

      const balancePromises = addresses.map(extra => getUnredeemedBalanceOf(extra, address!));
      const balances = await Promise.all(balancePromises);

      const nonZeroExtras = addresses.filter((extra, index) => balances[index] > 0);

      const detailPromises = nonZeroExtras.map(extra => fetchExtraDetails(extra));
      const details = await Promise.all(detailPromises);

      const combinedDetails = nonZeroExtras.map((extra, index) => ({
        ...details[index],
        balance: balances[addresses.indexOf(extra)],
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
      <div className="flex flex-col gap-4 mt-12 p-6 max-w-screen md:max-w-4xl mx-auto bg-gradient-to-b from-secondary via-primary to-secondary ... rounded-xl shadow-md space-x-4">
        <div className="flex flex-col md:flex-row md:justify-around gap-8">
          <div className="flex flex-col gap-8 items-center md:mt-8">
            <div>
              <img src={dataEvents.eventCreateds[0].createdEvent_logoUrl} height={300} width={300} alt="Logo" />
            </div>
            <div className="text-2xl font-extrabold font-poppins">{dataEvents.eventCreateds[0].createdEvent_name}</div>
            <div className="flex justify-center gap-2">
              <Link href={"/shop/" + id + "/0"} className="btn btn-gradient-primary rounded w-32">
                Buy Ticket
              </Link>
              <Link href={"/shop/" + id + "/1"} className="btn btn-gradient-primary rounded w-32">
                Buy Drink/Snack
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:mt-8 gap-12">
            <div className="bg-secondary p-4 rounded-xl shadow-xl">
              <p className="text-xl font-bold font-poppins">About</p>
              <div className="text-lg">{dataEvents.eventCreateds[0].createdEvent_description}</div>
            </div>
            <div className="bg-secondary p-4 rounded-xl shadow-xl">
              <p className="text-xl font-bold font-poppins">Location</p>
              <div className="text-lg">{dataEvents.eventCreateds[0].createdEvent_location}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-11 md:px-20 xl:px-40">
        <h1 className="text-2xl font-bold my-4 mt-8 font-poppins">Your assets</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {extraDetails.length > 0 ? (
            extraDetails.map((detail, index) => (
              <ExtraCard
                extraName={detail.name}
                description={detail.description}
                imageUrl={detail.imageUrl}
                extraAddress={detail.extraAddress}
                price={Number(detail.price) / 100}
                hasQuantity={true}
                noOfItems={Number(detail.balance)}
                action={ACTIONS.TRANSFER}
                extraType={Number(detail.extraType)}
              />
            ))
          ) : (
            <p className="font-poppins">No extra details available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditDashboardPage;
