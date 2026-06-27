import { Router } from 'express';
import { getCandidatesByPositionController, getInterviewStepsByPositionController, getPositionsController } from '../presentation/controllers/positionController';

const router = Router();

router.get('/', getPositionsController);

router.get('/:id/candidates', getCandidatesByPositionController);

router.get('/:id/interview-steps', getInterviewStepsByPositionController);

export default router;
