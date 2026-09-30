import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Task, Division, TimelineMonth } from '../types/gantt';
import { ProgressBar } from './ProgressBar';
import { formatDateDisplay, calculateBarPosition } from '../utils/dateUtils';

interface GanttDivisionRowProps {
  division: Division;
  timelineMonths: TimelineMonth[];
  onDeleteDivision?: (divisionId: string | number) => void;
}

export const GanttDivisionRow: React.FC<GanttDivisionRowProps> = ({
  division,
  timelineMonths,
  onDeleteDivision,
}) => {
  const hasTimeline = timelineMonths.length > 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteDivision && window.confirm(`Delete division "${division.name}"?`)) {
      onDeleteDivision(division.id);
    }
  };

  return (
    <div className={`gantt-row division-row ${!hasTimeline ? 'no-timeline' : ''}`}>
      <div className="division-left-content">
        <span className="division-title">{division.name}</span>
        {onDeleteDivision && (
          <button
            type="button"
            className="delete-division-btn"
            onClick={handleDelete}
            title={`Delete division ${division.name}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {hasTimeline && (
        <div className="division-timeline-fill">
          {timelineMonths.map((m) => {
            const monthDaysCount = m.weeks.reduce((sum, w) => sum + w.days.length, 0);
            return (
              <div
                key={`div-m-${m.name}`}
                className="month-days-group"
                style={{ flex: monthDaysCount }}
              >
                {m.weeks.map((w) => (
                  <div
                    key={`div-w-${m.name}-${w.weekNumber}`}
                    className="week-days-group"
                    style={{ flex: w.days.length }}
                  >
                    {w.days.map((dayNum) => (
                      <div
                        key={`div-day-${m.name}-${dayNum}`}
                        className="timeline-grid-day-cell"
                        style={{ flex: 1 }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface GanttTaskRowProps {
  task: Task;
  timelineMonths: TimelineMonth[];
  onUpdateProgress: (taskId: string | number, newProgress: number) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string | number) => void;
}

export const GanttTaskRow: React.FC<GanttTaskRowProps> = ({
  task,
  timelineMonths,
  onUpdateProgress,
  onEditTask,
  onDeleteTask,
}) => {
  const hasTimeline = timelineMonths.length > 0;
  const barPos = hasTimeline
    ? calculateBarPosition(task.startDate, task.endDate, timelineMonths)
    : { leftPercent: 0, widthPercent: 0, isVisible: false };

  return (
    <div className={`gantt-row task-row ${!hasTimeline ? 'no-timeline' : ''}`}>
      <div className="task-columns-left">
        <div className="col-cell col-task">
          <div
            className="task-title-group"
            onClick={() => onEditTask && onEditTask(task)}
            title="Click to edit task"
          >
            <span className="task-title-text">{task.title}</span>
            {onEditTask && (
              <span className="edit-hint-icon" title="Edit task">
                <Pencil size={12} />
              </span>
            )}
          </div>
          {onDeleteTask && (
            <button
              type="button"
              className="delete-task-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  onDeleteTask(task.id);
                }
              }}
              title="Delete task"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="col-cell col-progress">
          <ProgressBar
            progress={task.progress}
            onChange={(newVal) => onUpdateProgress(task.id, newVal)}
          />
        </div>

        <div className="col-cell col-date">
          <span>{formatDateDisplay(task.startDate)}</span>
        </div>

        <div className="col-cell col-date">
          <span>{formatDateDisplay(task.endDate)}</span>
        </div>
      </div>

      {hasTimeline && (
        <div className="task-timeline-cell">
          {/* Day-level vertical grid background aligned with header days */}
          <div className="timeline-grid-background">
            {timelineMonths.map((m) => {
              const monthDaysCount = m.weeks.reduce((sum, w) => sum + w.days.length, 0);
              return (
                <div
                  key={`grid-m-${m.name}`}
                  className="month-days-group"
                  style={{ flex: monthDaysCount }}
                >
                  {m.weeks.map((w) => (
                    <div
                      key={`grid-w-${m.name}-${w.weekNumber}`}
                      className="week-days-group"
                      style={{ flex: w.days.length }}
                    >
                      {w.days.map((dayNum) => (
                        <div
                          key={`grid-day-${m.name}-${dayNum}`}
                          className="timeline-grid-day-cell"
                          style={{ flex: 1 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {barPos.isVisible && (
            <div
              className="timeline-bar-pill"
              onClick={() => onEditTask && onEditTask(task)}
              style={{
                left: `${barPos.leftPercent}%`,
                width: `${barPos.widthPercent}%`,
              }}
              title={`${task.title} (${task.progress}%)\nStart: ${formatDateDisplay(task.startDate)}\nEnd: ${formatDateDisplay(task.endDate)}${task.byMonth ? `\nMonth: ${task.byMonth}` : ''}${task.byWeek ? `\nWeek: ${task.byWeek}` : ''}\n(Click to edit)`}
            >
              <div
                className="timeline-bar-progress-fill"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
