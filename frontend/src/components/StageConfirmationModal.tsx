import React, { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';

interface StageConfirmationModalProps {
  show: boolean;
  candidateName: string;
  previousStepName: string;
  newStepName: string;
  loading?: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

const MAX_NOTES_LENGTH = 500;

export const StageConfirmationModal: React.FC<StageConfirmationModalProps> = ({
  show,
  candidateName,
  previousStepName,
  newStepName,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes.trim());
    setNotes('');
  };

  const handleCancel = () => {
    setNotes('');
    onCancel();
  };

  return (
    <Modal show={show} onHide={handleCancel} backdrop="static" centered>
      <Modal.Header closeButton={!loading}>
        <Modal.Title>Cambiar etapa — {candidateName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-3">
          De <strong>{previousStepName}</strong> a <strong>{newStepName}</strong>
        </p>
        <Form.Group controlId="stageNotes">
          <Form.Label>Notas opcionales</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Añade notas sobre este cambio (opcional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={MAX_NOTES_LENGTH}
            disabled={loading}
          />
          <Form.Text className="text-muted">
            {notes.length}/{MAX_NOTES_LENGTH} caracteres
          </Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={loading}>
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Guardando...
            </>
          ) : (
            'Confirmar'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
