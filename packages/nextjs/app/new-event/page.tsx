"use client";
import React, { useState } from "react";
import { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

import { pinFileToIPFS } from '~~/utils/chain-of-events/deployContract';

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
    } 

    const handleSubmit = async () => {
        if (image != null){
            try {
            writeEventCreationAsync({
                functionName: "createEvent",
                args: [name, description, location, await pinFileToIPFS(image), BigInt(numberOfTickets)]
            });
            console.log("Succesfully created event");
            } catch (e) {
            console.error("Error creating event:", e);
            }
        }
    }

    return (
        <div>
        <form>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input input-bordered w-full max-w-md"
                    />
                </div>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="input input-bordered w-full max-w-md"
                    />
                </div>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="input input-bordered w-full max-w-md"
                    />
                </div>
                <div className="mt-4">
                    <input
                        type="number"
                        placeholder="Number of Tickets"
                        value={numberOfTickets}
                        onChange={e => setNumberOfTickets(parseInt(e.target.value))}
                        className="input input-bordered w-full max-w-md"
                    />
                </div>
                <div className="mt-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input input-bordered w-full max-w-md"
                    />
                </div>
                <div className="py-4">
                    <button type="button" className="btn" onClick={handleSubmit}>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default NewEvent;
