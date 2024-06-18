import React, { useEffect, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import toast from "react-hot-toast";
import useEventCreationAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { changeDescription, changeLocation, changeNumberOfTickets } from "~~/utils/chain-of-events/deployContract";

interface EventDetailsProps {
  initialDescription: string;
  initialLocation: string;
  initialNumberOfTickets: number;
  eventId: number;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  initialDescription,
  initialLocation,
  initialNumberOfTickets,
  eventId,
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [location, setLocation] = useState(initialLocation);
  const [numberOfTickets, setNumberOfTickets] = useState(initialNumberOfTickets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDescriptionChanged, setIsDescriptionChanged] = useState(false);
  const [isLocationChanged, setIsLocationChanged] = useState(false);
  const [isNumberOfTicketsChanged, setIsNumberOfTicketsChanged] = useState(false);
  const [fieldToSave, setFieldToSave] = useState("");

  const eventCreationAddress = useEventCreationAddress();

  useEffect(() => {
    const currentTickets = parseInt(numberOfTickets.toString(), 10);
    const initialTickets = parseInt(initialNumberOfTickets.toString(), 10);

    const hasDescriptionChanged = description !== initialDescription;

    const hasLocationChanged = location !== initialLocation;
    const hasNumberOfTicketsChanged = currentTickets !== initialTickets;

    setIsDescriptionChanged(hasDescriptionChanged);
    setIsLocationChanged(hasLocationChanged);
    setIsNumberOfTicketsChanged(hasNumberOfTicketsChanged);
  }, [description, location, numberOfTickets, initialDescription, initialLocation, initialNumberOfTickets]);

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
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to update: " + error);
    }
    setIsModalOpen(false);
  };

  return (
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
      <div className="flex flex-col">
        <p className="self-start font-medium font-poppins">Location</p>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="input input-md input-bordered w-80 bg-secondary-content rounded text-black -mt-3"
        />
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
      <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmSave}>
        Are you sure you want to save the changes?
      </ConfirmationModal>
    </div>
  );
};

export default EventDetails;
