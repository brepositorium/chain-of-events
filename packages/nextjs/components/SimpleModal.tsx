// components/SimpleModal.tsx
import React, { useState } from "react";
import moment from "moment-timezone";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import {
  addApprovedChainlinkContract,
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
  const { writeContractAsync: writeEventCreationAsync } = useScaffoldWriteContract("EventCreation");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [timestamp, setTimestamp] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fieldName === "description") {
      try {
        writeEventCreationAsync({
          functionName: "changeDescription",
          args: [inputValue, eventId],
        });
        console.log("Succesfully changed description");
      } catch (e) {
        console.error("Error changing description:", e);
      }
    } else if (fieldName === "location") {
      try {
        writeEventCreationAsync({
          functionName: "changeLocation",
          args: [inputValue, eventId],
        });
        console.log("Succesfully changed location");
      } catch (e) {
        console.error("Error changing location:", e);
      }
    } else if (fieldName === "logoUrl") {
      try {
        writeEventCreationAsync({
          functionName: "changeLogo",
          args: [inputValue, eventId],
        });
        console.log("Succesfully changed logoUrl");
      } catch (e) {
        console.error("Error changing logoUrl:", e);
      }
    } else if (fieldName === "numberOfTickets") {
      try {
        writeEventCreationAsync({
          functionName: "changeNumberOfTickets",
          args: [BigInt(inputValue), eventId],
        });
        console.log("Succesfully changed numberOfTickets");
      } catch (e) {
        console.error("Error changing numberOfTickets:", e);
      }
    } else if (fieldName === "price") {
      try {
        updatePrice(extraAddress!, Number(inputValue));
        console.log("Succesfully changed price");
      } catch (e) {
        console.error("Error changing price:", e);
      }
    } else if (fieldName === "mintLimit") {
      try {
        updateMintLimit(extraAddress!, Number(inputValue));
        console.log("Succesfully changed mint limit");
      } catch (e) {
        console.error("Error changing mint limit:", e);
      }
    } else if (fieldName === "transfer") {
      try {
        if (quantity! > 0) {
          console.log("Transfer extra function called");
          transferExtra(extraAddress!, inputValue, BigInt(quantity!));
        } else {
          console.error("Quantity needs to be bigger than 0");
        }
      } catch (e) {
        console.error("Error sending extra:", e);
      }
    } else if (fieldName === "allowedAddress") {
      try {
        writeEventCreationAsync({
          functionName: "addAllowedAddress",
          args: [inputValue, eventId],
        });
      } catch (e) {
        console.error("Error sending extra:", e);
      }
    } else if (fieldName === "allowedChainlinkContract") {
      try {
        addApprovedChainlinkContract(inputValue, extraAddress!);
      } catch (e) {
        console.error("Error sending extra:", e);
      }
    } else if (fieldName.includes("schedule")) {
      const datetime = `${date} ${time}`;
      const calculatedTimestamp = moment.tz(datetime, timezone).unix();
      setTimestamp(calculatedTimestamp);
      if (fieldName === "schedulePrice") {
        console.log(chainlinkContractAddress);
        schedulePriceUpdate(chainlinkContractAddress!, Number(inputValue) * 100, calculatedTimestamp);
      } else if (fieldName === "scheduleMintLimit") {
        scheduleMintLimitUpdate(chainlinkContractAddress!, Number(inputValue) * 100, calculatedTimestamp);
      } else if (fieldName === "schedulePause") {
        schedulePause(chainlinkContractAddress!, calculatedTimestamp);
      }
    } else {
      console.log("Wrong fieldName");
    }

    setInputValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal" onClose={onClose}>
      <div className="modal-box bg-base-300">
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
                  className="input input-md input-bordered w-80 bg-base-content rounded text-black"
                />
              ) : (
                <></>
              )}
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input input-md input-bordered w-80 bg-base-content rounded text-black"
              />
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="input input-md input-bordered w-80 bg-base-content rounded text-black"
              />
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="select bg-base-content text-black rounded w-80 select-bordered"
              >
                {moment.tz.names().map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mt-8">
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
                className="input input-md input-bordered w-80 bg-base-content rounded text-black"
              />
            </div>
          )}
          <div className="mt-4">
            <button type="submit" className="btn btn-gradient-primary rounded-xl w-18 border-0">
              {fieldName === "transfer" ? "Send" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SimpleModal;
