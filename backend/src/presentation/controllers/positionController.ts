import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }

        const result = await getCandidatesByPosition(id);
        res.json(result);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({ error: 'Position not found' });
            }
            return res.status(500).json({ error: 'Internal Server Error', message: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
