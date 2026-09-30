import React from 'react';
import { Plus } from 'lucide-react';
import type { TimelineMonth } from '../types/gantt';

interface GanttHeaderProps {
  timelineMonths: TimelineMonth[];
  onOpenAddChoice: () => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  timelineMonths,
  onOpenAddChoice,
}) => {
  const hasTimeline = timelineMonths.length > 0;

  return (
    <div className={`gantt-header-row ${!hasTimeline ? 'no-timeline' : ''}`}>
      <div className="gantt-header-left">
        <div className="col-header col-task">
          <button
            type="button"
            className="add-row-circle-btn"
            onClick={onOpenAddChoice}
            title="Add Division or Task"
            aria-label="Add row"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
          <span className="header-label">Task</span>
        </div>

        <div className="col-header col-progress">
          <span className="header-label">Progress</span>
        </div>

        <div className="col-header col-date">
          <span className="header-label">Start</span>
        </div>

        <div className="col-header col-date">
          <span className="header-label">End</span>
        </div>
      </div>

      {hasTimeline && (
        <div className="gantt-header-timeline">
          {/* 1. Month Row */}
          <div className="timeline-month-row">
            {timelineMonths.map((m) => {
              const monthDaysCount = m.weeks.reduce((sum, w) => sum + w.days.length, 0);
              return (
                <div
                  key={m.name}
                  className="timeline-month-cell"
                  style={{ flex: monthDaysCount }}
                >
                  {m.name}
                </div>
              );
            })}
          </div>

          {/* 2. Week Row */}
          <div className="timeline-week-row">
            {timelineMonths.map((m) => {
              const monthDaysCount = m.weeks.reduce((sum, w) => sum + w.days.length, 0);
              return (
                <div
                  key={`weeks-${m.name}`}
                  className="month-weeks-group"
                  style={{ flex: monthDaysCount }}
                >
                  {m.weeks.map((w) => (
                    <div
                      key={`m-${m.name}-w-${w.weekNumber}`}
                      className="timeline-week-cell"
                      style={{ flex: w.days.length }}
                    >
                      {w.weekNumber}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* 3. Day Row */}
          <div className="timeline-day-row">
            {timelineMonths.map((m) => {
              const monthDaysCount = m.weeks.reduce((sum, w) => sum + w.days.length, 0);
              return (
                <div
                  key={`days-${m.name}`}
                  className="month-days-group"
                  style={{ flex: monthDaysCount }}
                >
                  {m.weeks.map((w) => (
                    <div
                      key={`w-days-${m.name}-${w.weekNumber}`}
                      className="week-days-group"
                      style={{ flex: w.days.length }}
                    >
                      {w.days.map((dayNum) => (
                        <div
                          key={`day-${m.name}-${dayNum}`}
                          className="timeline-day-cell"
                          style={{ flex: 1 }}
                          title={`${dayNum} ${m.name}`}
                        >
                          {dayNum}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
