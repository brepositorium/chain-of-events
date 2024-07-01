"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import moment from "moment-timezone";
import { NextPage } from "next";
import toast from "react-hot-toast";
import { AutocompleteCustom } from "~~/components/PlaceAutocompleteClassic";
import useEventCreationAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { checkVerifiedAccount, createEvent, pinFileToIPFS } from "~~/utils/chain-of-events/deployContract";

type FormErrors = {
  name?: string;
  description?: string;
  location?: string;
  numberOfTickets?: string;
  image?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
};

const NewEvent: NextPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const [numberOfTickets, setNumberOfTickets] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();

  const eventCreationAddress = useEventCreationAddress();

  useEffect(() => {
    if (selectedPlace) {
      setMapCenter(selectedPlace);
    }
    checkVerifiedAccount("0xdBbCba345190E60Ad24E3cb779346B792869d210");
  }, [selectedPlace]);

  const validateForm = () => {
    const errors: FormErrors = {};
    if (name.length < 3) errors.name = "Name must be at least 3 characters long.";
    if (description.length < 3) errors.description = "Description must be at least 3 characters long.";
    if (numberOfTickets <= 0) errors.numberOfTickets = "There must be more than 0 tickets.";
    if (!image) errors.image = "Please upload an image.";
    if (!selectedPlace) errors.location = "Please select a valid location from the dropdown.";
    if (!startTime) errors.startTime = "Please select a start time for the event.";
    if (!endTime) errors.endTime = "Please select an end time for the event.";
    if (!timezone) errors.timezone = "Please select a timezone for the event.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOnlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsOnline(checked);
    if (checked) {
      setLocation("Online");
    } else {
      if (selectedPlace) {
        setLocation(selectedPlace.lat + "|" + selectedPlace.lng);
      } else {
        setLocation("");
      }
    }
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

    const startTimestamp = moment.tz(startTime, timezone).unix();
    const endTimestamp = moment.tz(endTime, timezone).unix();

    const pinPromise = pinFileToIPFS(image).then(logoUrl => {
      toast
        .promise(
          createEvent(
            name,
            description,
            location,
            logoUrl,
            BigInt(numberOfTickets),
            BigInt(startTimestamp),
            BigInt(endTimestamp),
            eventCreationAddress!,
          ),
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
      <div className="bg-circles bg-contain bg-center bg-no-repeat">
        <form className="flex flex-col items-center gap-6 mt-8">
          <div className="mr-28 mt-4 text-xl font-bold justify-center px-4">
            <h1>Create your own event</h1>
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Event Name</p>
            <input
              type="text"
              placeholder="Enter Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
            {formErrors.name && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.name}</p>}
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Description</p>
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="textarea textarea-bordered w-80 bg-secondary-content rounded text-black"
            />
            {formErrors.description && <p className="text-red-500 -mb-2 -mt-0.5 w-80">{formErrors.description}</p>}
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Number of Tickets</p>
            <input
              type="number"
              placeholder="Number of Tickets"
              value={numberOfTickets}
              onChange={e => setNumberOfTickets(parseInt(e.target.value))}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
            {formErrors.numberOfTickets && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.numberOfTickets}</p>}
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Start Time</p>
            <input
              type="datetime-local"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
            {formErrors.startTime && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.startTime}</p>}
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">End Time</p>
            <input
              type="datetime-local"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
            {formErrors.endTime && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.endTime}</p>}
          </div>
          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Timezone</p>
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
            {formErrors.timezone && <p className="text-red-500 -mb-2 -mt-0.5">{formErrors.timezone}</p>}
          </div>
          <Map />
          <AutocompleteCustom onPlaceSelect={handlePlaceSelect} isOnline={isOnline} />
          {mapCenter && (
            <Map
              defaultZoom={15}
              defaultCenter={mapCenter}
              center={mapCenter}
              style={{
                width: "400px",
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
          {formErrors.location && <p className="text-red-500 -mb-2 -mt-6 max-w-80">{formErrors.location}</p>}
          <div className="flex -mt-4 mr-40">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={handleOnlineChange}
              className="checkbox checkbox-sm checkbox-primary mt-0.5"
            />
            <span className="ml-2 text-md">Event is online</span>
          </div>

          <div className="flex flex-col -mt-6">
            <p className="-mb-0.5 font-medium font-poppins">Logo</p>
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
    </APIProvider>
  );
};

export default NewEvent;
