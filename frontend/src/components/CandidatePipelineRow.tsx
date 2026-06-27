import React from 'react';
import { Badge, ProgressBar } from 'react-bootstrap';
import { CandidateInPipeline } from '../types/api';
import { formatScore } from '../utils/formatScore';
import { getStepBadgeVariant } from '../utils/getStepBadgeVariant';

interface CandidatePipelineRowProps {
  candidate: CandidateInPipeline;
  onClick?: (candidate: CandidateInPipeline) => void;
}

export const CandidatePipelineRow: React.FC<CandidatePipelineRowProps> = ({
  candidate,
  onClick,
}) => {
  const progress =
    candidate.totalInterviews === 0
      ? 0
      : (candidate.completedInterviews / candidate.totalInterviews) * 100;

  return (
    <tr
      onClick={() => onClick?.(candidate)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <td>{candidate.fullName}</td>
      <td>
        <Badge bg={getStepBadgeVariant(candidate.currentInterviewStep.name)}>
          {candidate.currentInterviewStep.name}
        </Badge>
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
