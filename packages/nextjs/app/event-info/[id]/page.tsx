"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCreation from "../../../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import { useQuery } from "@apollo/client";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useAccount, useReadContract } from "wagmi";
import ExtraCard from "~~/components/ExtraCard";
import { Address } from "~~/components/scaffold-eth";
import useApolloClient from "~~/hooks/chain-of-events/useApolloClient";
import useContractAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import {
  checkVerifiedAccount,
  fetchExtraDetails,
  getEventAdmin,
  getUnredeemedBalanceOf,
} from "~~/utils/chain-of-events/deployContract";
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
  const [locationAddress, setLocationAddress] = useState("");
  const [latCoord, setLatCoord] = useState(11.197451);
  const [lngCoord, setLngCoord] = useState(140.3606071);
  const [eventAdmin, setEventAdmin] = useState("");
  const [isVerified, setIsVerified] = useState(false);

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

    if (dataEvents && dataEvents.eventCreateds && dataEvents.eventCreateds.length > 0) {
      const [lat, lng] = dataEvents.eventCreateds[0].createdEvent_location.split("|").map(Number);

      if (!isNaN(lat) && !isNaN(lng)) {
        setLatCoord(lat);
        setLngCoord(lng);
        reverseGeocode(lat, lng);
      } else {
        console.error("Invalid event location format:", dataEvents.eventCreateds[0].createdEvent_location);
        setLocationAddress("Invalid location format");
      }
    }

    if (address) {
      fetchExtras();
    }
  }, [data, address, dataEvents]);

  useEffect(() => {
    async function fetchAdmin() {
      if (contractAddress) {
        const adminData = await getEventAdmin(contractAddress, id);
        if (adminData && adminData.admin) {
          setEventAdmin(adminData.admin);

          const verified = await checkVerifiedAccount(adminData.admin);
          setIsVerified(verified);
        } else {
          console.error("Failed to fetch event admin");
          setEventAdmin("Unable to fetch admin data");
          setIsVerified(false);
        }
      }
    }

    fetchAdmin();
  }, [contractAddress]);

  function reverseGeocode(lat: any, lng: any) {
    if (!lat || !lng) {
      console.error("Invalid latitude or longitude provided for reverse geocoding.");
      setLocationAddress("Invalid location format");
      return;
    }

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_MAPS_API}`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK") {
          setLocationAddress(data.results[0].formatted_address);
        } else {
          setLocationAddress("Address format not correct");
          console.error("No results found");
        }
      })
      .catch(error => console.error("Error:", error));
  }

  if (loadingEvents)
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );
  if (errorEvents) return <p>Error loading events</p>;

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API}>
      <div className="h-[650px] bg-circles bg-no-repeat">
        <div className="flex flex-col gap-4 mt-12 p-6 max-w-screen md:max-w-4xl mx-auto bg-secondary-content rounded-xl shadow-md space-x-4">
          <div className="flex flex-col md:flex-row md:justify-around gap-8">
            <div className="flex flex-col gap-8 items-center md:mt-8 bg-base-200 p-4 rounded-xl shadow-xl basis-1/2">
              <div>
                <img
                  src={dataEvents.eventCreateds[0].createdEvent_logoUrl}
                  height={300}
                  width={300}
                  alt="Logo"
                  className="rounded-xl"
                />
              </div>
              <div className="text-2xl font-extrabold">{dataEvents.eventCreateds[0].createdEvent_name}</div>
              <div className="flex justify-center gap-2">
                <Link href={"/shop/" + id + "/0"} className="btn btn-primary rounded w-32">
                  Buy Ticket
                </Link>
                <Link href={"/shop/" + id + "/1"} className="btn btn-primary rounded w-32">
                  Buy Drink/Snack
                </Link>
              </div>
              <div className="flex justify-center items-center">
                <Link
                  href={`/shop/${id}/2`}
                  className="btn btn-primary rounded w-48 -mt-6 flex items-center justify-center"
                >
                  <img
                    className="w-10 h-10 -ml-2 -mr-2"
                    alt="%"
                    src="https://first-bucket-190624.s3.eu-north-1.amazonaws.com/bundle-icon.svg"
                  ></img>
                  Discount Bundles
                </Link>
              </div>
              <Map
                defaultZoom={15}
                defaultCenter={{
                  lat: latCoord,
                  lng: lngCoord,
                }}
                center={{
                  lat: latCoord,
                  lng: lngCoord,
                }}
                style={{
                  width: "300px",
                  height: "200px",
                  borderRadius: "30px",
                  overflow: "hidden",
                }}
                gestureHandling="greedy"
                disableDefaultUI={true}
              >
                <Marker
                  position={{
                    lat: latCoord,
                    lng: lngCoord,
                  }}
                />
              </Map>
            </div>
            <div className="flex flex-col md:mt-8 gap-12 basis-1/2">
              <div className="bg-base-200 p-4 rounded-xl shadow-xl">
                <p className="text-xl font-bold font-poppins">About</p>
                <div className="text-lg">{dataEvents.eventCreateds[0].createdEvent_description}</div>
              </div>
              <div className="bg-base-200 p-4 rounded-xl shadow-xl">
                <p className="text-xl font-bold font-poppins">Location</p>
                <div className="text-lg">{locationAddress}</div>
              </div>
              <div className="bg-base-200 p-4 rounded-xl shadow-xl">
                <p className="text-xl font-bold font-poppins">Admin</p>
                <div className="text-lg flex gap-4">
                  {eventAdmin ? <Address address={eventAdmin}></Address> : "Loading admin data..."}
                  {isVerified && (
                    <div className="tooltip" data-tip="hello">
                      <img
                        src="https://first-bucket-190624.s3.eu-north-1.amazonaws.com/check.svg"
                        alt="Verified"
                        className="h-6 w-6"
                      />
                    </div>
                  )}
                </div>
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
    </APIProvider>
  );
};

export default EditDashboardPage;
