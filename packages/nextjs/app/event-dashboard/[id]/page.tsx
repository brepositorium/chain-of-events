"use client"
import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries";
import SimpleModal from '~~/components/SimpleModal';
import AddExtraModal from '~~/components/AddExtraModal';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { fetchExtraDetails, pauseSellingForExtra, unpauseSellingForExtra } from "~~/utils/chain-of-events/deployContract";


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

    const handlePause = (address: string) => {

        if(!sellingPaused) {
            pauseSellingForExtra(address);
            setSellingPaused(true);
        } else {
            unpauseSellingForExtra(address);
            setSellingPaused(false);
        }
    }

    if (loadingEvents) return <div className="flex justify-center loading loading-spinner loading-lg"></div>;
    if (errorEvents) return <p>Error loading events</p>;

    const eventData = dataEvents.eventCreateds[0];

    //TODO: improve logic here
  return (
    <div>
      <div>
        <label>Name: {eventData.createdEvent_name}</label>
      </div>
      <div>
        <label>Description: {eventData.createdEvent_description}</label>
        <button className="btn" onClick={() => handleEditClick('createdEvent_description')}>Edit</button>
      </div>
      <div>
        <label>Location: {eventData.createdEvent_location}</label>
        <button className="btn" onClick={() => handleEditClick('createdEvent_location')}>Edit</button>
      </div>
      <div>
        <label>Logo URL: {eventData.createdEvent_logoUrl}</label>
        <button className="btn" onClick={() => handleEditClick('createdEvent_logoUrl')}>Edit</button>
      </div>
      <div>
        <label>Number of tickets: {eventData.createdEvent_numberOfTickets}</label>
        <button className="btn" onClick={() => handleEditClick('createdEvent_numberOfTickets')}>Edit</button>
      </div>
      <div>
        <button className="btn" onClick={() => handleAddModalOpen(0)}>Add ticket type</button>
      </div>
      <div>
        <button className="btn" onClick={() => handleAddModalOpen(1)}>Add consumable</button>
      </div>
      <div>
            <div>
                <h2>Ticket Types</h2>
                {ticketTypes.map((item, index) => (
                    <>
                        <div key={index} className="box">
                            <p>Name: {item.name}</p>
                            <p>Symbol: {item.symbol}</p>
                            <p>Price: {item.price.toString()}</p>
                            <p>URI: {item.uri}</p>
                        </div>
                        <div>
                            <button className="btn" onClick={() => handleEditClick('createdEvent_price')}>Change price</button>
                            <button className="btn" onClick={() => {handlePause(item.address)}}>Pause selling</button>
                        </div>
                    </>    
                ))}
            </div>
            <div>
                <h2>Consumables</h2>
                {consumables.map((item, index) => (
                    <>
                    <div key={index} className="box">
                        <p>Name: {item.name}</p>
                        <p>Symbol: {item.symbol}</p>
                        <p>Price: {item.price.toString()}</p>
                        <p>URI: {item.uri}</p>
                    </div>
                    <div>
                        <button className="btn" onClick={() => handleEditClick('createdEvent_price')}>Change price</button>
                        <button className="btn" onClick={() => {handlePause(item.address)}}>Pause selling</button>
                    </div>
                </>   
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
