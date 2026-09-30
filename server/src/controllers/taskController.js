import { db } from '../db/db.js';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

// Helper to calculate default by_month and by_week values
function computeMonthAndWeek(startDateStr, endDateStr) {
  if (!startDateStr) return { byMonth: '', byWeek: '' };
  const dStart = new Date(startDateStr);
  if (isNaN(dStart.getTime())) return { byMonth: '', byWeek: '' };

  const monthName = MONTH_NAMES[dStart.getMonth()] || `Month ${dStart.getMonth() + 1}`;
  const year = dStart.getFullYear();
  const byMonth = `${monthName} ${year}`;

  const startDay = dStart.getDate();
  const startWeekNum = Math.min(Math.floor((startDay - 1) / 7) + 1, 4);

  let byWeek = `Week ${startWeekNum}`;
  if (endDateStr) {
    const dEnd = new Date(endDateStr);
    if (!isNaN(dEnd.getTime())) {
      const endDay = dEnd.getDate();
      const endWeekNum = Math.min(Math.floor((endDay - 1) / 7) + 1, 4);
      if (endWeekNum !== startWeekNum || dEnd.getMonth() !== dStart.getMonth()) {
        byWeek = `Week ${startWeekNum} - Week ${endWeekNum}`;
      }
    }
  }

  return { byMonth, byWeek };
}

// GET /api/tasks - Get all tasks (optionally filtered by projectId)
export async function getTasks(req, res) {
  const { projectId } = req.query;

  try {
    let query = `
      SELECT 
        t.id,
        t.title,
        t.project_id AS "projectId",
        t.division_id AS "divisionId",
        t.progress,
        TO_CHAR(t.start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(t.end_date, 'YYYY-MM-DD') AS "endDate",
        t.by_month AS "byMonth",
        t.by_week AS "byWeek",
        d.name AS "divisionName",
        t.created_at AS "createdAt",
        t.updated_at AS "updatedAt"
      FROM tasks t
      LEFT JOIN divisions d ON t.division_id = d.id
    `;
    const params = [];

    if (projectId) {
      query += ` WHERE t.project_id = $1`;
      params.push(parseInt(projectId, 10));
    }

    query += ` ORDER BY t.division_id ASC NULLS LAST, t.id ASC`;

    const tasks = await db.any(query, params);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/tasks/:id - Get single task by ID or Title
export async function getTaskById(req, res) {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);

  try {
    const query = `
      SELECT 
        t.id,
        t.title,
        t.project_id AS "projectId",
        t.division_id AS "divisionId",
        t.progress,
        TO_CHAR(t.start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(t.end_date, 'YYYY-MM-DD') AS "endDate",
        t.by_month AS "byMonth",
        t.by_week AS "byWeek",
        d.name AS "divisionName"
      FROM tasks t
      LEFT JOIN divisions d ON t.division_id = d.id
      WHERE ${isNumeric ? 't.id = $1 OR t.title = $2' : 't.title = $1'}
    `;
    const params = isNumeric ? [parseInt(id, 10), id] : [id];
    const task = await db.oneOrNone(query, params);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/tasks - Create a new task
export async function createTask(req, res) {
  const { title, projectId, divisionId, progress, startDate, endDate, byMonth, byWeek } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ success: false, message: 'Start date and End date are required' });
  }

  const computed = computeMonthAndWeek(startDate, endDate);
  const finalByMonth = byMonth || computed.byMonth;
  const finalByWeek = byWeek || computed.byWeek;
  const cleanProgress = Math.min(Math.max(parseInt(progress || 0, 10), 0), 100);

  try {
    const query = `
      INSERT INTO tasks (title, project_id, division_id, progress, start_date, end_date, by_month, by_week)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, 
        title, 
        project_id AS "projectId",
        division_id AS "divisionId", 
        progress, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate", 
        by_month AS "byMonth", 
        by_week AS "byWeek"
    `;
    const newTask = await db.one(query, [
      title.trim(),
      projectId ? parseInt(projectId, 10) : null,
      divisionId ? parseInt(divisionId, 10) : null,
      cleanProgress,
      startDate,
      endDate,
      finalByMonth,
      finalByWeek
    ]);

    res.status(201).json({ success: true, data: newTask });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'A task with this title already exists. Please choose a unique title.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/tasks/:id - Update task
export async function updateTask(req, res) {
  const { id } = req.params;
  const { title, divisionId, progress, startDate, endDate, byMonth, byWeek } = req.body;
  const isNumeric = /^\d+$/.test(id);

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const computed = computeMonthAndWeek(startDate, endDate);
  const finalByMonth = byMonth || computed.byMonth;
  const finalByWeek = byWeek || computed.byWeek;
  const cleanProgress = progress !== undefined ? Math.min(Math.max(parseInt(progress, 10), 0), 100) : 0;

  try {
    const query = `
      UPDATE tasks
      SET 
        title = $1,
        division_id = $2,
        progress = $3,
        start_date = $4,
        end_date = $5,
        by_month = $6,
        by_week = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE ${isNumeric ? 'id = $8 OR title = $9' : 'title = $8'}
      RETURNING 
        id, 
        title, 
        project_id AS "projectId",
        division_id AS "divisionId", 
        progress, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate", 
        by_month AS "byMonth", 
        by_week AS "byWeek"
    `;

    const params = isNumeric
      ? [
          title.trim(),
          divisionId ? parseInt(divisionId, 10) : null,
          cleanProgress,
          startDate,
          endDate,
          finalByMonth,
          finalByWeek,
          parseInt(id, 10),
          id
        ]
      : [
          title.trim(),
          divisionId ? parseInt(divisionId, 10) : null,
          cleanProgress,
          startDate,
          endDate,
          finalByMonth,
          finalByWeek,
          id
        ];

    const updatedTask = await db.oneOrNone(query, params);

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: updatedTask });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Another task with this title already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

// PATCH /api/tasks/:id/progress - Update progress
export async function updateTaskProgress(req, res) {
  const { id } = req.params;
  const { progress } = req.body;
  const isNumeric = /^\d+$/.test(id);

  if (progress === undefined || progress === null) {
    return res.status(400).json({ success: false, message: 'Progress is required' });
  }

  const cleanProgress = Math.min(Math.max(parseInt(progress, 10), 0), 100);

  try {
    const query = `
      UPDATE tasks 
      SET progress = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE ${isNumeric ? 'id = $2 OR title = $3' : 'title = $2'}
      RETURNING id, title, progress
    `;
    const params = isNumeric ? [cleanProgress, parseInt(id, 10), id] : [cleanProgress, id];
    const result = await db.oneOrNone(query, params);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/tasks/:id - Delete a task
export async function deleteTask(req, res) {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);

  try {
    const query = `
      DELETE FROM tasks 
      WHERE ${isNumeric ? 'id = $1 OR title = $2' : 'title = $1'}
      RETURNING id, title
    `;
    const params = isNumeric ? [parseInt(id, 10), id] : [id];
    const deletedTask = await db.oneOrNone(query, params);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully', data: deletedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
