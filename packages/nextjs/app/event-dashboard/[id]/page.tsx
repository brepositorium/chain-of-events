"use client";

import { useEffect, useState } from "react";
import EventCreation from "../../../../hardhat/artifacts/contracts/EventCreation.sol/EventCreation.json";
import { useQuery } from "@apollo/client";
import { useReadContract } from "wagmi";
import AddExtraModal from "~~/components/AddExtraModal";
import EventDetails from "~~/components/EventDetails";
import ExtraCard from "~~/components/ExtraCard";
import SimpleModal from "~~/components/SimpleModal";
import useApolloClient from "~~/hooks/chain-of-events/useApolloClient";
import useContractAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails } from "~~/utils/chain-of-events/deployContract";
import { GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries";

type PageProps = {
  params: { id: number };
};

interface ExtraDetail {
  address: string;
  extraType: bigint;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  price: bigint;
  uri: string;
}

interface SaveDetails {
  description: string;
  location: string;
  numberOfTickets: number;
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

  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extraType, setExtraType] = useState<number>();
  const [ticketTypes, setTicketTypes] = useState<ExtraDetail[]>([]);
  const [consumables, setConsumables] = useState<ExtraDetail[]>([]);

  const contractAddress = useContractAddress();

  const { data, error, isLoading } = useReadContract({
    abi: EventCreation.abi,
    address: contractAddress,
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  const addresses = data as string[] | undefined;

  const [extraDetails, setExtraDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!addresses || addresses.length === 0) {
        setExtraDetails([]);
        return;
      }
      const promises = addresses.map(address =>
        fetchExtraDetails(address)
          .then(details => ({ address, ...details }))
          .catch(error => ({ address, error: error.message })),
      );

      const results = await Promise.all(promises);
      setExtraDetails(results);
    };
    fetchData();
  }, [data]);

  useEffect(() => {
    const newTicketTypes: ExtraDetail[] = [];
    const newConsumables: ExtraDetail[] = [];

    extraDetails.forEach((detail: any) => {
      if (detail.extraType === 0n) {
        newTicketTypes.push(detail);
      } else if (detail.extraType === 1n) {
        newConsumables.push(detail);
      }
    });

    setTicketTypes(newTicketTypes);
    setConsumables(newConsumables);
  }, [extraDetails]);

  const handleAddModalOpen = (typeOfTheExtra: number) => {
    setExtraType(typeOfTheExtra);
    setIsAddModalOpen(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
  };

  const handleEditClick = (field: string) => {
    setCurrentField(field);
    setIsSimpleModalOpen(true);
  };

  const handleSimpleModalClose = () => {
    setIsSimpleModalOpen(false);
  };

  if (loadingEvents)
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );
  if (errorEvents) return <p>Error loading events</p>;

  let eventData;
  if (dataEvents.eventCreateds[0]) {
    eventData = dataEvents.eventCreateds[0];
  } else {
    return <p>No events found</p>;
  }

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="flex flex-col gap-4 mt-12 p-6 max-w-screen md:max-w-4xl mx-auto bg-secondary-content rounded-xl shadow-md space-x-4">
        <div className="flex flex-col md:flex-row md:justify-around">
          <div className="flex flex-col gap-8 items-center md:mt-8 ">
            <div>
              <img src={eventData.createdEvent_logoUrl} height={300} width={300} alt="Logo" className="rounded-xl" />
            </div>
            <div className="text-2xl font-extrabold">{eventData.createdEvent_name}</div>
          </div>
          <div className="flex flex-col gap-8">
            <EventDetails
              initialDescription={eventData.createdEvent_description}
              initialLocation={eventData.createdEvent_location}
              initialNumberOfTickets={eventData.createdEvent_numberOfTickets}
              eventId={id}
            />
            <div className="flex flex-col gap-4 items-center bg-base-200 p-4 rounded-xl shadow-xl">
              <div
                className="tooltip tooltip-secondary"
                data-tip="Here you can add a new Ticket Type. It will deploy a new contract for your ticket."
              >
                <button
                  className="btn btn-primary rounded btn-md w-48 font-poppins"
                  onClick={() => handleAddModalOpen(0)}
                >
                  Add Ticket Type
                </button>
              </div>
              <div
                className="tooltip tooltip-secondary"
                data-tip="Here you can add a new Consumable. This could represent a drink, a snack or anything else that you would need for your event. It will deploy a new contract for your consumable."
              >
                <button
                  className="btn btn-primary rounded btn-md w-48 font-poppins"
                  onClick={() => handleAddModalOpen(1)}
                >
                  Add Consumable
                </button>
              </div>
              <div
                className="tooltip tooltip-secondary"
                data-tip="Here you can add a new Allowed Address. An Allowed Address can Redeem attendee's tickets or consumables. They could be bartenders, security or anybody you trust with those rights."
              >
                <button
                  className="btn btn-primary rounded btn-md w-48 font-poppins"
                  onClick={() => handleEditClick("createdEvent_allowedAddress")}
                >
                  Add Allowed Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-11 md:px-20 xl:px-40 mt-8">
        <h1 className="text-2xl font-bold my-4">Ticket Types</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ticketTypes.map((item, index) => (
            <ExtraCard
              extraName={item.name}
              description={item.description}
              imageUrl={item.imageUrl}
              price={Number(item.price) / 100}
              hasQuantity={false}
              action={ACTIONS.MANAGE}
              manageUrl={"/extra/" + item.address}
              extraType={Number(item.extraType)}
            />
          ))}
        </div>
      </div>
      <div className="container mx-auto px-11 md:px-20 xl:px-40 mt-8">
        <h1 className="text-2xl font-bold my-4">Consumables</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {consumables.map((item, index) => (
            <ExtraCard
              extraName={item.name}
              description={item.description}
              imageUrl={item.imageUrl}
              price={Number(item.price) / 100}
              hasQuantity={false}
              action={ACTIONS.MANAGE}
              manageUrl={"/extra/" + item.address}
              extraType={Number(item.extraType)}
            />
          ))}
        </div>
      </div>
      <AddExtraModal isOpen={isAddModalOpen} onClose={handleAddModalClose} extraType={extraType!} id={id} />
      <SimpleModal
        isOpen={isSimpleModalOpen}
        onClose={handleSimpleModalClose}
        fieldName={currentField.replace("createdEvent_", "")}
        eventId={BigInt(id)}
      />
    </div>
  );
};

export default EditDashboardPage;
