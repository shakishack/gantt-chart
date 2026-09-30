import express from 'express';
import {
  getDivisions,
  getDivisionById,
  createDivision,
  updateDivision,
  deleteDivision
} from '../controllers/divisionController.js';

const router = express.Router();

router.get('/', getDivisions);
router.get('/:id', getDivisionById);
router.post('/', createDivision);
router.put('/:id', updateDivision);
router.delete('/:id', deleteDivision);

export default router;
