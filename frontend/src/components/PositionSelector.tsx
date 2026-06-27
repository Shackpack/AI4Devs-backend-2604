import React from 'react';
import { Alert, Form, Spinner } from 'react-bootstrap';
import { PositionSummary } from '../types/api';

interface PositionSelectorProps {
  positions: PositionSummary[];
  selectedPositionId: number | null;
  onSelectPosition: (positionId: number) => void;
  loading: boolean;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  positions,
  selectedPositionId,
  onSelectPosition,
  loading,
}) => {
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Cargando posiciones...</span>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <Alert variant="info">No hay posiciones disponibles.</Alert>
    );
  }

  return (
    <Form.Group controlId="positionSelector">
      <Form.Label className="fw-semibold">Posición</Form.Label>
      <Form.Select
        value={selectedPositionId ?? ''}
        onChange={(e) => onSelectPosition(Number(e.target.value))}
        aria-label="Seleccionar posición"
      >
        {positions.map((pos) => (
          <option key={pos.id} value={pos.id}>
            {pos.title}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
};
