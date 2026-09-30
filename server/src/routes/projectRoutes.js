import { Router } from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProjectInfo, 
  deleteProject 
} from '../controllers/projectController.js';

const router = Router();

router.get('/', getAllProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProjectInfo);
router.delete('/:id', deleteProject);

export default router;
