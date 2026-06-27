import React, { useState } from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png';
import { PositionKanbanBoard } from './PositionKanbanBoard';
import { PositionSelector } from './PositionSelector';

const RecruiterDashboard: React.FC = () => {
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  return (
    <Container className="mt-5">
      <div className="text-center">
        <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
      </div>
      <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>

      <Row className="g-4 align-items-start">
        <Col md={4} lg={3}>
          <Card className="shadow p-4">
            <h5 className="mb-4">Añadir Candidato</h5>
            <Link to="/add-candidate">
              <Button variant="primary" className="w-100">
                Añadir Nuevo Candidato
              </Button>
            </Link>
          </Card>
        </Col>

        <Col md={8} lg={9}>
          <Card className="shadow p-4">
            <h5 className="mb-3">Pipeline de Posición</h5>
            <PositionSelector
              selectedPositionId={selectedPositionId}
              onPositionChange={setSelectedPositionId}
            />
          </Card>
        </Col>
      </Row>

      {selectedPositionId !== null && (
        <Row className="mt-4">
          <Col>
            <PositionKanbanBoard positionId={selectedPositionId} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RecruiterDashboard;
