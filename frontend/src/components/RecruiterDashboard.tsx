import React, { useState } from 'react';
import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png';
import { PositionPipeline } from './PositionPipeline';

const RecruiterDashboard: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  const handleLoadPipeline = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedPositionId(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoadPipeline();
    }
  };

  return (
    <Container className="mt-5">
      <div className="text-center">
        <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
      </div>
      <h1 className="mb-4 text-center">Dashboard del Reclutador</h1>

      <Row className="g-4">
        <Col md={6}>
          <Card className="shadow p-4">
            <h5 className="mb-4">Añadir Candidato</h5>
            <Link to="/add-candidate">
              <Button variant="primary" className="btn-block">
                Añadir Nuevo Candidato
              </Button>
            </Link>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow p-4">
            <h5 className="mb-3">Pipeline de Posición</h5>
            <InputGroup>
              <Form.Control
                type="number"
                min={1}
                placeholder="ID de posición"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="ID de posición"
              />
              <Button variant="outline-primary" onClick={handleLoadPipeline}>
                Ver pipeline
              </Button>
            </InputGroup>
          </Card>
        </Col>
      </Row>

      {selectedPositionId !== null && (
        <Row className="mt-4">
          <Col>
            <PositionPipeline positionId={selectedPositionId} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RecruiterDashboard;
