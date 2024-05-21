"use client"
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import type { NextPage } from 'next';
import { GET_PERSONS_EVENTS } from "~~/utils/chain-of-events/queries"
import { useAccount } from 'wagmi'
import EventCard from '~~/components/EventCard';

//TODO: move from here
const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache()
  });

const AdminDashboard: NextPage = () => {

    const { address } = useAccount();

    const { loading: loadingEvents, error: errorEvents, data: dataEvents } = useQuery(GET_PERSONS_EVENTS, {
        variables: { address }, client: client});

    if (loadingEvents) return <div className="flex justify-center loading loading-spinner loading-lg"></div>;
    if (errorEvents) return <p>Error loading events</p>;

  return (
    <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold my-4">Events created by you</h1>
        <ul>
            {dataEvents && dataEvents.eventCreateds.map((event: any) => (
                <li key={event.id} className="my-2">
                    <EventCard event={event} />
                </li>
            ))}
        </ul>
    </div>
  );
};

export default AdminDashboard;
