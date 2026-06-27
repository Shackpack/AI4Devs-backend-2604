import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { getCandidatesByPosition, updateCandidateStage } from '../services/candidateService';
import { getInterviewStepsByPosition } from '../services/positionService';
import { CandidateInPipeline, InterviewStep } from '../types/api';
import { groupCandidatesByStep } from '../utils/groupCandidatesByStep';
import { KanbanColumn } from './KanbanColumn';
import { StageConfirmationModal } from './StageConfirmationModal';

interface PositionKanbanBoardProps {
  positionId: number;
}

interface PendingMove {
  candidateId: number;
  applicationId: number;
  fullName: string;
  currentStepId: number;
  currentStepName: string;
  newStepId: number;
  newStepName: string;
}

export const PositionKanbanBoard: React.FC<PositionKanbanBoardProps> = ({ positionId }) => {
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<CandidateInPipeline[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<number | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [stepsData, candidatesData] = await Promise.all([
        getInterviewStepsByPosition(positionId),
        getCandidatesByPosition(positionId),
      ]);
      setSteps(stepsData);
      setCandidates(candidatesData.candidates);
    } catch {
      setError('Error al cargar el tablero Kanban.');
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const columns = useMemo(
    () => groupCandidatesByStep(steps, candidates),
    [steps, candidates]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const cardData = active.data.current as {
      candidateId: number;
      applicationId: number;
      currentStepId: number;
      currentStepName: string;
      fullName: string;
      positionId: number;
    };

    const columnData = over.data.current as {
      stepId: number;
      stepName: string;
    };

    if (cardData.currentStepId === columnData.stepId) return;

    setPendingMove({
      candidateId: cardData.candidateId,
      applicationId: cardData.applicationId,
      fullName: cardData.fullName,
      currentStepId: cardData.currentStepId,
      currentStepName: cardData.currentStepName,
      newStepId: columnData.stepId,
      newStepName: columnData.stepName,
    });
  };

  const handleConfirmMove = async (notes: string) => {
    if (!pendingMove) return;

    setModalLoading(true);
    setUpdatingApplicationId(pendingMove.applicationId);

    try {
      await updateCandidateStage(pendingMove.candidateId, {
        positionId,
        newInterviewStepId: pendingMove.newStepId,
        notes: notes || undefined,
      });

      setSuccessMessage(
        `${pendingMove.fullName} movido/a a "${pendingMove.newStepName}" correctamente.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);

      setPendingMove(null);
      await loadBoard();
    } catch {
      setError('Error al actualizar la etapa del candidato.');
      setPendingMove(null);
    } finally {
      setModalLoading(false);
      setUpdatingApplicationId(null);
    }
  };

  const handleCancelMove = () => {
    setPendingMove(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando tablero...</span>
        </Spinner>
      </div>
    );
  }

  if (error && !pendingMove) {
    return (
      <Alert variant="danger" className="d-flex align-items-center justify-content-between">
        <span>{error}</span>
        <Button variant="outline-danger" size="sm" onClick={loadBoard}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (steps.length === 0) {
    return (
      <Alert variant="info">No hay etapas configuradas para esta posición.</Alert>
    );
  }

  return (
    <>
      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          className="d-flex gap-3 pb-3"
          style={{ overflowX: 'auto', alignItems: 'flex-start' }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.step.id}
              column={column}
              positionId={positionId}
              updatingApplicationId={updatingApplicationId}
            />
          ))}
        </div>
      </DndContext>

      {pendingMove && (
        <StageConfirmationModal
          show={true}
          candidateName={pendingMove.fullName}
          previousStepName={pendingMove.currentStepName}
          newStepName={pendingMove.newStepName}
          loading={modalLoading}
          onConfirm={handleConfirmMove}
          onCancel={handleCancelMove}
        />
      )}
    </>
  );
};
