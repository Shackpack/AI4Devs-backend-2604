import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { Badge, Card, ProgressBar } from 'react-bootstrap';
import { CandidateInPipeline } from '../types/api';
import { formatScore } from '../utils/formatScore';
import { getStepBadgeVariant, isFinalStep } from '../utils/getStepBadgeVariant';

interface CandidateKanbanCardProps {
  candidate: CandidateInPipeline;
  positionId: number;
  disabled?: boolean;
}

const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const CandidateKanbanCard: React.FC<CandidateKanbanCardProps> = ({
  candidate,
  positionId,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${candidate.applicationId}`,
    data: {
      candidateId: candidate.candidateId,
      applicationId: candidate.applicationId,
      currentStepId: candidate.currentInterviewStep.id,
      currentStepName: candidate.currentInterviewStep.name,
      fullName: candidate.fullName,
      positionId,
    },
    disabled,
  });

  const progress =
    candidate.totalInterviews === 0
      ? 0
      : Math.round((candidate.completedInterviews / candidate.totalInterviews) * 100);

  const badgeVariant = getStepBadgeVariant(candidate.currentInterviewStep.name);
  const final = isFinalStep(candidate.currentInterviewStep.name);

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
    borderLeft: final ? `4px solid var(--bs-${badgeVariant})` : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-2 shadow-sm${final ? ' bg-light' : ''}`}
      {...listeners}
      {...attributes}
    >
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <span className="fw-semibold small">{candidate.fullName}</span>
          <Badge bg={badgeVariant} className="ms-1 text-wrap text-end" style={{ fontSize: '0.7rem' }}>
            {candidate.currentInterviewStep.name}
          </Badge>
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          <div>Puntuación: <strong>{formatScore(candidate.averageScore)}</strong></div>
          <div>Fecha: {formatDate(candidate.applicationDate)}</div>
          <div className="mt-1">
            <span>{candidate.completedInterviews}/{candidate.totalInterviews} entrevistas</span>
            <ProgressBar now={progress} className="mt-1" style={{ height: '4px' }} />
          </div>
        </div>
        {disabled && (
          <div className="text-center mt-1">
            <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>Guardando...</Badge>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
