"use client"
import { useEffect, useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { fetchExtraDetails, mintNft } from "~~/utils/chain-of-events/deployContract";
import { useAccount } from 'wagmi'

type PageProps = {
    params: { id: number, extraType: number }
  };

  interface ExtraDetail {
    address: string;
    extraType: bigint;
    name: string;
    symbol: string;
    price: bigint;
    uri: string;
}

const ShopPage = ({ params }: PageProps) => {
    const id = params.id;
    const extraType = params.extraType;

    const { address } = useAccount();

    const [ticketTypes, setTicketTypes] = useState<ExtraDetail[]>([]);

    const { data } = useScaffoldReadContract({
        contractName: "EventCreation",
        functionName: "getExtras",
        args: [BigInt(id)]
    });

    useEffect(() => {
        const fetchExtras = async () => {
            if (!data || data.length === 0) {
                setTicketTypes([]);
                return;
            }
            const promises = data.map(address =>
                fetchExtraDetails(address)
                .then(details => Number(details?.extraType) === Number(extraType) ? { address, ...details } : null)
                .catch(error => ({ address, error: error.message }))
            );
    
            const results = await Promise.all(promises);
            const filteredTickets = results.filter(item => item !== null) as ExtraDetail[];
            
            setTicketTypes(filteredTickets);
        };
        fetchExtras();
    }, [data]);

    const handleBuy = async (ticketAddress: string, ticketPrice: BigInt) => {
        if(address) {
            try {
                await mintNft(ticketAddress, address, ticketPrice.toString());
                console.log("Minting successful");
            } catch (e) {
                console.error("Error setting greeting:", e);
            }
        }
    };
    

    return (
        <div>
            <h1>Available Tickets</h1>
            <div className="ticket-list">
                {ticketTypes.length > 0 ? ticketTypes.map((ticket, index) => (
                    <div key={index} className="ticket-item">
                        <p>Name: {ticket.name}</p>
                        <p>Symbol: {ticket.symbol}</p>
                        <p>Price: {Number(ticket?.price)} Wei</p>
                        <p>URI: {ticket.uri}</p>
                        <button className="btn" onClick={() => handleBuy(ticket.address, ticket.price)}>Buy</button>
                    </div>
                )) : <p>No tickets available.</p>}
            </div>
        </div>
    );
    
}

export default ShopPage;
