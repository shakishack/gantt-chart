import type { TimelineMonth } from '../types/gantt';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
  }
  return dateStr;
}

export function generateMonthsFromRange(startDateStr: string, endDateStr: string): TimelineMonth[] {
  if (!startDateStr || !endDateStr) return [];

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const months: TimelineMonth[] = [];
  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth();

  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const monthNum = currentMonth + 1;
    const monthName = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
    const totalDays = new Date(currentYear, monthNum, 0).getDate();

    const createDaysArray = (s: number, e: number) => {
      const arr: number[] = [];
      for (let i = s; i <= e; i++) {
        arr.push(i);
      }
      return arr;
    };

    months.push({
      name: monthName,
      year: currentYear,
      month: monthNum,
      weeks: [
        { weekNumber: 1, startDay: 1, endDay: 7, days: createDaysArray(1, 7) },
        { weekNumber: 2, startDay: 8, endDay: 14, days: createDaysArray(8, 14) },
        { weekNumber: 3, startDay: 15, endDay: 21, days: createDaysArray(15, 21) },
        { weekNumber: 4, startDay: 22, endDay: totalDays, days: createDaysArray(22, totalDays) },
      ],
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return months;
}

export function calculateBarPosition(
  startDateStr: string,
  endDateStr: string,
  timelineMonths: TimelineMonth[]
): { leftPercent: number; widthPercent: number; isVisible: boolean } {
  if (!startDateStr || !endDateStr || timelineMonths.length === 0) {
    return { leftPercent: 0, widthPercent: 0, isVisible: false };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { leftPercent: 0, widthPercent: 0, isVisible: false };
  }

  const firstMonth = timelineMonths[0];
  const lastMonth = timelineMonths[timelineMonths.length - 1];
  const lastMonthTotalDays = new Date(lastMonth.year, lastMonth.month, 0).getDate();

  const timelineStart = new Date(firstMonth.year, firstMonth.month - 1, 1).getTime();
  const timelineEnd = new Date(lastMonth.year, lastMonth.month - 1, lastMonthTotalDays + 1).getTime();
  const totalDuration = timelineEnd - timelineStart;

  if (totalDuration <= 0) {
    return { leftPercent: 0, widthPercent: 0, isVisible: false };
  }

  const taskStart = startDate.getTime();
  const taskEnd = endDate.getTime() + 24 * 60 * 60 * 1000;

  if (taskEnd < timelineStart || taskStart > timelineEnd) {
    return { leftPercent: 0, widthPercent: 0, isVisible: false };
  }

  const clampedStart = Math.max(taskStart, timelineStart);
  const clampedEnd = Math.min(taskEnd, timelineEnd);

  const leftPercent = ((clampedStart - timelineStart) / totalDuration) * 100;
  const widthPercent = Math.max(((clampedEnd - clampedStart) / totalDuration) * 100, 1.2);

  return {
    leftPercent: Math.min(Math.max(leftPercent, 0), 100),
    widthPercent: Math.min(Math.max(widthPercent, 1.2), 100 - leftPercent),
    isVisible: true,
  };
}
