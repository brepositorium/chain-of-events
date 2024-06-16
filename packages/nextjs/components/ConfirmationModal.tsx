import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, children }) => {
  if (!isOpen) return null;

  return (
    <dialog open={isOpen} className="modal" onClick={onClose}>
      <div className="modal-box bg-base-300 rounded-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{children}</h3>
        <div className="modal-action">
          <button className="btn btn-gradient-primary rounded btn-md w-28 mt-2" onClick={onConfirm}>
            Confirm
          </button>
          <button className="btn btn-outline rounded btn-md w-28 mt-2" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmationModal;
