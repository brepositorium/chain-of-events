"use client"
import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries";
import SimpleModal from '~~/components/SimpleModal';
import AddExtraModal from '~~/components/AddExtraModal';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { fetchExtraDetails } from "~~/utils/chain-of-events/deployContract";
import ExtraCard from "~~/components/ExtraCard";


//TODO: move from here
const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache()
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
    const { loading: loadingEvents, error: errorEvents, data: dataEvents } = useQuery(GET_EVENT_DETAILS_BY_ID, {
        variables: { id }, client: client});

    const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [extraType, setExtraType] = useState<number>();
    const [ticketTypes, setTicketTypes] = useState<ExtraDetail[]>([]);
    const [consumables, setConsumables] = useState<ExtraDetail[]>([]);
    const [sellingPaused, setSellingPaused] = useState(false);
    
    const { data } = useScaffoldReadContract({
        contractName: "EventCreation",
        functionName: "getExtras",
        args: [BigInt(id)]
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
                .catch(error => ({ address, error: error.message }))
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
        setExtraType(typeOfTheExtra)
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

    if (loadingEvents) return <div className="flex justify-center loading loading-spinner loading-lg"></div>;
    if (errorEvents) return <p>Error loading events</p>;

    const eventData = dataEvents.eventCreateds[0];

  return (
    <div className="h-[650px] bg-circles bg-no-repeat">
      <div className="flex flex-col items-center mt-12 gap-4">
        <div className="text-2xl font-extrabold mb-6">
          {eventData.createdEvent_name}
        </div>
        <div className="flex">
          <div className="text-lg w-96 border p-2">
            {eventData.createdEvent_description}
          </div>
          <button className="btn btn-gradient-primary rounded btn-sm ml-8" onClick={() => handleEditClick('createdEvent_description')}>Edit description</button>
        </div>
        <div className="flex">
          <div className="text-lg w-96 border p-2 mr-6">
            {eventData.createdEvent_location}
          </div>
          <button className="btn btn-gradient-primary rounded btn-sm ml-8" onClick={() => handleEditClick('createdEvent_location')}>Edit location</button>
        </div>
        <div className="text-lg mt-6">
          No. of tickets: &nbsp; &nbsp; {eventData.createdEvent_numberOfTickets}
          <button className="btn btn-gradient-primary rounded btn-sm ml-8" onClick={() => handleEditClick('createdEvent_numberOfTickets')}>Edit number of tickets</button>
        </div>
        <div className="mt-8">
          <button className="btn btn-gradient-primary rounded btn-md ml-8" onClick={() => handleAddModalOpen(0)}>Add ticket type</button>
        </div>
        <div>
          <button className="btn btn-gradient-primary rounded btn-md ml-8" onClick={() => handleAddModalOpen(1)}>Add consumable</button>
        </div>
      </div>
      <div className="container mx-auto px-40">
        <h1 className="text-2xl font-bold my-4">Ticket types</h1>
        <div className="grid grid-cols-3 gap-4">
            {ticketTypes.map((item, index) => (
              <ExtraCard
              extraName={item.name}
              description={item.description}
              imageUrl={item.imageUrl}
              price={Number(item.price)}
              hasQuantity={false}
              actions={[
                  { label: 'Manage', url: "/extra/" + item.address}
              ]}
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
                price={Number(item.price)}
                hasQuantity={false}
                actions={[
                    { label: 'Manage', url: "/extra/" + item.address}
                ]}
                extraType={Number(item.extraType)}
                /> 
            ))}
        </div>
      </div>
      <AddExtraModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        extraType={extraType!}
        id={id}
      />
      <SimpleModal
        isOpen={isSimpleModalOpen}
        onClose={handleSimpleModalClose}
        fieldName={currentField.replace('createdEvent_', '')}
        eventId={BigInt(id)}
      />
    </div>
  );
};

export default EditDashboardPage;
