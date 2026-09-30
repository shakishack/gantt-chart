import { db } from '../db/db.js';

// GET /api/division - Get all divisions (optionally filtered by projectId)
export async function getDivisions(req, res) {
  const { projectId } = req.query;

  try {
    let query = 'SELECT * FROM divisions';
    const params = [];

    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(parseInt(projectId, 10));
    }

    query += ' ORDER BY id ASC';

    const divisions = await db.any(query, params);
    res.json({ success: true, data: divisions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/division/:id - Get division by id
export async function getDivisionById(req, res) {
  const { id } = req.params;
  try {
    const division = await db.oneOrNone('SELECT * FROM divisions WHERE id = $1', [id]);
    if (!division) {
      return res.status(404).json({ success: false, message: 'Division not found' });
    }
    res.json({ success: true, data: division });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/division - Create a new division
export async function createDivision(req, res) {
  const { name, projectId } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Division name is required' });
  }

  try {
    const query = projectId
      ? 'INSERT INTO divisions (name, project_id) VALUES ($1, $2) RETURNING *'
      : 'INSERT INTO divisions (name) VALUES ($1) RETURNING *';
    const params = projectId ? [name.trim(), parseInt(projectId, 10)] : [name.trim()];

    const newDivision = await db.one(query, params);
    res.status(201).json({ success: true, data: newDivision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/division/:id - Update division name
export async function updateDivision(req, res) {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Division name is required' });
  }

  try {
    const updatedDivision = await db.oneOrNone(
      'UPDATE divisions SET name = $1 WHERE id = $2 RETURNING *',
      [name.trim(), id]
    );

    if (!updatedDivision) {
      return res.status(404).json({ success: false, message: 'Division not found' });
    }

    res.json({ success: true, data: updatedDivision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/division/:id - Delete division
export async function deleteDivision(req, res) {
  const { id } = req.params;
  try {
    const deletedDivision = await db.oneOrNone(
      'DELETE FROM divisions WHERE id = $1 RETURNING *',
      [id]
    );

    if (!deletedDivision) {
      return res.status(404).json({ success: false, message: 'Division not found' });
    }

    res.json({ success: true, message: 'Division deleted successfully', data: deletedDivision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
