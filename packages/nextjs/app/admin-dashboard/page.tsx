"use client"
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import type { NextPage } from 'next';
import { GET_PERSONS_EVENTS } from "~~/utils/chain-of-events/queries"
import { useAccount } from 'wagmi'
import EventCard from '~~/components/EventCard';
import { useState } from 'react';

const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
  cache: new InMemoryCache()
  });

const AdminDashboard: NextPage = () => {

    const { address } = useAccount();
    const [visibleEvents, setVisibleEvents] = useState<number>(3);

    const { loading: loadingEvents, error: errorEvents, data: dataEvents } = useQuery(GET_PERSONS_EVENTS, {
        variables: { address }, client: client});

    if (loadingEvents) return(
    <div className="flex items-center justify-center h-[650px]">
      <div className="loading loading-ring loading-lg"></div>
    </div>);
    if (errorEvents) return <p>Error loading events</p>;

    const loadMoreEvents = () => {
      setVisibleEvents((current: number) => current + 3);
  };

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="container mx-auto px-40">
          <h1 className="text-2xl font-bold my-8">Events created by you</h1>
          <div className="grid grid-cols-3 gap-4">
              {dataEvents && dataEvents.eventCreateds.slice(0, visibleEvents).map((event: any) => (
                  <EventCard 
                  key={event.id}
                  eventName={event.createdEvent_name}
                  actionUrl={"/event-dashboard/" + Number(event.createdEvent_id)}
                  actionLabel='Manage'
                  hasBookmark={false}
                  />
              ))}
          </div>
          {visibleEvents < dataEvents.eventCreateds.length && (
            <div className='flex items-center justify-center mr-4'>
              <button className="btn btn-gradient-primary btn-sm rounded-xl mt-4" onClick={loadMoreEvents}>
                  Load more
              </button>
            </div>
          )}
      </div>
    </div>
  );
};

export default AdminDashboard;
