"use client"
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import type { NextPage } from 'next';
import { GET_PERSONS_EVENTS } from "~~/utils/chain-of-events/queries"
import { useAccount } from 'wagmi'
import EventCard from '~~/components/EventCard';
import { useState } from 'react';

//TODO: move from here
const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache()
  });

const AdminDashboard: NextPage = () => {

    const { address } = useAccount();
    const [visibleEvents, setVisibleEvents] = useState<number>(3);

    const { loading: loadingEvents, error: errorEvents, data: dataEvents } = useQuery(GET_PERSONS_EVENTS, {
        variables: { address }, client: client});

    if (loadingEvents) return <div className="flex justify-center loading loading-spinner loading-lg"></div>;
    if (errorEvents) return <p>Error loading events</p>;

    const loadMoreEvents = () => {
      setVisibleEvents((current: number) => current + 3);
  };

  return (
    <div className="h-[650px] bg-circles bg-no-repeat">
      <div className="container mx-auto px-40">
          <h1 className="text-2xl font-bold my-4">Events created by you</h1>
          <div className="grid grid-cols-3 gap-4">
              {dataEvents && dataEvents.eventCreateds.slice(0, visibleEvents).map((event: any) => (
                  <EventCard 
                  key={event.id}
                  eventId={event.createdEvent_id} 
                  eventName={event.createdEvent_name} 
                  manageUrl={"/event-dashboard/" + Number(event.createdEvent_id)}
                  />
              ))}
          </div>
          {visibleEvents < dataEvents.eventCreateds.length && (
              <button className="btn btn-gradient-primary rounded-xl mt-4" onClick={loadMoreEvents}>
                  Load more
              </button>
          )}
      </div>
    </div>
  );
};

export default AdminDashboard;
