"use client";

import React, { useState } from "react";
import axios from "axios";
import { NextPage } from "next";

// import { deployContract, mintTicketNft } from '~~/utils/chain-of-events/deployContract';

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

const NewEvent: NextPage = () => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState<File | null>(null);

  return (
    <div>
      {/* <form>
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
                    placeholder="Symbol"
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
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
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value))}
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
        <button type="button" className='btn' onClick={handleMintClick}>Buy ticket</button> */}
    </div>
  );
};

export default NewEvent;
