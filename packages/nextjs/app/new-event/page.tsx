"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NextPage } from "next";
import toast from "react-hot-toast";
import useEventCreationAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { createEvent, pinFileToIPFS } from "~~/utils/chain-of-events/deployContract";

type FormErrors = {
  name?: string;
  description?: string;
  location?: string;
  numberOfTickets?: string;
  image?: string;
};

const NewEvent: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();

  const eventCreationAddress = useEventCreationAddress();

  const validateForm = () => {
    const errors: FormErrors = {};
    if (name.length < 3) errors.name = "Name must be at least 3 characters long.";
    if (description.length < 3) errors.description = "Description must be at least 3 characters long.";
    if (numberOfTickets <= 0) errors.numberOfTickets = "There must be more than 0 tickets.";
    if (!image) errors.image = "Please upload an image.";
    // if (location.length < 3) errors.location = "Please enter a valid location.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !image) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    setLoading(true);

    const pinPromise = pinFileToIPFS(image).then(logoUrl => {
      toast
        .promise(
          createEvent(name, description, location, logoUrl, BigInt(numberOfTickets), eventCreationAddress!),
          {
            loading: "🏗️ Creating Event Onchain...",
            success: "Event Created Successfully!",
            error: "Failed to Create Event.",
          },
          {
            style: { minWidth: "250px" },
            success: { duration: 5000, icon: "🔗" },
          },
        )
        .then(() => {
          router.push("/admin-dashboard");
        });
    });

    toast.promise(
      pinPromise,
      {
        loading: "👨‍🎨 Pinning Image to IPFS...",
        success: "Image Pinned Successfully!",
        error: "Failed to Pin Image.",
      },
      {
        style: { minWidth: "250px" },
        success: { icon: "🖼️" },
      },
    );

    try {
      await pinPromise;
    } catch (error) {
      console.error("Error with IPFS pinning or event creation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-circles bg-contain bg-center bg-no-repeat">
      <form className="flex flex-col items-center gap-6 mt-8">
        <div className="mr-28 mt-4 text-xl font-bold justify-center px-4">
          <h1>Create your own event</h1>
        </div>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
          />
          {formErrors.name && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.name}</p>}
        </div>
        <div className="">
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="textarea textarea-bordered w-80 bg-secondary-content rounded text-black"
          />
          {formErrors.description && <p className="text-red-500 -mb-2 -mt-0.5 w-80">{formErrors.description}</p>}
        </div>
        <div className="">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
          />
        </div>
        <div className="flex flex-col -mt-6">
          <p className="-mb-0.5">Number of tickets</p>
          <input
            type="number"
            placeholder="Number of Tickets"
            value={numberOfTickets}
            onChange={e => setNumberOfTickets(parseInt(e.target.value))}
            className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
          />
          {formErrors.numberOfTickets && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.numberOfTickets}</p>}
        </div>
        <div className="">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input file-input-bordered w-80 rounded bg-secondary-content text-black"
          />
          {formErrors.image && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.image}</p>}
        </div>
        <div className="ml-36">
          <button type="button" className="btn btn-primary rounded-xl w-36" onClick={handleSubmit} disabled={loading}>
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewEvent;
