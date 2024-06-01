import React from "react";
import Link from "next/link";
import Card from "./BaseCard";

interface EventCardProps {
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
  eventName,
  eventDescription,
  eventLocation,
  logoUrl,
  hasBookmark,
  onToggleBookmark,
  isBookmarked,
  actionUrl,
  actionLabel,
}) => {
  return (
    <Card className="w-72 bg-red-pattern bg-cover bg-no-repeat rounded-lg flex flex-col">
      {logoUrl && <img src={logoUrl} alt={eventName} className="w-full h-48 object-cover rounded-lg" />}
      <div className="flex flex-col items-center h-full pt-2 justify-between">
        <div className="overflow-hidden" style={{ maxHeight: "4rem" }}>
          <h2 className="text-center text-lg font-bold text-ellipsis font-outfit">{eventName}</h2>
        </div>
        {eventDescription && <p className="font-outfit">{eventDescription}</p>}
        {eventLocation && <p className="text-sm text-center font-outfit">@{eventLocation}</p>}
        <div className="flex gap-2 flex-wrap justify-evenly mt-4">
          <div className="shadow hover:shadow-xl">
            <Link href={actionUrl} className="btn btn-gradient-primary rounded-xl w-36 border-0">
              {actionLabel}
            </Link>
          </div>
          {hasBookmark ? (
            <button
              className={`btn btn-gradient-primary rounded-xl w-36 border-0 shadow hover:shadow-xl`}
              onClick={onToggleBookmark}
            >
              {isBookmarked ? "Unbookmark" : "Bookmark"}
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
