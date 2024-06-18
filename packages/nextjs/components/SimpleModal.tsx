// components/SimpleModal.tsx
import React, { useState } from "react";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import useEventCreationAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import {
  addAllowedAddress,
  addApprovedChainlinkContract,
  changeLogo,
  scheduleMintLimitUpdate,
  schedulePause,
  schedulePriceUpdate,
  transferExtra,
  updateMintLimit,
  updatePrice,
} from "~~/utils/chain-of-events/deployContract";

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldName: string;
  quantity?: number;
  extraAddress?: string;
  chainlinkContractAddress?: string;
  eventId?: bigint;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  isOpen,
  onClose,
  fieldName,
  eventId,
  quantity,
  extraAddress,
  chainlinkContractAddress,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [timestamp, setTimestamp] = useState(0);

  const eventCreationAddress = useEventCreationAddress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fieldName === "logoUrl") {
      try {
        await changeLogo(inputValue, eventId!, eventCreationAddress!);
        toast.success("Succesfully Changed Logo");
        console.log("Succesfully changed logoUrl");
      } catch (e) {
        toast.error("Error Changing Logo." + e);
        console.error("Error changing logoUrl:", e);
      }
    } else if (fieldName === "price") {
      try {
        await updatePrice(extraAddress!, Number(inputValue));
        toast.success("Succesfully Changed Price");
        console.log("Succesfully changed price");
      } catch (e) {
        toast.error("Error Changing Price." + e);
        console.error("Error changing price:", e);
      }
    } else if (fieldName === "mintLimit") {
      try {
        await updateMintLimit(extraAddress!, Number(inputValue));
        toast.success("Succesfully Changed Mint Limit");
        console.log("Succesfully changed mint limit");
      } catch (e) {
        toast.error("Error Changing Mint Limit." + e);
        console.error("Error changing mint limit:", e);
      }
    } else if (fieldName === "transfer") {
      try {
        if (quantity! > 0) {
          await transferExtra(extraAddress!, inputValue, BigInt(quantity!));
          toast.success("Succesfully Transfered Asset");
          console.log("Succesfully Transfered Asset");
        } else {
          toast.error("Quantity needs to be bigger than 0");
          console.error("Quantity needs to be bigger than 0");
        }
      } catch (e) {
        toast.error("Error Transfering Asset." + e);
        console.error("Error sending extra:", e);
      }
    } else if (fieldName === "allowedAddress") {
      try {
        await addAllowedAddress(inputValue, eventId!, eventCreationAddress!);
        toast.success("Succesfully Added Allowed Address");
        console.log("Succesfully Added Allowed Address");
      } catch (e) {
        toast.error("Error Adding Allowed Address." + e);
        console.error("Error Adding Allowed Address:", e);
      }
    } else if (fieldName === "allowedChainlinkContract") {
      try {
        await addApprovedChainlinkContract(inputValue, extraAddress!);
        toast.success("Succesfully Added Approved Chainlink Contract Address");
        console.log("Succesfully Added Approved Chainlink Contract Address");
      } catch (e) {
        toast.error("Error Adding Approved Chainlink Contract Address." + e);
        console.error("Error Adding Approved Chainlink Contract Address:", e);
      }
    } else if (fieldName.includes("schedule")) {
      const datetime = `${date} ${time}`;
      const calculatedTimestamp = moment.tz(datetime, timezone).unix();
      setTimestamp(calculatedTimestamp);
      if (fieldName === "schedulePrice") {
        try {
          await schedulePriceUpdate(chainlinkContractAddress!, Number(inputValue) * 100, calculatedTimestamp);
          toast.success("Succesfully Scheduled Price Update");
          console.log("Succesfully Scheduled Price Update");
        } catch (e) {
          toast.error("Error Scheduling Price Update." + e);
          console.error("Error Scheduling Price Update:", e);
        }
      } else if (fieldName === "scheduleMintLimit") {
        try {
          await scheduleMintLimitUpdate(chainlinkContractAddress!, Number(inputValue) * 100, calculatedTimestamp);
          toast.success("Succesfully Scheduled Mint Limit Update");
          console.log("Succesfully Scheduled Mint Limit Update");
        } catch (e) {
          toast.error("Error Scheduling Mint Limit Update." + e);
          console.error("Error Scheduling Mint Limit Update:", e);
        }
      } else if (fieldName === "schedulePause") {
        try {
          await schedulePause(chainlinkContractAddress!, calculatedTimestamp);
          toast.success("Succesfully Scheduled Pause");
          console.log("Succesfully Scheduled Pause");
        } catch (e) {
          toast.error("Error Scheduling Pause." + e);
          console.error("Error Scheduling Pause:", e);
        }
      }
    } else {
      toast.error("Error");
      console.log("Wrong fieldName");
    }

    setInputValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal" onClose={onClose}>
      <div className="modal-box bg-base-200">
        <button
          type="button"
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={() => {
            setInputValue("");
            onClose();
          }}
        >
          ✕
        </button>
        <form onSubmit={handleSubmit}>
          <h3 className="font-bold text-lg">
            {fieldName === "numberOfTickets"
              ? "Edit number of tickets"
              : fieldName === "logoUrl"
              ? "Edit logo URL"
              : fieldName === "transfer"
              ? "Send to address"
              : fieldName === "allowedAddress" || fieldName === "allowedChainlinkContract"
              ? "Add allowed address"
              : fieldName === "mintLimit"
              ? "Edit mint limit"
              : fieldName.includes("schedule")
              ? "Schedule update"
              : `Edit ${fieldName}`}
          </h3>
          {fieldName === "schedulePrice" || fieldName === "scheduleMintLimit" || fieldName === "schedulePause" ? (
            <div className="flex flex-col gap-4 mt-8">
              {fieldName === "schedulePrice" || fieldName === "scheduleMintLimit" ? (
                <input
                  type={"number"}
                  placeholder={"New value"}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
                />
              ) : (
                <></>
              )}
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
              />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
              />
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="select bg-secondary-content text-black rounded w-80 select-bordered"
              >
                {moment.tz.names().map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-4">
              <input
                type={
                  fieldName === "numberOfTickets" ||
                  fieldName === "price" ||
                  fieldName === "mintLimit" ||
                  fieldName === "schedulePause"
                    ? "number"
                    : fieldName === "logoUrl"
                    ? "url"
                    : "text"
                }
                placeholder={
                  fieldName === "numberOfTickets"
                    ? "Enter new number of tickets"
                    : fieldName === "logoUrl"
                    ? "Enter new logo URL"
                    : fieldName === "transfer" ||
                      fieldName === "allowedAddress" ||
                      fieldName === "allowedChainlinkContract"
                    ? "Enter address"
                    : fieldName === "mintLimit"
                    ? "Enter new mint limit"
                    : fieldName === "schedulePause"
                    ? "Update time"
                    : `Enter new ${fieldName}`
                }
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
              />
            </div>
          )}
          <div className="mt-4">
            <button type="submit" className="btn btn-primary rounded-xl w-18 border-0">
              {fieldName === "transfer" ? "Send" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SimpleModal;
