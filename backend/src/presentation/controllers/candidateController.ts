import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateCandidateStage as updateCandidateStageService } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateCandidateStage = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        const { positionId, newInterviewStepId, notes } = req.body;

        if (positionId === undefined || typeof positionId !== 'number') {
            return res.status(400).json({ error: 'positionId is required and must be a number' });
        }

        if (newInterviewStepId === undefined || typeof newInterviewStepId !== 'number') {
            return res.status(400).json({ error: 'newInterviewStepId is required and must be a number' });
        }

        if (notes !== undefined && typeof notes !== 'string') {
            return res.status(400).json({ error: 'notes must be a string' });
        }

        const result = await updateCandidateStageService(candidateId, positionId, newInterviewStepId, notes);
        res.json(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Candidate not found' || error.message === 'Application not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Interview step not found' || error.message === 'Interview step does not belong to the position flow') {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { addCandidate };