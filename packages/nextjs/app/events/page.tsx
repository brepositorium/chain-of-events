"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { get, ref, runTransaction } from "firebase/database";
import { useAccount } from "wagmi";
import EventCard from "~~/components/EventCard";
import useApolloClient from "~~/hooks/chain-of-events/useApolloClient";
import { database } from "~~/utils/chain-of-events/firebaseConfig";
import { GET_ALL_EVENTS_PAGINATED, GET_EVENTS_DETAILS_BY_IDS } from "~~/utils/chain-of-events/queries";

interface EventDetail {
  id: number;
  createdEvent_id: number;
  createdEvent_name: string;
  createdEvent_description: string;
  createdEvent_location: string;
  createdEvent_logoUrl: string;
}

const EventsPage = () => {
  const { address } = useAccount();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const client = useApolloClient();

  const {
    data: dataEventsDetails,
    loading: loadingEventsDetails,
    error: errorEventsDetails,
  } = useQuery(GET_EVENTS_DETAILS_BY_IDS, {
    variables: { ids: bookmarkedEvents },
    client,
    skip: bookmarkedEvents?.length < 1,
  });

  useEffect(() => {
    if (address) {
      const bookmarksRef = ref(database, "bookmarks/" + address);
      get(bookmarksRef).then(snapshot => {
        if (snapshot.exists()) {
          setBookmarkedEvents(snapshot.val());
        } else {
          setBookmarkedEvents([]);
        }
      });
    }
  }, [address]);

  const { data, fetchMore, loading, error } = useQuery(GET_ALL_EVENTS_PAGINATED, {
    variables: { first: 3, after: 0 },
    client: client,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const toggleBookmark = (eventId: number) => {
    if (bookmarkedEvents?.includes(eventId)) {
      deleteEventIdForAddress(eventId);
    } else {
      bookmarkEvent(eventId);
    }
  };

  const bookmarkEvent = (eventId: number) => {
    const bookmarksRef = ref(database, "bookmarks/" + address);

    runTransaction(bookmarksRef, (currentEvents: any) => {
      if (currentEvents === null) {
        return [eventId];
      } else {
        if (!currentEvents.includes(eventId)) {
          currentEvents.push(eventId);
        }
        return currentEvents;
      }
    })
      .then(result => {
        if (result.committed) {
          setBookmarkedEvents(result.snapshot.val());
          console.log("Event has been bookmarked!");
          console.log("User's events: ", result.snapshot.val());
        } else {
          console.log("Transaction not committed.");
        }
      })
      .catch(error => {
        console.log("Transaction failed: ", error);
      });
  };

  const deleteEventIdForAddress = (eventId: number) => {
    const bookmarksRef = ref(database, "bookmarks/" + address);
    runTransaction(bookmarksRef, currentEvents => {
      if (currentEvents === null) {
        return currentEvents;
      } else {
        const index = currentEvents.indexOf(eventId);
        if (index > -1) {
          currentEvents.splice(index, 1);
        }
        return currentEvents;
      }
    })
      .then(result => {
        if (result.committed) {
          setBookmarkedEvents(result.snapshot.val());
          console.log("Event ID has been removed!");
          console.log("Updated events for address: ", result.snapshot.val());
        } else {
          console.log("No changes were made to the bookmarks.");
        }
      })
      .catch(error => {
        console.log("Transaction failed abnormally!", error);
      });
  };

  const handleLoadMore = () => {
    const lastEvent = data.eventCreateds[data.eventCreateds.length - 1];
    fetchMore({
      variables: {
        after: lastEvent.cursorField,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          eventCreateds: [...prev.eventCreateds, ...fetchMoreResult.eventCreateds],
        };
      },
    });
  };

  const handleSearchChange = (event: { target: { value: string } }) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredEvents = data.eventCreateds.filter((event: EventDetail) =>
    event.createdEvent_name.toLowerCase().includes(searchTerm),
  );

  return (
    <div className="h-[650px] bg-circles bg-no-repeat">
      <div className="container mx-auto px-40">
        <div className="flex flex-col justify-between my-8">
          <h1 className="text-2xl font-bold mb-4">Bookmarked events</h1>
          <div className="grid grid-cols-3 gap-4">
            {dataEventsDetails && dataEventsDetails.eventCreateds.length > 0 ? (
              dataEventsDetails.eventCreateds.map((event: any) => (
                <EventCard
                  key={event.id}
                  logoUrl={event.createdEvent_logoUrl}
                  eventName={event.createdEvent_name}
                  eventDescription={event.createdEvent_description}
                  eventLocation={event.createdEvent_location}
                  actionUrl={"/event-info/" + Number(event.createdEvent_id)}
                  actionLabel="See more"
                  hasBookmark={true}
                  onToggleBookmark={() => toggleBookmark(event.createdEvent_id)}
                  isBookmarked={bookmarkedEvents?.includes(event.createdEvent_id)}
                />
              ))
            ) : (
              <p>No bookmarked events found.</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-40">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Find events</h1>
          <div className="relative w-50">
            <input
              type="text"
              placeholder="Search events"
              className="input input-md input-bordered w-full bg-base-content rounded-lg text-black pl-10 font-outfit"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {filteredEvents.map((event: EventDetail) => (
            <EventCard
              key={event.id}
              logoUrl={event.createdEvent_logoUrl}
              eventName={event.createdEvent_name}
              eventDescription={event.createdEvent_description}
              eventLocation={event.createdEvent_location}
              actionUrl={"/event-info/" + Number(event.createdEvent_id)}
              actionLabel="See more"
              hasBookmark={true}
              onToggleBookmark={() => toggleBookmark(event.createdEvent_id)}
              isBookmarked={bookmarkedEvents?.includes(event.createdEvent_id)}
            />
          ))}
        </div>
        <div className="flex items-center justify-center">
          <button className="btn btn-sm btn-primary rounded-xl w-36 border-0 my-8" onClick={handleLoadMore}>
            Load more
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
