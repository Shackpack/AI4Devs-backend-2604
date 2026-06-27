import React, { useEffect, useState } from 'react';
import { Alert, Form, Spinner } from 'react-bootstrap';
import { getPositions } from '../services/positionService';
import { PositionSummary } from '../types/api';

interface PositionSelectorProps {
  selectedPositionId: number | null;
  onPositionChange: (positionId: number) => void;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  selectedPositionId,
  onPositionChange,
}) => {
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPositions();
        setPositions(data);
        if (data.length > 0 && selectedPositionId === null) {
          onPositionChange(data[0].id);
        }
      } catch {
        setError('Error al cargar las posiciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Cargando posiciones...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
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
        onChange={(e) => onPositionChange(Number(e.target.value))}
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
