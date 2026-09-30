import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskProgress,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/progress', updateTaskProgress);
router.delete('/:id', deleteTask);

export default router;
