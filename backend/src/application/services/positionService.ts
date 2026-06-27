import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CandidateResult {
    applicationId: number;
    candidateId: number;
    fullName: string;
    currentInterviewStep: {
        id: number;
        name: string;
        orderIndex: number;
    };
    averageScore: number | null;
    applicationDate: Date;
    totalInterviews: number;
    completedInterviews: number;
}

interface PositionCandidatesResult {
    positionId: number;
    positionTitle: string;
    candidates: CandidateResult[];
}

interface PositionSummary {
    id: number;
    title: string;
    description: string;
    status: string;
    location: string;
    employmentType: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
}

export const getPositions = async (): Promise<PositionSummary[]> => {
    const positions = await prisma.position.findMany({
        where: {
            status: 'Open',
            isVisible: true
        },
        orderBy: {
            title: 'asc'
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            location: true,
            employmentType: true,
            salaryMin: true,
            salaryMax: true
        }
    });

    return positions.map((position: any) => ({
        id: position.id,
        title: position.title,
        description: position.description,
        status: position.status,
        location: position.location,
        employmentType: position.employmentType,
        salaryMin: position.salaryMin,
        salaryMax: position.salaryMax
    }));
};

export const getCandidatesByPosition = async (positionId: number): Promise<PositionCandidatesResult> => {
    const position = await prisma.position.findUnique({
        where: { id: positionId }
    });

    if (!position) {
        throw new Error('Position not found');
    }

    const applications = await prisma.application.findMany({
        where: { positionId: positionId },
        include: {
            candidate: true,
            interviewStep: true,
            interviews: true
        },
        orderBy: {
            interviewStep: {
                orderIndex: 'desc'
            }
        }
    });

    const candidates: CandidateResult[] = applications.map((application: any) => {
        const scoredInterviews = application.interviews.filter((interview: any) => interview.score !== null);
        const averageScore = scoredInterviews.length > 0
            ? scoredInterviews.reduce((sum: number, interview: any) => sum + (interview.score || 0), 0) / scoredInterviews.length
            : null;

        return {
            applicationId: application.id,
            candidateId: application.candidate.id,
            fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
            currentInterviewStep: {
                id: application.interviewStep.id,
                name: application.interviewStep.name,
                orderIndex: application.interviewStep.orderIndex
            },
            averageScore: averageScore !== null ? Math.round(averageScore * 100) / 100 : null,
            applicationDate: application.applicationDate,
            totalInterviews: application.interviews.length,
            completedInterviews: scoredInterviews.length
        };
    });

    return {
        positionId: position.id,
        positionTitle: position.title,
        candidates
    };
};
