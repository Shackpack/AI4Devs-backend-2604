import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { updateCandidateStage } from '../services/candidateService';
import { InterviewStep } from '../types/api';
import { StageConfirmationModal } from './StageConfirmationModal';

interface CandidateStageUpdaterProps {
  candidateId: number;
  positionId: number;
  currentStepId: number;
  availableSteps: InterviewStep[];
  onUpdated: () => void;
  onError: (message: string) => void;
}

export const CandidateStageUpdater: React.FC<CandidateStageUpdaterProps> = ({
  candidateId,
  positionId,
  currentStepId,
  availableSteps,
  onUpdated,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingStepId, setPendingStepId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const currentStep = availableSteps.find((s) => s.id === currentStepId) ?? null;
  const newStep = availableSteps.find((s) => s.id === pendingStepId) ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId === currentStepId) return;
    setPendingStepId(selectedId);
    setShowModal(true);
  };

  const handleConfirm = async (notes: string) => {
    if (pendingStepId === null) return;

    setLoading(true);
    try {
      await updateCandidateStage(candidateId, {
        positionId,
        newInterviewStepId: pendingStepId,
        notes: notes || undefined,
      });
      setShowModal(false);
      setPendingStepId(null);
      onUpdated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar la etapa del candidato.';
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingStepId(null);
  };

  return (
    <>
      <div className="d-flex align-items-center gap-2">
        <Form.Select
          size="sm"
          value={currentStepId}
          onChange={handleChange}
          disabled={loading}
          aria-label="Cambiar etapa del candidato"
          style={{ maxWidth: '200px' }}
        >
          {availableSteps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </Form.Select>
        {loading && <Spinner animation="border" size="sm" />}
      </div>

      {showModal && currentStep && newStep && (
        <StageConfirmationModal
          show={showModal}
          candidateName=""
          previousStepName={currentStep.name}
          newStepName={newStep.name}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
