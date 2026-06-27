import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png';
import { getPositions } from '../services/positionService';
import { PositionSummary } from '../types/api';
import { PositionKanbanBoard } from './PositionKanbanBoard';
import { PositionSelector } from './PositionSelector';

const RecruiterDashboard: React.FC = () => {
  const [positions, setPositions] = useState<PositionSummary[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [loadingPositions, setLoadingPositions] = useState<boolean>(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await getPositions();
        setPositions(data);
        if (data.length > 0) {
          setSelectedPositionId(data[0].id);
        }
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  return (
    <Container className="mt-5">
      <div className="text-center">
        <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
      </div>
      <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow p-4">
            <h5 className="mb-4">Añadir Candidato</h5>
            <Link to="/add-candidate">
              <Button variant="primary" className="w-100">Añadir Nuevo Candidato</Button>
            </Link>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow p-4">
            <h5 className="mb-4">Pipeline de Posiciones</h5>
            <PositionSelector
              positions={positions}
              selectedPositionId={selectedPositionId}
              onSelectPosition={setSelectedPositionId}
              loading={loadingPositions}
            />
            {selectedPositionId !== null && (
              <div className="mt-4">
                <PositionKanbanBoard positionId={selectedPositionId} />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecruiterDashboard;
