import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Division } from '../types/gantt';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  defaultDivisionId?: string | number | null;
  defaultStartDate?: string;
  onAddTask: (task: {
    title: string;
    startDate: string;
    endDate: string;
    divisionId: string | number | null;
  }) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  divisions,
  defaultDivisionId = null,
  defaultStartDate = '',
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | number | null>(
    defaultDivisionId
  );

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setStartDate(defaultStartDate);
      setEndDate('');
      setSelectedDivisionId(defaultDivisionId);
    }
  }, [isOpen, defaultStartDate, defaultDivisionId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    onAddTask({
      title: title.trim(),
      startDate,
      endDate,
      divisionId: selectedDivisionId,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="task-popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-card-header">
          <h2 className="task-popup-title">Add Task</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-popup-form">
          <div className="task-form-row">
            <label className="task-form-label">Title</label>
            <input
              type="text"
              autoFocus
              className="task-form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name"
              required
            />
          </div>

          <div className="task-form-row">
            <label className="task-form-label">Start</label>
            <input
              type="date"
              className="task-form-input date-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="task-form-row">
            <label className="task-form-label">End</label>
            <input
              type="date"
              className="task-form-input date-field"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {divisions.length > 0 && (
            <div className="task-form-row">
              <label className="task-form-label">Division</label>
              <select
                className={`task-form-input task-form-select ${
                  !selectedDivisionId ? 'is-placeholder' : ''
                }`}
                value={selectedDivisionId || ''}
                onChange={(e) => setSelectedDivisionId(e.target.value || null)}
              >
                <option value="" className="placeholder-option">
                  Select Division
                </option>
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={!title.trim() || !startDate || !endDate}
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
