import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { Task, Division } from '../types/gantt';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  divisions: Division[];
  onSaveTask: (
    id: string | number,
    updatedData: {
      title: string;
      startDate: string;
      endDate: string;
      divisionId: string | number | null;
      progress: number;
    }
  ) => void;
  onDeleteTask?: (id: string | number) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  divisions,
  onSaveTask,
  onDeleteTask,
}) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | number | null>(null);

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title || '');
      setStartDate(task.startDate || '');
      setEndDate(task.endDate || '');
      setProgress(task.progress || 0);
      setSelectedDivisionId(task.divisionId || null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    onSaveTask(task.id, {
      title: title.trim(),
      startDate,
      endDate,
      divisionId: selectedDivisionId,
      progress,
    });

    onClose();
  };

  const handleDelete = () => {
    if (onDeleteTask && window.confirm(`Delete task "${task.title}"?`)) {
      onDeleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="task-popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-card-header">
          <h2 className="task-popup-title">Edit Task</h2>
          {onDeleteTask && (
            <button
              type="button"
              className="delete-icon-btn"
              onClick={handleDelete}
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
          )}
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
                (No Division)
              </option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}
                </option>
              ))}
            </select>
          </div>

          <div className="task-form-row">
            <label className="task-form-label">Progress</label>
            <div className="edit-progress-control">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value, 10))}
                className="edit-progress-slider"
              />
              <span className="edit-progress-value">{progress}%</span>
            </div>
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
