export interface CurrentInterviewStep {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CandidateInPipeline {
  applicationId: number;
  candidateId: number;
  fullName: string;
  currentInterviewStep: CurrentInterviewStep;
  averageScore: number | null;
  applicationDate: string;
  totalInterviews: number;
  completedInterviews: number;
}

export interface PositionPipelineResponse {
  positionId: number;
  positionTitle: string;
  candidates: CandidateInPipeline[];
}

export interface InterviewStep {
  id: number;
  name: string;
  orderIndex: number;
  interviewType: string;
}

export interface PositionInterviewStepsResponse {
  positionId: number;
  positionTitle: string;
  interviewFlowId: number;
  steps: InterviewStep[];
}

export interface PositionSummary {
  id: number;
  title: string;
  description: string;
  status: string;
  location: string;
  employmentType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
}

export interface UpdateCandidateStageRequest {
  positionId: number;
  newInterviewStepId: number;
  notes?: string;
}

export interface UpdateCandidateStageResponse {
  success: boolean;
  applicationId: number;
  previousStep: {
    id: number;
    name: string;
  };
  currentStep: {
    id: number;
    name: string;
  };
  message: string;
}
