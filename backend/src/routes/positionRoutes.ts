import { Router } from 'express';
import { getCandidatesByPositionController, getPositionsController } from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getPositionsController);

router.get('/:id/candidates', getCandidatesByPositionController);

export default router;
