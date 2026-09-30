import React, { useState } from "react";
import { X } from "lucide-react";

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDivision: (divisionName: string) => void;
}

export const AddDivisionModal: React.FC<AddDivisionModalProps> = ({
  isOpen,
  onClose,
  onAddDivision,
}) => {
  const [divisionName, setDivisionName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionName.trim()) return;
    onAddDivision(divisionName.trim());
    setDivisionName("");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="gantt-popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-card-header">
          <h2 className="popup-title">Add Division</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="popup-form">
          <div className="popup-field-row">
            <label className="popup-label">Division Name</label>
            <input
              type="text"
              autoFocus
              className="popup-input"
              placeholder="Division name"
              value={divisionName}
              onChange={(e) => setDivisionName(e.target.value)}
              required
            />
          </div>
          <div className="popup-footer">
            <button
              type="button"
              className="popup-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="popup-done-btn"
              disabled={!divisionName.trim()}
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
