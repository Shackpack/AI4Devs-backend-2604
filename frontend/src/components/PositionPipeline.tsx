import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { getCandidatesByPosition } from '../services/candidateService';
import { PositionPipelineResponse } from '../types/api';
import { CandidatePipelineRow } from './CandidatePipelineRow';

interface PositionPipelineProps {
  positionId: number;
}

export const PositionPipeline: React.FC<PositionPipelineProps> = ({ positionId }) => {
  const [pipeline, setPipeline] = useState<PositionPipelineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPipeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidatesByPosition(positionId);
      setPipeline(data);
    } catch (err) {
      setError('Error al cargar el pipeline de candidatos.');
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="d-flex align-items-center justify-content-between">
        <span>{error}</span>
        <Button variant="outline-danger" size="sm" onClick={fetchPipeline}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  if (!pipeline || pipeline.candidates.length === 0) {
    return (
      <Alert variant="info">
        No hay candidatos en proceso para esta posición.
      </Alert>
    );
  }

  return (
    <Card className="mt-3">
      <Card.Header>
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">{pipeline.positionTitle}</h5>
          </Col>
          <Col xs="auto">
            <small className="text-muted">ID: {pipeline.positionId}</small>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Etapa actual</th>
              <th>Puntuación media</th>
              <th>Fecha de aplicación</th>
              <th>Progreso de entrevistas</th>
            </tr>
          </thead>
          <tbody>
            {pipeline.candidates.map((candidate) => (
              <CandidatePipelineRow key={candidate.applicationId} candidate={candidate} />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
