import React from 'react';
import { Badge, ProgressBar } from 'react-bootstrap';
import { CandidateInPipeline, InterviewStep } from '../types/api';
import { formatScore } from '../utils/formatScore';
import { getStepBadgeVariant } from '../utils/getStepBadgeVariant';
import { isFinalStep } from '../utils/isFinalStep';
import { CandidateStageUpdater } from './CandidateStageUpdater';

interface CandidatePipelineRowProps {
  candidate: CandidateInPipeline;
  onClick?: (candidate: CandidateInPipeline) => void;
  positionId?: number;
  availableSteps?: InterviewStep[];
  onStageUpdated?: () => void;
  onStageError?: (message: string) => void;
}

export const CandidatePipelineRow: React.FC<CandidatePipelineRowProps> = ({
  candidate,
  onClick,
  positionId,
  availableSteps,
  onStageUpdated,
  onStageError,
}) => {
  const progress =
    candidate.totalInterviews === 0
      ? 0
      : (candidate.completedInterviews / candidate.totalInterviews) * 100;

  const showStageUpdater =
    positionId !== undefined &&
    availableSteps !== undefined &&
    availableSteps.length > 0 &&
    onStageUpdated !== undefined &&
    onStageError !== undefined;

  const final = isFinalStep(candidate.currentInterviewStep.name);

  return (
    <tr
      onClick={() => onClick?.(candidate)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className={final ? 'table-light' : undefined}
    >
      <td>{candidate.fullName}</td>
      <td>
        {showStageUpdater ? (
          <CandidateStageUpdater
            candidateId={candidate.candidateId}
            candidateName={candidate.fullName}
            positionId={positionId!}
            currentStepId={candidate.currentInterviewStep.id}
            availableSteps={availableSteps!}
            onUpdated={onStageUpdated!}
            onError={onStageError!}
          />
        ) : (
          <Badge bg={getStepBadgeVariant(candidate.currentInterviewStep.name)}>
            {candidate.currentInterviewStep.name}
          </Badge>
        )}
      </td>
      <td>{formatScore(candidate.averageScore)}</td>
      <td>{new Date(candidate.applicationDate).toLocaleString('es-ES')}</td>
      <td>
        {candidate.completedInterviews}/{candidate.totalInterviews}
        <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mt-1" />
      </td>
    </tr>
  );
};
