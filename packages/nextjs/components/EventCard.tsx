import React from 'react';
import Card from './BaseCard';
import Link from 'next/link';

interface EventCardProps {
    eventId: number;
    eventName: string;
    eventDescription?: string;
    eventLocation?: string;
    logoUrl?: string;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
    manageUrl: string;
}

const EventCard: React.FC<EventCardProps> = ({
    eventId,
    eventName,
    eventDescription,
    eventLocation,
    logoUrl,
    onToggleBookmark,
    isBookmarked,
    manageUrl 
}) => {
    return (
        <Card className="w-72 bg-red-pattern bg-cover">
            {logoUrl && <img src={logoUrl} alt={eventName} className="w-full h-48 object-cover rounded-t-lg" />}
            <div className="flex flex-col h-full">
                <div className="overflow-hidden" style={{ maxHeight: '4rem' }}>
                    <h2 className="text-center text-ellipsis">{eventName}</h2>
                </div>
                {eventDescription && <p>{eventDescription}</p>}
                {eventLocation && <p className="text-sm text-gray-600">{eventLocation}</p>}
                <div className='flex-grow'></div>
                <div className="flex justify-center mt-4">
                    <div className='shadow-xl'>
                        <Link href={manageUrl} className="btn btn-gradient-primary rounded-xl w-36 border-0">
                            Manage
                        </Link>
                    </div>
                    {isBookmarked ? 
                    <button
                        className={`btn ${isBookmarked ? 'bg-red-500' : 'bg-green-500'} hover:bg-red-700 transition-colors text-sm py-2 px-4 rounded-full`}
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
