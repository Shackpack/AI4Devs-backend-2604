import { Request, Response } from 'express';
import { getCandidatesByPositionController, getPositionsController } from '../presentation/controllers/positionController';
import * as positionService from '../application/services/positionService';

jest.mock('../application/services/positionService', () => ({
    getCandidatesByPosition: jest.fn(),
    getPositions: jest.fn(),
}));

describe('GET /positions/:id/candidates', () => {
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

    it('should return 400 if position ID is not numeric', async () => {
        mockRequest = {
            params: { id: 'abc' },
        };

        await getCandidatesByPositionController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position ID format' });
    });

    it('should return 404 if position is not found', async () => {
        mockRequest = {
            params: { id: '999' },
        };

        (positionService.getCandidatesByPosition as jest.Mock).mockRejectedValue(new Error('Position not found'));

        await getCandidatesByPositionController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Position not found' });
    });

    it('should return candidates for a valid position', async () => {
        mockRequest = {
            params: { id: '1' },
        };

        const mockResult = {
            positionId: 1,
            positionTitle: 'Senior Developer',
            candidates: [
                {
                    applicationId: 1,
                    candidateId: 1,
                    fullName: 'Juan Pérez García',
                    currentInterviewStep: {
                        id: 3,
                        name: 'Entrevista Técnica',
                        orderIndex: 3,
                    },
                    averageScore: 8.5,
                    applicationDate: new Date('2024-01-15T10:30:00Z'),
                    totalInterviews: 2,
                    completedInterviews: 2,
                },
            ],
        };

        (positionService.getCandidatesByPosition as jest.Mock).mockResolvedValue(mockResult);

        await getCandidatesByPositionController(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should return empty candidates array if no applications exist', async () => {
        mockRequest = {
            params: { id: '2' },
        };

        const mockResult = {
            positionId: 2,
            positionTitle: 'Backend Developer',
            candidates: [],
        };

        (positionService.getCandidatesByPosition as jest.Mock).mockResolvedValue(mockResult);

        await getCandidatesByPositionController(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith(mockResult);
    });

    it('should return 500 on unexpected error', async () => {
        mockRequest = {
            params: { id: '1' },
        };

        (positionService.getCandidatesByPosition as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await getCandidatesByPositionController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: 'Internal Server Error',
            message: 'Database connection failed',
        });
    });
});

describe('GET /positions', () => {
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

    it('should return a list of active positions', async () => {
        mockRequest = {};

        const mockPositions = [
            {
                id: 1,
                title: 'Software Engineer',
                description: 'Develop and maintain software applications.',
                status: 'Open',
                location: 'Remote',
                employmentType: 'Full-time',
                salaryMin: 50000,
                salaryMax: 80000,
            },
            {
                id: 2,
                title: 'Data Scientist',
                description: 'Analyze and interpret complex data.',
                status: 'Open',
                location: 'Remote',
                employmentType: 'Full-time',
                salaryMin: 60000,
                salaryMax: 90000,
            },
        ];

        (positionService.getPositions as jest.Mock).mockResolvedValue(mockPositions);

        await getPositionsController(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith(mockPositions);
    });

    it('should return an empty array if no active positions exist', async () => {
        mockRequest = {};

        (positionService.getPositions as jest.Mock).mockResolvedValue([]);

        await getPositionsController(mockRequest as Request, mockResponse as Response);

        expect(jsonMock).toHaveBeenCalledWith([]);
    });

    it('should return 500 on unexpected error', async () => {
        mockRequest = {};

        (positionService.getPositions as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

        await getPositionsController(mockRequest as Request, mockResponse as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: 'Internal Server Error',
            message: 'Database connection failed',
        });
    });
});
