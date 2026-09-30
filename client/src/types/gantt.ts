export interface Task {
  id: string | number;
  projectId?: string | number | null;
  divisionId: string | number | null;
  divisionName?: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  byMonth?: string;
  byWeek?: string;
}

export interface Division {
  id: string | number;
  projectId?: string | number | null;
  name: string;
}

export interface TimelineMonth {
  name: string;
  year: number;
  month: number;
  weeks: {
    weekNumber: number;
    startDay: number;
    endDay: number;
    days: number[];
  }[];
}

export interface ProjectInfo {
  id?: string | number;
  title: string;
  startDate: string;
  endDate: string;
}
