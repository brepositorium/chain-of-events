"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import EventCard from "~~/components/EventCard";
import useApolloClient from "~~/hooks/chain-of-events/useApolloClient";
import { GET_PERSONS_EVENTS } from "~~/utils/chain-of-events/queries";

const AdminDashboard: NextPage = () => {
  const { address } = useAccount();
  const [visibleEvents, setVisibleEvents] = useState<number>(3);
  const client = useApolloClient();

  const {
    loading: loadingEvents,
    error: errorEvents,
    data: dataEvents,
  } = useQuery(GET_PERSONS_EVENTS, {
    variables: { address },
    client,
  });

  if (loadingEvents)
    return (
      <div className="flex items-center justify-center h-[650px]">
        <div className="loading loading-ring loading-lg"></div>
      </div>
    );
  if (errorEvents) return <p>Error loading events</p>;

  const loadMoreEvents = () => {
    setVisibleEvents((current: number) => current + 3);
  };

  return (
    <div className="h-[650px] bg-spirals bg-no-repeat">
      <div className="container mx-auto px-11 md:px-20 xl:px-40">
        <h1 className="text-2xl font-bold my-8">Events Created by You</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataEvents &&
            dataEvents.eventCreateds
              .slice(0, visibleEvents)
              .map((event: any) => (
                <EventCard
                  key={event.id}
                  eventName={event.createdEvent_name}
                  actionUrl={"/event-dashboard/" + Number(event.createdEvent_id)}
                  actionLabel="Manage"
                  hasBookmark={false}
                />
              ))}
        </div>
        {visibleEvents < dataEvents.eventCreateds.length && (
          <div className="flex items-center justify-center mr-4">
            <button
              className="btn btn-gradient-primary text-secondary-content border-none hover:shadow-2xl btn-sm rounded-xl mt-4"
              onClick={loadMoreEvents}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
