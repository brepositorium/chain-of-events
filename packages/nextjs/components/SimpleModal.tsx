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
        console.log(fieldName);
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
            <div className="modal-box">
                <button type="button" className="btn btn-sm btn-circle absolute right-2 top-2" 
                onClick={
                    () => {
                    setInputValue("");onClose()
                    }}>
                        ✕
                </button>
                <form onSubmit={handleSubmit}>
                    <h3 className="font-bold text-lg">{`Edit ${fieldName}`}</h3>
                    {
                        fieldName === 'numberOfTickets' || fieldName === 'price' ? 
                            <div className="mt-4">
                                <input
                                    type="number"
                                    placeholder={`Enter ${fieldName}`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="input input-bordered w-full max-w-xs"
                                />
                            </div>
                            : fieldName === 'logoUrl' ? 
                            <div className="mt-4">
                                <input
                                    type="url"
                                    placeholder={`Enter ${fieldName}`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="input input-bordered w-full max-w-xs"
                                />
                            </div>
                            : <div className="mt-4">
                                <input
                                    type="text"
                                    placeholder={`Enter ${fieldName}`}
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    className="input input-bordered w-full max-w-xs"
                                    />
                            </div>
                    }

                    <div className="mt-8">
                        <button type="submit" className="btn btn-primary">Save</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default SimpleModal;
