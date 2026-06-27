import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { updateCandidateStage } from '../services/candidateService';
import { InterviewStep } from '../types/api';
import { getErrorMessage } from '../utils/errorHandler';
import { StageConfirmationModal } from './StageConfirmationModal';

interface CandidateStageUpdaterProps {
  candidateId: number;
  candidateName: string;
  positionId: number;
  currentStepId: number;
  availableSteps: InterviewStep[];
  onUpdated: () => void;
  onError: (message: string) => void;
}

export const CandidateStageUpdater: React.FC<CandidateStageUpdaterProps> = ({
  candidateId,
  candidateName,
  positionId,
  currentStepId,
  availableSteps,
  onUpdated,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingStepId, setPendingStepId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

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
    setModalError(null);
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
      const message = getErrorMessage(err);
      setModalError(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPendingStepId(null);
    setModalError(null);
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
          candidateName={candidateName}
          previousStepName={currentStep.name}
          newStepName={newStep.name}
          loading={loading}
          errorMessage={modalError}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
