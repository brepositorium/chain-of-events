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
      <div
        className={
          hasBookmark
            ? "flex flex-col items-center pt-2 justify-between h-[32rem]"
            : "flex flex-col items-center pt-2 justify-between h-48"
        }
      >
        <div className="place-content-center overflow-auto basis-1/5">
          <h2 className="text-center text-lg font-bold">{eventName}</h2>
        </div>
        {eventDescription && <p className="basis-2/5 overflow-auto">{eventDescription}</p>}
        {eventLocation && (
          <p className="place-content-center text-center font-poppins basis-1/5 overflow-auto">@{eventLocation}</p>
        )}
        {hasBookmark ? (
          <div className="flex gap-2 flex-wrap justify-evenly mt-4 basis-1/5">
            <div className="shadow hover:shadow-xl">
              <Link href={actionUrl} className="btn btn-gradient-primary rounded-xl w-36 border-0">
                {actionLabel}
              </Link>
            </div>
            <button
              className={`btn btn-gradient-primary rounded-xl w-36 border-0 shadow hover:shadow-xl`}
              onClick={onToggleBookmark}
            >
              {isBookmarked ? "Unbookmark" : "Bookmark"}
            </button>
          </div>
        ) : (
          <div className="shadow hover:shadow-xl">
            <Link href={actionUrl} className="btn btn-gradient-primary rounded-xl w-36 border-0">
              {actionLabel}
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventCard;
