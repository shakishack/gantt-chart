import React from 'react';
import { X, FolderPlus, PlusCircle } from 'lucide-react';

interface AddChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddDivision: () => void;
  onSelectAddTask: () => void;
}

export const AddChoiceModal: React.FC<AddChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectAddDivision,
  onSelectAddTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="choice-card" onClick={(e) => e.stopPropagation()}>
        <div className="choice-header">
          <span className="choice-title">Add Entry</span>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <p className="choice-subtitle">
          Select an entry type to add to the Gantt chart:
        </p>
        <div className="choice-actions">
          <button
            type="button"
            className="choice-btn"
            onClick={() => {
              onClose();
              onSelectAddDivision();
            }}
          >
            <FolderPlus size={22} style={{ marginRight: '12px', flexShrink: 0, color: 'var(--primary-olive)' }} />
            <div>
              <div className="btn-main-text">Add Division</div>
              <div className="btn-sub-text">Create a new group or category</div>
            </div>
          </button>
          <button
            type="button"
            className="choice-btn"
            onClick={() => {
              onClose();
              onSelectAddTask();
            }}
          >
            <PlusCircle size={22} style={{ marginRight: '12px', flexShrink: 0, color: 'var(--primary-olive)' }} />
            <div>
              <div className="btn-main-text">Add Task</div>
              <div className="btn-sub-text">Add a new task row</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
