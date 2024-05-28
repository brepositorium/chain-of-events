import React from 'react';
import Card from './BaseCard';
import Link from 'next/link';

interface EventCardProps {
    eventId: number;
    eventName: string;
    eventDescription?: string;
    eventLocation?: string;
    logoUrl?: string;
    hasBookmark: boolean;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
    actionUrl: string;
    actionLabel: string;
}

const EventCard: React.FC<EventCardProps> = ({
    eventId,
    eventName,
    eventDescription,
    eventLocation,
    logoUrl,
    hasBookmark,
    onToggleBookmark,
    isBookmarked,
    actionUrl,
    actionLabel
}) => {
    return (
        <Card className={
            hasBookmark 
            ? "w-72 bg-red-pattern bg-cover bg-no-repeat min-h-[400px] flex flex-col"
            : "w-72 bg-red-pattern bg-cover bg-no-repeat min-h-[200px] flex flex-col"
        }>
            {logoUrl && <img src={logoUrl} alt={eventName} className="w-full h-48 object-cover rounded-t-lg" />}
            <div className="flex flex-col items-center h-full pt-2 justify-between">
                <div className="overflow-hidden" style={{ maxHeight: '4rem' }}>
                    <h2 className="text-center text-lg font-bold text-ellipsis">{eventName}</h2>
                </div>
                {eventDescription && <p>{eventDescription}</p>}
                {eventLocation && <p className="text-sm text-center">{eventLocation}</p>}
                <div className="flex gap-2 flex-wrap justify-evenly mt-4">
                    <div className='shadow hover:shadow-xl'>
                        <Link href={actionUrl} className="btn btn-gradient-primary rounded-xl w-36 border-0">
                            {actionLabel}
                        </Link>
                    </div>
                    {hasBookmark ? 
                    <button
                        className={`btn btn-gradient-primary rounded-xl w-36 border-0`}
                        onClick={onToggleBookmark}
                    >
                        {isBookmarked ? 'Unbookmark' : 'Bookmark'}
                    </button>
                    : <div></div>
                    }
                </div>
            </div>
        </Card>
    );
};

export default EventCard;
