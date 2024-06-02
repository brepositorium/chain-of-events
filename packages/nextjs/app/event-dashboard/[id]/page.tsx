"use client";

import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import AddExtraModal from "~~/components/AddExtraModal";
import ExtraCard from "~~/components/ExtraCard";
import SimpleModal from "~~/components/SimpleModal";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { ACTIONS } from "~~/utils/chain-of-events/Actions";
import { fetchExtraDetails } from "~~/utils/chain-of-events/deployContract";
import { GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries";

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache(),
});

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

  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [extraType, setExtraType] = useState<number>();
  const [ticketTypes, setTicketTypes] = useState<ExtraDetail[]>([]);
  const [consumables, setConsumables] = useState<ExtraDetail[]>([]);

  const { data } = useScaffoldReadContract({
    contractName: "EventCreation",
    functionName: "getExtras",
    args: [BigInt(id)],
  });

  const [extraDetails, setExtraDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!data || data.length === 0) {
        setExtraDetails([]);
        return;
      }
      const promises = data.map(address =>
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

  const eventData = dataEvents.eventCreateds[0];

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="flex flex-col gap-4 mt-12 items-center p-6 max-w-2xl mx-auto bg-gradient-to-b from-secondary via-primary to-secondary ... rounded-xl shadow-md space-x-4">
        <div className="text-2xl font-extrabold mb-6 font-outfit">{eventData.createdEvent_name}</div>
        <div className="flex">
          <div className="text-lg w-96 border p-2 font-outfit">{eventData.createdEvent_description}</div>
          <button
            className="btn btn-gradient-primary rounded btn-sm ml-8"
            onClick={() => handleEditClick("createdEvent_description")}
          >
            Edit description
          </button>
        </div>
        <div className="flex">
          <div className="text-lg w-96 border p-2 mr-6 font-outfit">{eventData.createdEvent_location}</div>
          <button
            className="btn btn-gradient-primary rounded btn-sm ml-8"
            onClick={() => handleEditClick("createdEvent_location")}
          >
            Edit location
          </button>
        </div>
        <div className="text-lg mt-6 font-outfit">
          No. of tickets: &nbsp; &nbsp; {eventData.createdEvent_numberOfTickets}
          <button
            className="btn btn-gradient-primary rounded btn-sm ml-8 font-sans"
            onClick={() => handleEditClick("createdEvent_numberOfTickets")}
          >
            Edit number of tickets
          </button>
        </div>
        <div className="mt-8">
          <button className="btn btn-gradient-primary rounded btn-md" onClick={() => handleAddModalOpen(0)}>
            Add Ticket Type
          </button>
        </div>
        <div>
          <button className="btn btn-gradient-primary rounded btn-md" onClick={() => handleAddModalOpen(1)}>
            Add Consumable
          </button>
        </div>
        <div>
          <button
            className="btn btn-gradient-primary rounded btn-md"
            onClick={() => handleEditClick("createdEvent_allowedAddress")}
          >
            Add Allowed Address
          </button>
        </div>
      </div>
      <div className="container mx-auto px-40 mt-8">
        <h1 className="text-2xl font-bold my-4">Ticket types</h1>
        <div className="grid grid-cols-3 gap-4">
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
      <div className="container mx-auto px-40">
        <h1 className="text-2xl font-bold my-4">Consumables</h1>
        <div className="grid grid-cols-3 gap-4 mt-4">
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
