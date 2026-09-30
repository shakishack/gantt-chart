import { db } from '../db/db.js';

// GET /api/project - Get all projects
export async function getAllProjects(req, res) {
  try {
    const projects = await db.any(`
      SELECT 
        id, 
        title, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate",
        updated_at AS "updatedAt"
      FROM project_info 
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/project/:id - Get single project by ID
export async function getProjectById(req, res) {
  const { id } = req.params;
  try {
    const project = await db.oneOrNone(`
      SELECT 
        id, 
        title, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate"
      FROM project_info 
      WHERE id = $1
    `, [id]);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/project - Create a new project
export async function createProject(req, res) {
  const { title, startDate, endDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Project title is required' });
  }

  try {
    const newProject = await db.one(`
      INSERT INTO project_info (title, start_date, end_date)
      VALUES ($1, $2, $3)
      RETURNING 
        id, 
        title, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate"
    `, [title.trim(), startDate || null, endDate || null]);

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/project/:id - Update project info
export async function updateProjectInfo(req, res) {
  const { id } = req.params;
  const { title, startDate, endDate } = req.body;

  try {
    const updated = await db.one(`
      UPDATE project_info
      SET 
        title = COALESCE($1, title),
        start_date = $2,
        end_date = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING 
        id, 
        title, 
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate", 
        TO_CHAR(end_date, 'YYYY-MM-DD') AS "endDate"
    `, [title, startDate || null, endDate || null, id]);

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/project/:id - Delete project and cascading records
export async function deleteProject(req, res) {
  const { id } = req.params;
  try {
    const deleted = await db.oneOrNone(`
      DELETE FROM project_info 
      WHERE id = $1 
      RETURNING id, title
    `, [id]);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
