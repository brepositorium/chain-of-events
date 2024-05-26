import React, { useState } from 'react';
import { deployContract, constructExtraUri } from '~~/utils/chain-of-events/deployContract';

interface AddExtraModalProps {
    isOpen: boolean;
    onClose: () => void;
    extraType: number;
    id: number;
}

const AddExtraModal: React.FC<AddExtraModalProps> = ({ isOpen, onClose, extraType, id }) => {
    const [name, setName] = useState('');
    const [symbol, setSymbol] = useState('');
    const [description, setDescription] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [price, setPrice] = useState<number>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(image && price && process.env.NEXT_PUBLIC_EVENT_CREATION_ADDRESS) {
            const metadataUri = await constructExtraUri(name, description, externalUrl, price, image);
            if(metadataUri) {
                if(extraType === 0) {
                    deployContract(name, symbol, metadataUri, 0, BigInt(price), process.env.NEXT_PUBLIC_EVENT_CREATION_ADDRESS, BigInt(id))
                } else {
                    deployContract(name, symbol, metadataUri, 1, BigInt(price), process.env.NEXT_PUBLIC_EVENT_CREATION_ADDRESS, BigInt(id))
                }
                console.log("Added:", { name, symbol, description, metadataUri, price });
            }
            } else {
                console.error("Error adding extra")
            }
        onClose()
    };

    if (!isOpen) return null;

    return (
        <dialog open className="modal" onClose={onClose}>
            <div className="modal-box">
                <button type="button" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>✕</button>
                <form onSubmit={handleSubmit}>
                    { 
                    extraType === 0 ? <h3 className="font-bold text-lg">Add Ticket Type</h3> 
                        : <h3 className="font-bold text-lg">Add Consumable</h3>
                    }
                    <div className="mt-4">
                        <label>Name:</label>
                        <input
                            type="text"
                            placeholder="Enter name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-4">
                        <label>Symbol:</label>
                        <input
                            type="text"
                            placeholder="Enter symbol"
                            value={symbol}
                            onChange={e => setSymbol(e.target.value)}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-4">
                        <label>Description:</label>
                        <input
                            type="text"
                            placeholder="Enter description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-4">
                        <label>External URL:</label>
                        <input
                            type="url"
                            placeholder="Enter an URL to your event"
                            value={externalUrl}
                            onChange={e => setExternalUrl(e.target.value)}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-4">
                        <label>Image:</label>
                        <input
                            type="file"
                            onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-4">
                        <label>Price:</label>
                        <input
                            type="number"
                            placeholder="Enter price"
                            value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            className="input input-bordered w-full max-w-xs"
                        />
                    </div>
                    <div className="mt-8">
                        <button type="submit" className="btn btn-primary">Add</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default AddExtraModal;