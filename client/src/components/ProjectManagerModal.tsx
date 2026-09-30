import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { ProjectInfo } from '../types/gantt';

interface ProjectManagerModalProps {
  isOpen: boolean;
  projects: ProjectInfo[];
  currentProjectId?: number | string;
  initialTab?: 'list' | 'create';
  onClose: () => void;
  onSelectProject: (project: ProjectInfo) => void;
  onCreateProject: (title: string, startDate: string, endDate: string) => Promise<void>;
  onDeleteProject: (projectId: number | string) => Promise<void>;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  projects,
  currentProjectId,
  initialTab = 'list',
  onClose,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>(initialTab);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setTitle('');
      setStartDate('');
      setEndDate('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreateProject(title.trim(), startDate, endDate);
      setTitle('');
      setStartDate('');
      setEndDate('');
      setActiveTab('list');
    } catch (err) {
      alert('Failed to create project: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="project-manager-card" onClick={(e) => e.stopPropagation()}>
        <div className="project-modal-header">
          <div className="project-modal-tabs">
            <button
              type="button"
              className={`project-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Projects
            </button>
            <button
              type="button"
              className={`project-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
            >
              New Project
            </button>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {activeTab === 'list' ? (
          <div className="project-list-container">
            {projects.length === 0 ? (
              <div className="empty-project-hint">No projects found.</div>
            ) : (
              <ul className="project-list">
                {projects.map((proj) => {
                  const isCurrent = String(proj.id) === String(currentProjectId);
                  return (
                    <li
                      key={proj.id}
                      className={`project-list-item ${isCurrent ? 'selected' : ''}`}
                    >
                      <div
                        className="project-item-info"
                        onClick={() => {
                          onSelectProject(proj);
                          onClose();
                        }}
                      >
                        <div className="project-item-title">
                          <span>{proj.title || 'Untitled Project'}</span>
                          {isCurrent && <span className="active-badge">Active</span>}
                        </div>
                        <div className="project-item-dates">
                          {proj.startDate && proj.endDate
                            ? `${proj.startDate} - ${proj.endDate}`
                            : '-'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="delete-project-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete project "${proj.title}"?`)) {
                            if (proj.id !== undefined) {
                              onDeleteProject(proj.id);
                            }
                          }
                        }}
                        title="Delete project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <form className="project-create-form" onSubmit={handleSubmit}>
            <div className="popup-field-row">
              <label className="popup-label">Project Title</label>
              <input
                type="text"
                className="popup-input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="popup-field-row">
              <label className="popup-label">Start Date</label>
              <input
                type="date"
                className="popup-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="popup-field-row">
              <label className="popup-label">End Date</label>
              <input
                type="date"
                className="popup-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="popup-footer">
              <button
                type="button"
                className="popup-cancel-btn"
                onClick={() => setActiveTab('list')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="popup-done-btn"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Done'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
