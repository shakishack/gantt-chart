import React, { useRef, useState, useEffect } from "react";

interface ProgressBarProps {
  progress: number;
  onChange?: (newProgress: number) => void;
  readOnly?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  onChange,
  readOnly = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getColor = (val: number) => {
    if (val <= 20) return "#D32F2F";
    if (val <= 70) return "#E8BD35";
    return "#2E7D32";
  };

  const updateProgressFromEvent = (clientX: number) => {
    if (readOnly || !onChange || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const rawPercent = (offsetX / rect.width) * 100;
    const clamped = Math.round(Math.min(Math.max(rawPercent, 0), 100));
    onChange(clamped);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDragging(true);
    updateProgressFromEvent(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateProgressFromEvent(e.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const barColor = getColor(progress);

  return (
    <div
      className="progress-cell-container"
      title="Drag atau klik untuk mengubah persentase"
    >
      <div
        ref={trackRef}
        className={`progress-track ${readOnly ? "" : "interactive"} ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
      >
        <div
          className="progress-fill"
          style={{
            width: `${Math.max(progress, 0)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <span className="progress-label">{progress}%</span>
    </div>
  );
};
