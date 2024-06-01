"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { pinFileToIPFS } from "~~/utils/chain-of-events/deployContract";

const NewEvent: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const { writeContractAsync: writeEventCreationAsync } = useScaffoldWriteContract("EventCreation");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (image != null) {
      try {
        writeEventCreationAsync({
          functionName: "createEvent",
          args: [name, description, location, await pinFileToIPFS(image), BigInt(numberOfTickets)],
        });
        console.log("Succesfully created event");
      } catch (e) {
        console.error("Error creating event:", e);
      }
    }
  };

  return (
    <div className="bg-circles bg-contain bg-center bg-no-repeat">
      <form className="flex flex-col items-center gap-6 mt-8">
        <div className="mr-28 mt-4 text-xl font-bold justify-center px-4">
          <h1>Create your own event</h1>
        </div>
        <div className="">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-md input-bordered w-80 bg-base-content rounded text-black"
          />
        </div>
        <div className="">
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="textarea textarea-bordered w-80 bg-base-content rounded text-black"
          />
        </div>
        <div className="">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input input-md input-bordered w-80 bg-base-content rounded text-black"
          />
        </div>
        <div className="">
          <input
            type="number"
            placeholder="Number of Tickets"
            value={numberOfTickets}
            onChange={e => setNumberOfTickets(parseInt(e.target.value))}
            className="input input-md input-bordered w-80 bg-base-content rounded text-black"
          />
        </div>
        <div className="">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-80 rounded bg-base-content text-black"
          />
        </div>
        <div className="ml-36">
          <button type="button" className="btn btn-gradient-primary rounded-xl w-36" onClick={handleSubmit}>
            Create event
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEvent;
