import { Request, Response } from 'express';
import { updateCandidateStage } from '../presentation/controllers/candidateController';
import * as candidateService from '../application/services/candidateService';

jest.mock('../application/services/candidateService', () => ({
    updateCandidateStage: jest.fn(),
}));

describe('PUT /candidates/:id/stage', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });

    it('should return 400 if candidate ID is not numeric', async () => {
        mockRequest = {
            params: { id: 'abc' },
            body: { positionId: 1, newInterviewStepId: 2 },
        };

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid candidate ID format' });
    });

    it('should return 400 if positionId is missing', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { newInterviewStepId: 2 },
        };

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'positionId is required and must be a number' });
    });

    it('should return 400 if newInterviewStepId is missing', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1 },
        };

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'newInterviewStepId is required and must be a number' });
    });

    it('should return 400 if notes is not a string', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 2, notes: 123 },
        };

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'notes must be a string' });
    });

    it('should return 404 if candidate is not found', async () => {
        mockRequest = {
            params: { id: '999' },
            body: { positionId: 1, newInterviewStepId: 2 },
        };

        (candidateService.updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Candidate not found'));

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Candidate not found' });
    });

    it('should return 404 if application is not found', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 999, newInterviewStepId: 2 },
        };

        (candidateService.updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Application not found'));

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Application not found' });
    });

    it('should return 400 if interview step is invalid', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 999 },
        };

        (candidateService.updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Interview step not found'));

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Interview step not found' });
    });

    it('should return 400 if interview step does not belong to position flow', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 5 },
        };

        (candidateService.updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Interview step does not belong to the position flow'));

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Interview step does not belong to the position flow' });
    });

    it('should update candidate stage successfully', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 4, notes: 'Aprobado' },
        };

        const mockResult = {
            success: true,
            applicationId: 1,
            previousStep: { id: 3, name: 'Entrevista Técnica' },
            currentStep: { id: 4, name: 'Entrevista Final' },
            message: 'Etapa actualizada exitosamente',
        };

        (candidateService.updateCandidateStage as jest.Mock).mockResolvedValue(mockResult);

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith(mockResult);
        expect(candidateService.updateCandidateStage).toHaveBeenCalledWith(1, 1, 4, 'Aprobado');
    });

    it('should update candidate stage without notes', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 4 },
        };

        const mockResult = {
            success: true,
            applicationId: 1,
            previousStep: { id: 3, name: 'Entrevista Técnica' },
            currentStep: { id: 4, name: 'Entrevista Final' },
            message: 'Etapa actualizada exitosamente',
        };

        (candidateService.updateCandidateStage as jest.Mock).mockResolvedValue(mockResult);

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith(mockResult);
        expect(candidateService.updateCandidateStage).toHaveBeenCalledWith(1, 1, 4, undefined);
    });

    it('should return 500 on unexpected error', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { positionId: 1, newInterviewStepId: 4 },
        };

        (candidateService.updateCandidateStage as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await updateCandidateStage(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: 'Internal Server Error',
            message: 'Database connection failed',
        });
    });
});
