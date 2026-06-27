import { CandidateInPipeline, InterviewStep } from '../types/api';

export interface KanbanColumnData {
  step: InterviewStep;
  candidates: CandidateInPipeline[];
}

export const groupCandidatesByStep = (
  steps: InterviewStep[],
  candidates: CandidateInPipeline[]
): KanbanColumnData[] => {
  return steps.map((step) => ({
    step,
    candidates: candidates.filter(
      (c) => c.currentInterviewStep.id === step.id
    ),
  }));
};
