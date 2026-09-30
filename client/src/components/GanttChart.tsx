import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Task, Division, ProjectInfo } from "../types/gantt";
import { GanttHeader } from "./GanttHeader";
import { GanttDivisionRow, GanttTaskRow } from "./GanttRow";
import { AddChoiceModal } from "./AddChoiceModal";
import { AddDivisionModal } from "./AddDivisionModal";
import { AddTaskModal } from "./AddTaskModal";
import { EditTaskModal } from "./EditTaskModal";
import { ProjectWelcomeView } from "./ProjectWelcomeView";
import { ProjectManagerModal } from "./ProjectManagerModal";
import { generateMonthsFromRange } from "../utils/dateUtils";
import {
  apiGetProjects,
  apiCreateProject,
  apiUpdateProject,
  apiDeleteProject,
  apiGetTasks,
  apiCreateTask,
  apiUpdateTask,
  apiUpdateTaskProgress,
  apiDeleteTask,
  apiGetDivisions,
  apiCreateDivision,
  apiDeleteDivision,
} from "../services/api";
import { Sun, Moon, Plus, Minus, FolderKanban } from "lucide-react";
import "../styles/gantt.css";

export const GanttChart: React.FC = () => {
  // Theme state (localStorage persistent)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("gantt_theme") as "light" | "dark") || "light";
  });

  // Projects state
  const [projectsList, setProjectsList] = useState<ProjectInfo[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectInfo | null>(
    null,
  );
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalInitialTab, setProjectModalInitialTab] = useState<
    "list" | "create"
  >("list");

  // Chart data state
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals state
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gantt_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch all projects on mount
  const loadProjects = useCallback(async () => {
    try {
      const projects = await apiGetProjects();
      setProjectsList(projects);

      const savedProjectId = localStorage.getItem("gantt_active_project_id");
      if (savedProjectId && projects.length > 0) {
        const found = projects.find(
          (p) => String(p.id) === String(savedProjectId),
        );
        if (found) {
          setCurrentProject(found);
          return;
        }
      }

      // If no valid active project, keep currentProject null (triggers welcome view)
      setCurrentProject(null);
    } catch (err) {
      console.warn("Could not load projects:", err);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load divisions and tasks whenever currentProject changes
  useEffect(() => {
    if (!currentProject || !currentProject.id) {
      setDivisions([]);
      setTasks([]);
      return;
    }

    const projectId = currentProject.id;
    localStorage.setItem("gantt_active_project_id", String(projectId));

    async function loadProjectData() {
      try {
        const [divData, taskData] = await Promise.all([
          apiGetDivisions(projectId),
          apiGetTasks(projectId),
        ]);
        setDivisions(divData);
        setTasks(taskData);
      } catch (err) {
        console.warn("Could not load tasks/divisions for project:", err);
      }
    }

    loadProjectData();
  }, [currentProject]);

  // Create Project
  const handleCreateProject = async (
    title: string,
    startDate: string,
    endDate: string,
  ) => {
    const created = await apiCreateProject({ title, startDate, endDate });
    setProjectsList((prev) => [created, ...prev]);
    setCurrentProject(created);
    setIsProjectModalOpen(false);
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string | number) => {
    await apiDeleteProject(projectId);
    setProjectsList((prev) =>
      prev.filter((p) => String(p.id) !== String(projectId)),
    );

    if (currentProject && String(currentProject.id) === String(projectId)) {
      localStorage.removeItem("gantt_active_project_id");
      setCurrentProject(null);
    }
  };

  // Update current project info (title, start, end dates)
  const handleProjectInfoChange = async (updates: Partial<ProjectInfo>) => {
    if (!currentProject || !currentProject.id) return;

    const updated = { ...currentProject, ...updates };
    setCurrentProject(updated);
    setProjectsList((prev) =>
      prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)),
    );

    try {
      await apiUpdateProject(currentProject.id, updates);
    } catch (err) {
      console.warn("Failed to update project info in backend:", err);
    }
  };

  // Generate dynamic months timeline based on project range
  const timelineMonths = useMemo(() => {
    if (!currentProject?.startDate || !currentProject?.endDate) return [];
    return generateMonthsFromRange(
      currentProject.startDate,
      currentProject.endDate,
    );
  }, [currentProject?.startDate, currentProject?.endDate]);

  // Task Progress Update (from drag / slider)
  const handleUpdateProgress = async (
    taskId: string | number,
    newProgress: number,
  ) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, progress: newProgress } : t)),
    );

    try {
      await apiUpdateTaskProgress(taskId, newProgress);
    } catch (err) {
      console.warn("Could not save progress to backend:", err);
    }
  };

  // Add Task
  const handleAddTask = async (taskData: {
    title: string;
    startDate: string;
    endDate: string;
    divisionId: string | number | null;
  }) => {
    if (!currentProject?.id) return;

    try {
      const created = await apiCreateTask({
        ...taskData,
        projectId: currentProject.id,
        progress: 0,
      });
      setTasks((prev) => [...prev, created]);
    } catch (err) {
      console.warn("Backend task create failed, adding to local state:", err);
      const fallbackTask: Task = {
        id: `local-${Date.now()}`,
        projectId: currentProject.id,
        title: taskData.title,
        divisionId: taskData.divisionId,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        progress: 0,
      };
      setTasks((prev) => [...prev, fallbackTask]);
    }
  };

  // Edit / Update Task
  const handleSaveEditedTask = async (
    id: string | number,
    updatedData: {
      title: string;
      startDate: string;
      endDate: string;
      divisionId: string | number | null;
      progress: number;
    },
  ) => {
    try {
      const saved = await apiUpdateTask(id, updatedData);
      setTasks((prev) => prev.map((t) => (t.id === id ? saved : t)));
    } catch (err) {
      console.warn("Backend update failed, updating local state:", err);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t)),
      );
    }
    setEditingTask(null);
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string | number) => {
    try {
      await apiDeleteTask(taskId);
    } catch (err) {
      console.warn("Backend delete failed, removing from local state:", err);
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Add Division
  const handleAddDivision = async (divisionName: string) => {
    if (!currentProject?.id) return;

    try {
      const created = await apiCreateDivision(divisionName, currentProject.id);
      setDivisions((prev) => [...prev, created]);
    } catch (err) {
      console.warn(
        "Backend division create failed, adding to local state:",
        err,
      );
      const fallbackDivision: Division = {
        id: `div-${Date.now()}`,
        projectId: currentProject.id,
        name: divisionName,
      };
      setDivisions((prev) => [...prev, fallbackDivision]);
    }
  };

  // Delete Division
  const handleDeleteDivision = async (divisionId: string | number) => {
    try {
      await apiDeleteDivision(divisionId);
    } catch (err) {
      console.warn("Backend division delete failed, removing locally:", err);
    }
    setDivisions((prev) => prev.filter((d) => d.id !== divisionId));
    setTasks((prev) =>
      prev.map((t) =>
        t.divisionId === divisionId ? { ...t, divisionId: null } : t,
      ),
    );
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 20, 240));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handleWheelZoom = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoomLevel((z) => Math.min(z + 10, 240));
      } else {
        setZoomLevel((z) => Math.max(z - 10, 60));
      }
    }
  };

  // If no project is selected or created yet, render clean Welcome View
  if (!currentProject) {
    return (
      <div
        className={`gantt-app-wrapper ${theme === "dark" ? "dark-theme" : ""}`}
      >
        <header className="project-meta-section">
          <div className="project-header-top">
            <h1 className="project-main-heading">Smart Gantt Chart</h1>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <ProjectWelcomeView
          projects={projectsList}
          onOpenCreate={() => {
            setProjectModalInitialTab("create");
            setIsProjectModalOpen(true);
          }}
          onOpenList={() => {
            setProjectModalInitialTab("list");
            setIsProjectModalOpen(true);
          }}
        />

        <ProjectManagerModal
          isOpen={isProjectModalOpen}
          projects={projectsList}
          currentProjectId={
            currentProject
              ? (currentProject as ProjectInfo & { id: string | number }).id
              : undefined
          }
          initialTab={projectModalInitialTab}
          onClose={() => setIsProjectModalOpen(false)}
          onSelectProject={(proj) => setCurrentProject(proj)}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>
    );
  }

  const timelineWidthPx = Math.round(
    Math.max(timelineMonths.length * 620, 620) * (zoomLevel / 100),
  );

  const hasTimeline = timelineMonths.length > 0;
  const unassignedTasks = tasks.filter((t) => !t.divisionId);
  const isEmpty = divisions.length === 0 && tasks.length === 0;

  return (
    <div
      className={`gantt-app-wrapper ${theme === "dark" ? "dark-theme" : ""}`}
      style={
        { "--timeline-width": `${timelineWidthPx}px` } as React.CSSProperties
      }
      onWheel={handleWheelZoom}
    >
      <section className="project-meta-section">
        <div className="project-header-top">
          <div className="project-heading-group">
            <h1 className="project-main-heading">Gantt Chart</h1>
            <button
              type="button"
              className="switch-project-btn"
              onClick={() => {
                setProjectModalInitialTab("list");
                setIsProjectModalOpen(true);
              }}
              title="View all projects or create a new one"
            >
              <FolderKanban
                size={15}
                style={{ marginRight: "6px", verticalAlign: "text-bottom" }}
              />
              Projects
            </button>
          </div>

          <div className="header-actions-group">
            {hasTimeline && (
              <div
                className="zoom-controls-inline"
                title="Zoom timeline (Ctrl + mouse wheel)"
              >
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleZoomOut}
                  title="Zoom Out Timeline"
                >
                  <Minus size={14} />
                </button>
                <span
                  className="zoom-label"
                  onClick={handleResetZoom}
                  title="Reset zoom (100%)"
                >
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={handleZoomIn}
                  title="Zoom In Timeline"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        <div className="project-inputs-container">
          <div className="project-meta-row">
            <label className="meta-label">Project Title :</label>
            <input
              type="text"
              className="meta-input text-input"
              placeholder="Project title..."
              value={currentProject.title}
              onChange={(e) =>
                handleProjectInfoChange({ title: e.target.value })
              }
            />
          </div>

          <div className="project-meta-row">
            <label className="meta-label">Start Date :</label>
            <input
              type="date"
              className="meta-input date-input"
              value={currentProject.startDate}
              onChange={(e) =>
                handleProjectInfoChange({ startDate: e.target.value })
              }
            />
          </div>

          <div className="project-meta-row">
            <label className="meta-label">End Date :</label>
            <input
              type="date"
              className="meta-input date-input"
              value={currentProject.endDate}
              min={currentProject.startDate}
              onChange={(e) =>
                handleProjectInfoChange({ endDate: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <main className="gantt-chart-container">
        <div
          className={`gantt-table-wrapper ${!hasTimeline ? "no-timeline" : ""}`}
        >
          <GanttHeader
            timelineMonths={timelineMonths}
            onOpenAddChoice={() => setIsChoiceOpen(true)}
          />

          <div className="gantt-body">
            {divisions.map((division) => {
              const divisionTasks = tasks.filter(
                (t) => t.divisionId === division.id,
              );
              return (
                <React.Fragment key={division.id}>
                  <GanttDivisionRow
                    division={division}
                    timelineMonths={timelineMonths}
                    onDeleteDivision={handleDeleteDivision}
                  />

                  {divisionTasks.map((task) => (
                    <GanttTaskRow
                      key={task.id}
                      task={task}
                      timelineMonths={timelineMonths}
                      onUpdateProgress={handleUpdateProgress}
                      onEditTask={(t) => {
                        setEditingTask(t);
                        setIsEditModalOpen(true);
                      }}
                      onDeleteTask={handleDeleteTask}
                    />
                  ))}
                </React.Fragment>
              );
            })}

            {unassignedTasks.length > 0 && (
              <>
                {divisions.length > 0 && (
                  <div
                    className={`gantt-row division-row ${!hasTimeline ? "no-timeline" : ""}`}
                  >
                    <div className="division-left-content">
                      <span className="division-title">General Tasks</span>
                    </div>
                    {hasTimeline && <div className="division-timeline-fill" />}
                  </div>
                )}
                {unassignedTasks.map((task) => (
                  <GanttTaskRow
                    key={task.id}
                    task={task}
                    timelineMonths={timelineMonths}
                    onUpdateProgress={handleUpdateProgress}
                    onEditTask={(t) => {
                      setEditingTask(t);
                      setIsEditModalOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                  />
                ))}
              </>
            )}

            {isEmpty && (
              <div className="empty-chart-placeholder">
                <span className="empty-hint">
                  Click the <strong>(+)</strong> button on the Task column above
                  to add a Division or Task
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Choice Modal */}
      <AddChoiceModal
        isOpen={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        onSelectAddDivision={() => setIsDivisionModalOpen(true)}
        onSelectAddTask={() => setIsTaskModalOpen(true)}
      />

      {/* Add Division Modal */}
      <AddDivisionModal
        isOpen={isDivisionModalOpen}
        onClose={() => setIsDivisionModalOpen(false)}
        onAddDivision={handleAddDivision}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        divisions={divisions}
        defaultStartDate={currentProject.startDate}
        onAddTask={handleAddTask}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        divisions={divisions}
        onSaveTask={handleSaveEditedTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Projects Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectModalOpen}
        projects={projectsList}
        currentProjectId={currentProject.id}
        initialTab={projectModalInitialTab}
        onClose={() => setIsProjectModalOpen(false)}
        onSelectProject={(proj) => setCurrentProject(proj)}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
};
