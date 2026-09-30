import React from "react";
import { Plus, FolderKanban } from "lucide-react";
import type { ProjectInfo } from "../types/gantt";

interface ProjectWelcomeViewProps {
  projects: ProjectInfo[];
  onOpenCreate: () => void;
  onOpenList: () => void;
}

export const ProjectWelcomeView: React.FC<ProjectWelcomeViewProps> = ({
  projects,
  onOpenCreate,
  onOpenList,
}) => {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Smart Gantt Chart</h1>
        <p className="welcome-subtitle">
          Select an existing project or create a new one to get started.
        </p>

        <div className="welcome-actions">
          <button
            type="button"
            className="welcome-btn primary-btn"
            onClick={onOpenCreate}
          >
            <Plus size={16} style={{ marginRight: "6px" }} />
            New Project
          </button>

          {projects.length > 0 && (
            <button
              type="button"
              className="welcome-btn secondary-btn"
              onClick={onOpenList}
            >
              <FolderKanban size={16} style={{ marginRight: "6px" }} />
              Projects ({projects.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
