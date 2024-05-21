import Link from 'next/link';
import React from 'react';

interface EventCardProps {
    event: {
        createdEvent_id: string;
        createdEvent_name: string;
    };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{event.createdEvent_name}</h2>
                <div className="card-actions justify-end">
                    <Link href={"/event-dashboard/" + Number(event.createdEvent_id)} className="btn btn-primary">
                        Manage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
