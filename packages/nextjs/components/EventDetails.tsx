import React, { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { AutocompleteCustom } from "./PlaceAutocompleteClassic";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import useEventCreationAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import {
  changeDescription,
  changeEndTime,
  changeLocation,
  changeNumberOfTickets,
  changeStartTime,
} from "~~/utils/chain-of-events/deployContract";

interface EventDetailsProps {
  initialDescription: string;
  initialLocation: string;
  initialNumberOfTickets: number;
  initialStartTime: string;
  initialEndTime: string;
  eventId: number;
  locationAddress: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  initialDescription,
  initialLocation,
  initialNumberOfTickets,
  eventId,
  locationAddress,
  initialStartTime,
  initialEndTime,
}) => {
  const initialTimezone = moment.tz.guess();
  const [description, setDescription] = useState(initialDescription);
  const [location, setLocation] = useState(initialLocation);
  const [numberOfTickets, setNumberOfTickets] = useState(initialNumberOfTickets);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [startTime, setStartTime] = useState(
    moment(Number(initialStartTime) * 1000)
      .tz(timezone)
      .format("YYYY-MM-DDTHH:mm"),
  );
  const [endTime, setEndTime] = useState(
    moment(Number(initialEndTime) * 1000)
      .tz(timezone)
      .format("YYYY-MM-DDTHH:mm"),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);
  const [isLocationChanged, setIsLocationChanged] = useState(false);
  const [isNumberOfTicketsChanged, setIsNumberOfTicketsChanged] = useState(false);
  const [isStartTimeChanged, setIsStartTimeChanged] = useState(false);
  const [isEndTimeChanged, setIsEndTimeChanged] = useState(false);
  const [isTimezoneChanged, setIsTimezoneChanged] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(false);
  const [fieldToSave, setFieldToSave] = useState("");
  const eventCreationAddress = useEventCreationAddress();
  useEffect(() => {
    const currentTickets = parseInt(numberOfTickets.toString(), 10);
    const initialTickets = parseInt(initialNumberOfTickets.toString(), 10);

    const hasDescriptionChanged = description !== initialDescription;

    const hasLocationChanged = location !== initialLocation;
    const hasNumberOfTicketsChanged = currentTickets !== initialTickets;

    const hasStartTimeChanged =
      startTime !==
      moment(Number(initialStartTime) * 1000)
        .tz(timezone)
        .format("YYYY-MM-DDTHH:mm");
    const hasEndTimeChanged =
      endTime !==
      moment(Number(initialEndTime) * 1000)
        .tz(timezone)
        .format("YYYY-MM-DDTHH:mm");
    const hasTimezoneChanged = timezone !== initialTimezone;

    setIsDescriptionChanged(hasDescriptionChanged);
    setIsLocationChanged(hasLocationChanged);
    setIsNumberOfTicketsChanged(hasNumberOfTicketsChanged);
    setIsStartTimeChanged(hasStartTimeChanged);
    setIsEndTimeChanged(hasEndTimeChanged);
    setIsTimezoneChanged(hasTimezoneChanged);
    if (selectedPlace) {
      setMapCenter(selectedPlace);
    }
  }, [
    description,
    location,
    numberOfTickets,
    initialDescription,
    initialLocation,
    initialNumberOfTickets,
    timezone,
    startTime,
    endTime,
    initialStartTime,
    initialEndTime,
    selectedPlace,
  ]);

  const handleSave = (field: string) => {
    setFieldToSave(field);
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (fieldToSave === "description") {
        await changeDescription(description, BigInt(eventId), eventCreationAddress!);
        toast.success("Description updated successfully!");
        setIsDescriptionChanged(false);
      } else if (fieldToSave === "location") {
        await changeLocation(location, BigInt(eventId), eventCreationAddress!);
        toast.success("Location updated successfully!");
        setIsLocationChanged(false);
      } else if (fieldToSave === "numberOfTickets") {
        await changeNumberOfTickets(numberOfTickets.toString(), BigInt(eventId), eventCreationAddress!);
        toast.success("Number of tickets updated successfully!");
        setIsNumberOfTicketsChanged(false);
      } else if (fieldToSave === "startTime") {
        await changeStartTime(BigInt(moment.tz(startTime, timezone).unix()), BigInt(eventId), eventCreationAddress!);
        toast.success("Start Time updated successfully!");
        setIsStartTimeChanged(false);
      } else if (fieldToSave === "endTime") {
        await changeEndTime(BigInt(moment.tz(endTime, timezone).unix()), BigInt(eventId), eventCreationAddress!);
        toast.success("End Time updated successfully!");
        setIsEndTimeChanged(false);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update: " + error);
    }
    setIsModalOpen(false);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
    if (place && place.geometry && place.geometry.location) {
      const newSelectedPlace = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedPlace(newSelectedPlace);
      setLocation(newSelectedPlace.lat + "|" + newSelectedPlace.lng);
    }
  };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API}>
      <div className="flex flex-col items-center mt-2 bg-base-200 p-4 rounded-xl shadow-xl">
        <div className="flex flex-col">
          <p className="self-start font-medium font-poppins">Description</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="textarea textarea-bordered w-80 bg-secondary-content rounded text-black -mt-3"
          />
          <button
            onClick={() => handleSave("description")}
            className="btn btn-primary rounded btn-sm w-20 mt-2"
            disabled={!isDescriptionChanged}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col mt-10">
          {!mapCenter && <Map />}
          <AutocompleteCustom onPlaceSelect={handlePlaceSelect} isOnline={isOnline} existingValue={locationAddress} />
          {mapCenter && (
            <Map
              defaultZoom={15}
              defaultCenter={mapCenter}
              center={mapCenter}
              style={{
                width: "320px",
                height: "200px",
                borderRadius: "30px",
                overflow: "hidden",
              }}
              gestureHandling={"greedy"}
              disableDefaultUI={true}
            >
              <Marker position={mapCenter} />
            </Map>
          )}
          <button
            onClick={() => handleSave("location")}
            className="btn btn-primary rounded btn-sm w-20 mt-2"
            disabled={!isLocationChanged}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col">
          <p className="self-start font-medium font-poppins">Number of Tickets</p>
          <input
            type="number"
            value={numberOfTickets}
            onChange={e => setNumberOfTickets(parseInt(e.target.value) || 0)}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black -mt-3"
          />
          <button
            onClick={() => handleSave("numberOfTickets")}
            className="btn btn-primary rounded btn-sm w-20 mt-2"
            disabled={!isNumberOfTicketsChanged}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col">
          <p className="self-start font-medium font-poppins">Start Time</p>
          <input
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
          />
          <button
            onClick={() => handleSave("startTime")}
            className="btn btn-primary rounded btn-sm w-20 mt-2"
            disabled={!isStartTimeChanged && !isTimezoneChanged}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col">
          <p className="self-start font-medium font-poppins">End Time</p>
          <input
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
          />
          <button
            onClick={() => handleSave("endTime")}
            className="btn btn-primary rounded btn-sm w-20 mt-2"
            disabled={!isEndTimeChanged && !isTimezoneChanged}
          >
            Save
          </button>
        </div>
        <div className="flex flex-col">
          <p className="self-start font-medium font-poppins">Timezone</p>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="select select-md select-bordered w-80 bg-secondary-content rounded text-black"
          >
            {moment.tz.names().map(tz => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmSave}>
          Are you sure you want to save the changes?
        </ConfirmationModal>
      </div>
    </APIProvider>
  );
};

export default EventDetails;
