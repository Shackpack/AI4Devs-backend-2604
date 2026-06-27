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
