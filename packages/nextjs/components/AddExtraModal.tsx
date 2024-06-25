import React, { useState } from "react";
import toast from "react-hot-toast";
import useContractAddress from "~~/hooks/chain-of-events/useEventCreationAddress";
import { usePriceFeedHandlerAddress } from "~~/hooks/chain-of-events/usePriceFeedHandlerAddress";
import {
  constructExtraUri,
  createAndRegisterBundle,
  createAndRegisterExtra,
} from "~~/utils/chain-of-events/deployContract";

interface AddExtraModalProps {
  isOpen: boolean;
  onClose: () => void;
  extraType: number;
  id: number;
}

const AddExtraModal: React.FC<AddExtraModalProps> = ({ isOpen, onClose, extraType, id }) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [price, setPrice] = useState<number>();
  const [loading, setLoading] = useState(false);

  const contractAddress = useContractAddress();
  const priceFeedHandlerAddress = usePriceFeedHandlerAddress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (extraType === 0 || extraType === 1) {
      if (!image || !price || !contractAddress) {
        toast.error("Please provide all required fields.");
        setLoading(false);
        return;
      }

      try {
        const metadataUri = await toast.promise(constructExtraUri(name, description, externalUrl, price, image), {
          loading: "👨‍🎨 Pinning to IPFS...",
          success: "🖼️ Metadata Pinned Successfully!",
          error: "Failed to construct metadata.",
        });
        if (metadataUri) {
          const deployPromise =
            extraType === 0
              ? createAndRegisterExtra(
                  name,
                  symbol,
                  metadataUri,
                  0,
                  price,
                  BigInt(id),
                  contractAddress,
                  priceFeedHandlerAddress!,
                )
              : createAndRegisterExtra(
                  name,
                  symbol,
                  metadataUri,
                  1,
                  price,
                  BigInt(id),
                  contractAddress,
                  priceFeedHandlerAddress!,
                );
          console.log("Added:", { name, symbol, description, metadataUri, price });
          toast
            .promise(deployPromise!, {
              loading: "🏗️ Bringing Your Extra Onchain...",
              success: "🔗 Extra Deployed Successfully!",
              error: "Failed to Deploy Extra.",
            })
            .then(() => onClose());
        }
      } catch (error) {
        toast.error("Failed to prepare metadata or deploy contract.");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      if (!name || !price || !contractAddress) {
        toast.error("Please provide all required fields.");
        setLoading(false);
        return;
      }
      try {
        const deployPromise = createAndRegisterBundle(
          contractAddress,
          BigInt(id),
          name,
          price,
          priceFeedHandlerAddress!,
        );
        console.log("Added:", { name, price });
        toast
          .promise(deployPromise!, {
            loading: "🏗️ Bringing Your Bundle Onchain...",
            success: "🔗 Bundle Deployed Successfully!",
            error: "Failed to Deploy Bundle.",
          })
          .then(() => onClose());
      } catch (error) {
        toast.error("Failed to deploy contract.");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal" onClose={onClose}>
      <div className="modal-box bg-base-200 rounded-xl">
        <button type="button" className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>
          ✕
        </button>
        <form onSubmit={handleSubmit}>
          {extraType === 0 ? (
            <h3 className="font-bold text-lg">Add Ticket Type</h3>
          ) : extraType === 1 ? (
            <h3 className="font-bold text-lg">Add Consumable</h3>
          ) : (
            <h3 className="font-bold text-lg">Add Bundle</h3>
          )}

          <div className="mt-4 flex flex-col">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
          </div>
          {extraType === 0 || extraType === 1 ? (
            <>
              <div className="mt-4 flex flex-col">
                <label>Symbol</label>
                <input
                  type="text"
                  placeholder="Enter symbol"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
                />
              </div>
              <div className="mt-4 flex flex-col">
                <label>Description</label>
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-80 bg-secondary-content rounded text-black"
                />
              </div>
              <div className="mt-4 flex flex-col">
                <label>External URL</label>
                <input
                  type="url"
                  placeholder="Enter an URL to your event"
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                  className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
                />
              </div>
              <div className="mt-4 flex flex-col">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                  className="file-input file-input-bordered w-80 rounded bg-secondary-content text-black"
                />
              </div>
            </>
          ) : (
            <></>
          )}
          <div className="mt-4 flex flex-col">
            <label>Price</label>
            <input
              type="number"
              placeholder="Enter price in USD"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
            />
          </div>
          <div className="mt-8">
            <button type="submit" className="btn btn-primary rounded-xl w-24 border-0">
              Add
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AddExtraModal;
