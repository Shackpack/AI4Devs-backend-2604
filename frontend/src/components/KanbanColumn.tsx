import { useDroppable } from '@dnd-kit/core';
import React from 'react';
import { Badge, Card } from 'react-bootstrap';
import { KanbanColumnData } from '../utils/groupCandidatesByStep';
import { CandidateKanbanCard } from './CandidateKanbanCard';

interface KanbanColumnProps {
  column: KanbanColumnData;
  positionId: number;
  updatingApplicationId: number | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  positionId,
  updatingApplicationId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.step.id}`,
    data: {
      stepId: column.step.id,
      stepName: column.step.name,
    },
  });

  return (
    <div
      style={{ minWidth: '220px', maxWidth: '260px', flexShrink: 0 }}
      className="d-flex flex-column"
    >
      <div className="d-flex align-items-center justify-content-between mb-2 px-1">
        <span className="fw-semibold small text-truncate">{column.step.name}</span>
        <Badge bg="secondary" pill>{column.candidates.length}</Badge>
      </div>
      <Card
        ref={setNodeRef}
        className="flex-grow-1"
        style={{
          minHeight: '120px',
          backgroundColor: isOver ? '#e8f4fd' : '#f8f9fa',
          border: isOver ? '2px dashed #0d6efd' : '2px dashed transparent',
          transition: 'background-color 0.15s, border 0.15s',
        }}
      >
        <Card.Body className="p-2">
          {column.candidates.length === 0 ? (
            <p className="text-muted text-center small mt-2">Sin candidatos</p>
          ) : (
            column.candidates.map((candidate) => (
              <CandidateKanbanCard
                key={candidate.applicationId}
                candidate={candidate}
                positionId={positionId}
                disabled={updatingApplicationId === candidate.applicationId}
              />
            ))
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
