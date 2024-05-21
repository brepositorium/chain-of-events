"use client"
import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client";
import { GET_ALL_EVENTS_PAGINATED, GET_EVENTS_DETAILS_BY_IDS, GET_EVENT_DETAILS_BY_ID } from "~~/utils/chain-of-events/queries"
import { database } from "~~/utils/chain-of-events/firebaseConfig"
import { get, ref, runTransaction } from "firebase/database";
import { useAccount } from 'wagmi'
import { useEffect, useState } from "react";
import Link from "next/link";

//TODO: move from here
const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/71641/test-coe/version/latest",
    cache: new InMemoryCache()
  });

interface EventDetail {
    id: number,
    createdEvent_id: number,
    createdEvent_name: string,
    createdEvent_description: string,
    createdEvent_location: string
}

const EventsPage = () => {

    const { address } = useAccount();
    const [bookmarkedEvents, setBookmarkedEvents] = useState<number[]>([]);

    const { data: dataEventsDetails, loading: loadingEventsDetails, error: errorEventsDetails } = useQuery(GET_EVENTS_DETAILS_BY_IDS, {
        variables: { ids: bookmarkedEvents },
        client: client,
        skip: bookmarkedEvents?.length < 1,
    });
    
    useEffect(() => {
        if (address) {
            const bookmarksRef = ref(database, 'bookmarks/' + address);
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
        variables: { first: 2, after: 0 }, client: client
      });

      if (loading) return <p>Loading...</p>;
      if (error) return <p>Error: {error.message}</p>;

    const bookmarkEvent = (eventId: number) => {
        const bookmarksRef = ref(database, 'bookmarks/' + address);

        runTransaction(bookmarksRef, (currentEvents: any) => {
            if (currentEvents === null) {
            return [eventId];
            } else {
            if (!currentEvents.includes(eventId)) {
                currentEvents.push(eventId);
            }
            return currentEvents;
            }
        }).then((result) => {
            if (result.committed) {
            setBookmarkedEvents(result.snapshot.val());
            console.log('Event has been bookmarked!');
            console.log("User's events: ", result.snapshot.val());
            } else {
            console.log('Transaction not committed.');
            }
        }).catch((error) => {
            console.log('Transaction failed: ', error);
        });
      };

    const deleteEventIdForAddress = (eventId: number) => {
        const bookmarksRef = ref(database, 'bookmarks/' + address);
        runTransaction(bookmarksRef, (currentEvents) => {
        if (currentEvents === null) {
            return currentEvents;
        } else {
            const index = currentEvents.indexOf(eventId);
            if (index > -1) {
            currentEvents.splice(index, 1);
            }
            return currentEvents;
        }
        }).then((result) => {
        if (result.committed) {
            setBookmarkedEvents(result.snapshot.val());
            console.log('Event ID has been removed!');
            console.log("Updated events for address: ", result.snapshot.val());
        } else {
            console.log('No changes were made to the bookmarks.');
        }
        }).catch((error) => {
        console.log('Transaction failed abnormally!', error);
        });
    };

    const handleLoadMore = () => {
    const lastEvent = data.eventCreateds[data.eventCreateds.length - 1];
    fetchMore({
        variables: {
        after: lastEvent.cursorField
        },
        updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
            eventCreateds: [...prev.eventCreateds, ...fetchMoreResult.eventCreateds]
        };
        }
    });
    };

    return (
        <div>
            <h1>Bookmarked Events</h1>
            {dataEventsDetails && dataEventsDetails.eventCreateds.length > 0 ? (
                dataEventsDetails.eventCreateds.map((event: any) => (
                    <div key={event.createdEvent_id} style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
                        <h3>{event.createdEvent_name}</h3>
                        <p>{event.createdEvent_description}</p>
                        <p>{event.createdEvent_location}</p>
                        <Link href={`/event-info/${event.createdEvent_id}`} className="btn">See more</Link>
                    </div>
                ))
            ) : (
                <p>No bookmarked events found.</p>
            )}
            {data.eventCreateds.map((event: EventDetail) => (
                <div key={event.id} style={{ margin: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <h3>{event.createdEvent_name}</h3>
                    <p>{event.createdEvent_description}</p>
                    <p>{event.createdEvent_location}</p>
                    <div className="flex flex row">
                        <Link href={"/event-info/" + event.createdEvent_id} className="btn">See more</Link>
                        <button className="btn" onClick={() => bookmarkEvent(event.createdEvent_id)}>Bookmark</button>
                        <button className="btn" onClick={() => deleteEventIdForAddress(event.createdEvent_id)}>Delete Bookmark</button>
                    </div>
                </div>
            ))}
            <button className="btn" onClick={handleLoadMore}>Load more</button>
        </div>
    )
}

export default EventsPage;