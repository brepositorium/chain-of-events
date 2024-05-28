// components/SimpleModal.tsx
import React, { useState } from 'react';
import { useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    fieldName: string;
    eventId: bigint;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isOpen, onClose, fieldName, eventId }) => {
    const [inputValue, setInputValue] = useState("");
    const { writeContractAsync: writeEventCreationAsync } = useScaffoldWriteContract("EventCreation");
    const { writeContractAsync: writeExtraNftAsync } = useScaffoldWriteContract("ExtraNft");

    //TODO: could improve logic
    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        switch(fieldName) {
            case "description": {
                try {
                    writeEventCreationAsync({
                        functionName: "changeDescription",
                        args: [inputValue, eventId]
                    });
                    console.log("Succesfully changed description");
                    }
                    catch (e) {
                    console.error("Error changing description:", e);
                    }
                    break;
            }
            case "location": {
                try {
                    writeEventCreationAsync({
                        functionName: "changeLocation",
                        args: [inputValue, eventId]
                    });
                    console.log("Succesfully changed location");
                    }
                    catch (e) {
                    console.error("Error changing location:", e);
                    }
                    break;
            }
            case "logoUrl": {
                try {
                    writeEventCreationAsync({
                        functionName: "changeLogo",
                        args: [inputValue, eventId]
                    });
                    console.log("Succesfully changed logoUrl");
                    }
                    catch (e) {
                    console.error("Error changing logoUrl:", e);
                    }
                    break;
            }
            case "numberOfTickets": {
                try {
                    writeEventCreationAsync({
                        functionName: "changeNumberOfTickets",
                        args: [BigInt(inputValue), eventId]
                    });
                    console.log("Succesfully changed numberOfTickets");
                    }
                    catch (e) {
                    console.error("Error changing numberOfTickets:", e);
                    }
                    break;
            }
            case "price": {
                try {
                    writeExtraNftAsync({
                        functionName: "updatePrice",
                        args: [BigInt(inputValue)]
                    });
                    console.log("Succesfully changed price");
                    }
                    catch (e) {
                    console.error("Error changing price:", e);
                    }
                    break;
            }
            default: {
                console.log("Wrong fieldName");
                break;
            }
        }
        setInputValue("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <dialog open className="modal" onClose={onClose}>
            <div className="modal-box bg-base-300">
                <button type="button" className="btn btn-sm btn-circle absolute right-2 top-2" 
                onClick={
                    () => {
                    setInputValue("");onClose()
                    }}>
                        ✕
                </button>
                <form onSubmit={handleSubmit}>
                    <h3 className="font-bold text-lg">{
                                        fieldName === 'numberOfTickets' ? 'Edit number of tickets' 
                                        : fieldName === 'logoUrl' ? 'Edit logo URL'
                                        : `Edit ${fieldName}`}
                                        </h3>
                            <div className="mt-8">
                                <input
                                    type={
                                        fieldName === 'numberOfTickets' || fieldName === 'price' ? "number" 
                                        : fieldName === 'logoUrl' ? "url" 
                                        : "text"}
                                    placeholder={
                                        fieldName === 'numberOfTickets' ? 'Enter new number of tickets' 
                                        : fieldName === 'logoUrl' ? 'Enter new logo URL'
                                        : `Enter new ${fieldName}`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="input input-md input-bordered w-80 bg-base-content rounded text-black"
                                />
                            </div>

                    <div className="mt-4">
                        <button type="submit" className="btn btn-gradient-primary rounded-xl w-18 border-0">Save</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default SimpleModal;
