# Frontend Product Tickets - LTI Talent Tracking System

> Basado en las user stories de front-end definidas en `FRONTEND_USER_STORIES.md`.
> Stack: React 18 + TypeScript + React-Bootstrap + React Router + Jest + React Testing Library.

---

## Ticket FE-001: Dashboard de Pipeline por Posición

**Título**: Dashboard de Pipeline por Posición - Visualizar candidatos en proceso

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-001  
**Backend Ticket relacionado**: Ticket #001 - `GET /positions/:id/candidates`  
**Estimación**: 8 story points

### User Story

Como reclutador, quiero visualizar en el dashboard una lista de todos los candidatos que están en proceso para una posición específica, para gestionar el pipeline de reclutamiento sin salir del panel principal.

### Requisitos Funcionales

1. **Sección de Pipeline**: El `RecruiterDashboard` debe incluir una nueva sección debajo o junto al botón de "Añadir Candidato" que muestre el pipeline de candidatos para una posición seleccionada.
2. **Petición de datos**: Al seleccionar una posición, el frontend debe invocar `GET /positions/:id/candidates` al backend en `http://localhost:3010`.
3. **Campos visibles por candidato**:
   - Nombre completo (`fullName`).
   - Etapa actual del proceso (`currentInterviewStep.name`).
   - Puntuación media (`averageScore`).
   - Fecha de aplicación (`applicationDate`), formateada a locale español.
   - Progreso de entrevistas (`completedInterviews / totalInterviews`).
4. **Ordenamiento**: Los candidatos deben mostrarse ordenados por `currentInterviewStep.orderIndex` descendente (más avanzado primero). El backend ya lo ordena; el frontend debe respetar el orden del array recibido.
5. **Estados de UI**:
   - Loading: mostrar spinner (`Spinner` de React-Bootstrap) o skeleton mientras se carga.
   - Empty state: mensaje "No hay candidatos en proceso para esta posición" cuando el array `candidates` esté vacío.
   - Error state: mensaje de error con botón "Reintentar" si falla la petición.
6. **Meta información de posición**: mostrar `positionTitle` y `positionId` recibidos del backend.

### API Contract

```typescript
// GET http://localhost:3010/positions/{positionId}/candidates
interface CurrentInterviewStep {
  id: number;
  name: string;
  orderIndex: number;
}

interface CandidateInPipeline {
  applicationId: number;
  candidateId: number;
  fullName: string;
  currentInterviewStep: CurrentInterviewStep;
  averageScore: number | null;
  applicationDate: string; // ISO 8601
  totalInterviews: number;
  completedInterviews: number;
}

interface PositionPipelineResponse {
  positionId: number;
  positionTitle: string;
  candidates: CandidateInPipeline[];
}
```

**Errores esperados**:
- `404`: Posición no encontrada.
- `400`: `positionId` no numérico.
- `500`: Error interno del servidor.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/RecruiterDashboard.tsx` (refactor de `.js` a `.tsx` con tipado estricto).
- `frontend/src/components/PositionPipeline.tsx` (nuevo).
- `frontend/src/services/candidateService.ts` (extender con `getCandidatesByPosition`).
- `frontend/src/types/api.ts` (nuevo) o `frontend/src/types/index.ts`.

#### Implementación detallada

```typescript
// frontend/src/services/candidateService.ts
export const getCandidatesByPosition = async (
  positionId: number
): Promise<PositionPipelineResponse> => {
  const response = await axios.get<PositionPipelineResponse>(
    `http://localhost:3010/positions/${positionId}/candidates`
  );
  return response.data;
};
```

```typescript
// frontend/src/components/PositionPipeline.tsx
import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { getCandidatesByPosition } from '../services/candidateService';

interface PositionPipelineProps {
  positionId: number;
}

export const PositionPipeline: React.FC<PositionPipelineProps> = ({ positionId }) => {
  const [pipeline, setPipeline] = useState<PositionPipelineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
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
    };

    fetchPipeline();
  }, [positionId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!pipeline || pipeline.candidates.length === 0) {
    return <Alert variant="info">No hay candidatos en proceso para esta posición.</Alert>;
  }

  return (
    <div>
      <h3>{pipeline.positionTitle}</h3>
      {/* Render pipeline list */}
    </div>
  );
};
```

### Criterios de Aceptación

- [ ] El dashboard muestra una sección de pipeline cuando se selecciona una posición.
- [ ] Se invoca correctamente `GET /positions/:id/candidates`.
- [ ] Se muestran todos los campos requeridos por candidato.
- [ ] Se respeta el orden descendente por `orderIndex`.
- [ ] Se muestra un spinner durante la carga.
- [ ] Se muestra un mensaje vacío cuando no hay candidatos.
- [ ] Se muestra un error claro con opción de reintentar si falla la carga.
- [ ] Se muestra el título y el ID de la posición.

### Tests Requeridos

#### Unit Tests

- Test de renderizado inicial con loading.
- Test de renderizado con lista de candidatos.
- Test de mensaje vacío cuando `candidates` es `[]`.
- Test de mensaje de error cuando la petición falla.
- Test de reintentar al hacer clic en el botón de reintentar.

#### Integration Tests

- Test de flujo completo: seleccionar posición → cargar pipeline → ver candidatos.
- Test de manejo de error 404.
- Test de manejo de error 500.

### Dependencias

- Backend Ticket #001 implementado y disponible.
- Ticket FE-002 (selector de posición) para obtener `positionId`.
- Ticket FE-008 (navegación y layout) para integrar el componente en el dashboard.

### Notas / Riesgos

- El backend no expone aún un endpoint `GET /positions` para listar todas las posiciones. Esto se gestiona en el Ticket FE-002.
- Asegurar que el componente no haga peticiones duplicadas al montarse.
- Considerar memoización con `useMemo` si se aplican filtros adicionales en el futuro.

---

## Ticket FE-002: Selector de Posición en el Dashboard

**Título**: Selector de Posición - Filtrar pipeline por vacante

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-002  
**Backend Ticket relacionado**: Ticket #003 - `GET /positions`  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero seleccionar la posición desde un dropdown en el dashboard, para poder consultar el pipeline de candidatos de cada vacante disponible.

### Requisitos Funcionales

1. **Selector de posiciones**: incluir un dropdown (`Form.Select` de React-Bootstrap) en la parte superior del dashboard de reclutador.
2. **Opciones del selector**: cada opción debe mostrar al menos `positionId` y `positionTitle`.
3. **Selección por defecto**: si existe al menos una posición, seleccionar la primera por defecto al cargar el dashboard.
4. **Actualización automática**: al cambiar la posición seleccionada, se actualiza el componente `PositionPipeline` y se recarga la lista de candidatos.
5. **Estado vacío**: si no hay posiciones disponibles, mostrar un mensaje informativo y deshabilitar el selector.
6. **Persistencia opcional**: reflejar la posición seleccionada en query params (`?positionId=1`) para permitir recargar o compartir el estado (opcional, futuro).

### API Contract / Fuente de Datos

```typescript
interface PositionSummary {
  id: number;
  title: string;
  // Puede extenderse con status, department, etc.
}
```

**Fuente de posiciones**:
- **Backend Ticket #003**: endpoint `GET /positions` que retorna `PositionSummary[]`.
- **Mock temporal (MVP)**: si el Ticket #003 aún no está implementado, se puede usar un mock local de posiciones con un TODO claro para migrar al endpoint real.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/PositionSelector.tsx` (nuevo).
- `frontend/src/components/RecruiterDashboard.tsx` (modificar para incluir selector y estado).
- `frontend/src/services/positionService.ts` (nuevo) con `getPositions`.
- `frontend/src/types/api.ts`.

#### Implementación detallada

```typescript
// frontend/src/components/PositionSelector.tsx
import React from 'react';
import { Form } from 'react-bootstrap';
import { PositionSummary } from '../types/api';

interface PositionSelectorProps {
  positions: PositionSummary[];
  selectedPositionId: number | null;
  onSelectPosition: (positionId: number) => void;
  loading?: boolean;
}

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  positions,
  selectedPositionId,
  onSelectPosition,
  loading = false,
}) => {
  if (loading) return <Form.Select disabled><option>Cargando posiciones...</option></Form.Select>;
  if (positions.length === 0) return <Alert variant="warning">No hay posiciones disponibles.</Alert>;

  return (
    <Form.Select
      value={selectedPositionId ?? ''}
      onChange={(e) => onSelectPosition(Number(e.target.value))}
    >
      {positions.map((pos) => (
        <option key={pos.id} value={pos.id}>
          {pos.title} (ID: {pos.id})
        </option>
      ))}
    </Form.Select>
  );
};
```

### Criterios de Aceptación

- [ ] El dashboard incluye un selector de posiciones visible.
- [ ] El selector muestra todas las posiciones disponibles con `id` y `title`.
- [ ] Se selecciona la primera posición por defecto si existe al menos una.
- [ ] Al cambiar la posición, se actualiza el pipeline de candidatos.
- [ ] Si no hay posiciones, se muestra un mensaje y el selector está deshabilitado.
- [ ] El selector es accesible (labels, ARIA) y responsive.

### Tests Requeridos

#### Unit Tests

- Test de renderizado con lista de posiciones.
- Test de selección por defecto.
- Test de cambio de selección y llamada a `onSelectPosition`.
- Test de estado vacío sin posiciones.
- Test de estado de loading.

#### Integration Tests

- Test de carga de posiciones desde el servicio.
- Test de flujo: cargar posiciones → seleccionar por defecto → mostrar pipeline.

### Dependencias

- Backend Ticket #003 implementado (`GET /positions`).
- Ticket FE-001 (PositionPipeline) para mostrar resultados.
- Ticket FE-008 (layout) para integrar el selector en el dashboard.

### Notas / Riesgos

- Si el Ticket #003 aún no está terminado, se puede desarrollar contra un mock temporal y cambiar la fuente de datos cuando esté listo.
- Asegurar que el contrato de `PositionSummary` coincida con la respuesta del backend Ticket #003.

---

## Ticket FE-003: Tarjeta de Candidato con Detalle del Proceso

**Título**: Tarjeta de Candidato - Visualizar detalle del proceso de selección

**Prioridad**: Media  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-003  
**Backend Ticket relacionado**: Ticket #001  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero ver los detalles clave de cada candidato en una tarjeta o fila, para evaluar rápidamente su estado en el proceso de selección.

### Requisitos Funcionales

1. **Representación visual**: cada candidato se muestra como una fila de tabla (`Table` de React-Bootstrap) o como tarjeta (`Card`).
2. **Campos obligatorios a mostrar**:
   - Nombre completo (`fullName`).
   - Etapa actual (`currentInterviewStep.name`) como `Badge`.
   - Puntuación media (`averageScore`) con 2 decimales; si es `null` o `0`, mostrar "Sin evaluar".
   - Fecha de aplicación (`applicationDate`) formateada a `dd/MM/yyyy HH:mm` (o similar según locale).
   - Progreso de entrevistas como `completadas / total` y opcionalmente una `ProgressBar`.
3. **Estilo de badge por etapa**: asignar variantes de color de Bootstrap según la etapa (por defecto `primary`; futuro: `success` para final, `danger` para rechazado, `warning` para pausa).
4. **Interacción**: al hacer clic en una fila/tarjeta, se debe abrir un panel lateral o navegar a una vista de detalle (implementación futura; en este ticket, preparar el `onClick` y el callback).
5. **Responsive**: la tarjeta/fila debe ser legible en móvil y escritorio. En móvil, preferir tarjeta; en escritorio, tabla.

### API Contract

Utiliza `CandidateInPipeline` definido en Ticket FE-001.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/CandidatePipelineRow.tsx` (nuevo, para vista de tabla).
- `frontend/src/components/CandidatePipelineCard.tsx` (nuevo, para vista móvil/tarjeta).
- `frontend/src/utils/formatScore.ts` (nuevo) para formatear la puntuación.
- `frontend/src/utils/getStepBadgeVariant.ts` (nuevo) para asignar variantes de badge.
- `frontend/src/types/api.ts`.

#### Implementación detallada

```typescript
// frontend/src/components/CandidatePipelineRow.tsx
import React from 'react';
import { Badge, ProgressBar } from 'react-bootstrap';
import { CandidateInPipeline } from '../types/api';
import { formatScore } from '../utils/formatScore';
import { getStepBadgeVariant } from '../utils/getStepBadgeVariant';

interface CandidatePipelineRowProps {
  candidate: CandidateInPipeline;
  onClick?: (candidate: CandidateInPipeline) => void;
}

export const CandidatePipelineRow: React.FC<CandidatePipelineRowProps> = ({
  candidate,
  onClick,
}) => {
  const progress = candidate.totalInterviews === 0
    ? 0
    : (candidate.completedInterviews / candidate.totalInterviews) * 100;

  return (
    <tr onClick={() => onClick?.(candidate)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <td>{candidate.fullName}</td>
      <td>
        <Badge bg={getStepBadgeVariant(candidate.currentInterviewStep.name)}>
          {candidate.currentInterviewStep.name}
        </Badge>
      </td>
      <td>{formatScore(candidate.averageScore)}</td>
      <td>{new Date(candidate.applicationDate).toLocaleString('es-ES')}</td>
      <td>
        {candidate.completedInterviews}/{candidate.totalInterviews}
        <ProgressBar now={progress} label={`${Math.round(progress)}%`} className="mt-1" />
      </td>
    </tr>
  );
};
```

```typescript
// frontend/src/utils/formatScore.ts
export const formatScore = (score: number | null): string => {
  if (score === null || score === 0) return 'Sin evaluar';
  return score.toFixed(2);
};
```

### Criterios de Aceptación

- [ ] Cada candidato se representa con todos los campos requeridos.
- [ ] La etapa actual se muestra como badge.
- [ ] La puntuación media se formatea con 2 decimales o "Sin evaluar".
- [ ] La fecha de aplicación se muestra en formato legible.
- [ ] El progreso de entrevistas se muestra como `completadas / total` y progress bar.
- [ ] El componente es responsive (tarjeta en móvil, tabla en escritorio).
- [ ] El badge tiene variante visual por etapa.

### Tests Requeridos

#### Unit Tests

- Test de renderizado con todos los campos.
- Test de puntuación `null` mostrando "Sin evaluar".
- Test de puntuación con decimales.
- Test de progreso 0/0 y 2/2.
- Test de variante de badge según etapa.
- Test de callback `onClick` al hacer clic.

### Dependencias

- Ticket FE-001 (PositionPipeline) para recibir los datos.
- React-Bootstrap Icons (opcional para iconos en badges futuros).

### Notas / Riesgos

- Si se elige tabla en escritorio, considerar que el `PositionPipeline` debe renderizar la tabla y mapear las filas.
- La decisión de tabla vs tarjeta puede depender del número de columnas; documentar la elección en el PR.

---

## Ticket FE-004: Actualizar Etapa de Candidato desde el Pipeline

**Título**: Actualizar Etapa de Candidato - Control de cambio de stage inline

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-004  
**Backend Ticket relacionado**: Ticket #002 - `PUT /candidates/:id/stage`  
**Estimación**: 8 story points

### User Story

Como reclutador, quiero cambiar la etapa de un candidato directamente desde el pipeline de la posición, para avanzar o retroceder el proceso de selección de forma ágil.

### Requisitos Funcionales

1. **Control de cambio de etapa**: cada fila/tarjeta de candidato debe incluir un dropdown o selector de etapas disponibles.
2. **Etapas disponibles**: el selector debe mostrar las etapas del `InterviewFlow` asociado a la posición actual. Cada opción debe tener `id`, `name` y `orderIndex`.
3. **Petición de actualización**: al seleccionar una nueva etapa, invocar `PUT /candidates/:id/stage` con:
   ```json
   {
     "positionId": 1,
     "newInterviewStepId": 4,
     "notes": "Candidato aprobado para siguiente fase"
   }
   ```
4. **Optimización de UX**: si la etapa seleccionada es igual a la actual, no realizar la petición (no-op).
5. **Deshabilitar durante carga**: el control debe estar deshabilitado mientras se envía la actualización.
6. **Refresco de datos**: tras una actualización exitosa, refrescar el pipeline de la posición para reflejar el nuevo estado.
7. **Feedback**: mostrar mensaje de éxito o error tras la operación.

### API Contract

```typescript
// PUT http://localhost:3010/candidates/{candidateId}/stage
interface UpdateCandidateStageRequest {
  positionId: number;
  newInterviewStepId: number;
  notes?: string;
}

interface UpdateCandidateStageResponse {
  success: boolean;
  applicationId: number;
  previousStep: {
    id: number;
    name: string;
  };
  currentStep: {
    id: number;
    name: string;
  };
  message: string;
}
```

**Errores esperados**:
- `404`: candidato no encontrado o aplicación no encontrada.
- `400`: nuevo step inválido o no pertenece al flow.
- `500`: error interno.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/CandidateStageUpdater.tsx` (nuevo).
- `frontend/src/services/candidateService.ts` (extender con `updateCandidateStage`).
- `frontend/src/types/api.ts`.

#### Fuente de etapas disponibles

- **Backend Ticket #004**: endpoint `GET /positions/:id/interview-steps` que retorna las etapas del flow ordenadas por `orderIndex`.
- **Mock temporal (MVP)**: si el Ticket #004 aún no está implementado, se puede usar un mock local de etapas con un TODO claro para migrar al endpoint real.

#### Implementación detallada

```typescript
// frontend/src/services/candidateService.ts
export const updateCandidateStage = async (
  candidateId: number,
  payload: UpdateCandidateStageRequest
): Promise<UpdateCandidateStageResponse> => {
  const response = await axios.put<UpdateCandidateStageResponse>(
    `http://localhost:3010/candidates/${candidateId}/stage`,
    payload
  );
  return response.data;
};
```

```typescript
// frontend/src/components/CandidateStageUpdater.tsx
interface CandidateStageUpdaterProps {
  candidateId: number;
  positionId: number;
  currentStepId: number;
  availableSteps: InterviewStep[];
  onUpdated: () => void;
  onError: (message: string) => void;
}
```

### Criterios de Aceptación

- [ ] Cada candidato tiene un control para cambiar de etapa.
- [ ] El control muestra las etapas disponibles del flow de la posición.
- [ ] Se invoca `PUT /candidates/:id/stage` al cambiar la etapa.
- [ ] Si la etapa seleccionada es la misma, no se realiza la petición.
- [ ] El control se deshabilita durante la carga.
- [ ] Tras éxito, se refresca el pipeline.
- [ ] Se muestra mensaje de éxito o error.
- [ ] Se soporta el campo `notes` opcional (aunque en este ticket básico puede dejarse para FE-005).

### Tests Requeridos

#### Unit Tests

- Test de renderizado con etapas disponibles.
- Test de no realizar petición si la etapa no cambia.
- Test de llamada a `updateCandidateStage` al cambiar etapa.
- Test de deshabilitado durante loading.
- Test de llamada a `onUpdated` tras éxito.
- Test de llamada a `onError` tras fallo.

#### Integration Tests

- Test de actualización exitosa y refresco del pipeline.
- Test de error 400 por step inválido.
- Test de error 404 por candidato no encontrado.

### Dependencias

- Backend Ticket #002 implementado (`PUT /candidates/:id/stage`).
- Backend Ticket #004 implementado (`GET /positions/:id/interview-steps`).
- Ticket FE-001 (PositionPipeline) para integrar el control.
- Ticket FE-003 (CandidatePipelineRow/Card) para incluir el control en cada candidato.

### Notas / Riesgos

- Si el Ticket #004 aún no está terminado, se puede desarrollar contra un mock temporal y cambiar la fuente de datos cuando esté listo.
- Considerar que el PUT endpoint valida que el step pertenezca al flow; el frontend también puede hacer validación previa básica.

---

## Ticket FE-005: Modal de Confirmación y Notas al Cambiar Etapa

**Título**: Modal de Confirmación - Agregar notas al cambiar etapa de candidato

**Prioridad**: Media  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-005  
**Backend Ticket relacionado**: Ticket #002  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero poder agregar notas opcionales al cambiar la etapa de un candidato y confirmar la acción, para documentar la decisión y evitar cambios accidentales.

### Requisitos Funcionales

1. **Confirmación previa**: al seleccionar una nueva etapa en el control de FE-004, abrir un modal de confirmación antes de enviar la petición.
2. **Visualización de cambio**: el modal debe mostrar claramente la etapa anterior (`previousStep`) y la nueva etapa (`currentStep`).
3. **Campo de notas**: incluir un campo de texto opcional (`Form.Control as="textarea"`) para ingresar notas. Longitud máxima: 500 caracteres (configurable).
4. **Acciones del modal**: botones "Confirmar" y "Cancelar".
5. **Envío con notas**: al confirmar, enviar el request `PUT /candidates/:id/stage` incluyendo el campo `notes` si no está vacío.
6. **Cierre y feedback**: tras éxito, cerrar el modal y mostrar mensaje de éxito. Tras error, mantener el modal abierto y mostrar el error.
7. **Limpieza**: al cerrar el modal (por cancelación o éxito), limpiar el campo de notas.

### API Contract

Utiliza `UpdateCandidateStageRequest` y `UpdateCandidateStageResponse` del Ticket FE-004. El campo `notes` es opcional.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/StageConfirmationModal.tsx` (nuevo).
- `frontend/src/components/CandidateStageUpdater.tsx` (modificar para abrir el modal en lugar de enviar directamente).
- `frontend/src/utils/validation.ts` (opcional, para validar longitud de notas).

#### Implementación detallada

```typescript
// frontend/src/components/StageConfirmationModal.tsx
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { InterviewStep } from '../types/api';

interface StageConfirmationModalProps {
  show: boolean;
  candidateName: string;
  previousStep: InterviewStep | null;
  newStep: InterviewStep | null;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const StageConfirmationModal: React.FC<StageConfirmationModalProps> = ({
  show,
  candidateName,
  previousStep,
  newStep,
  onConfirm,
  onCancel,
  loading = false,
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
    <Modal show={show} onHide={handleCancel} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Cambiar etapa de {candidateName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>De <strong>{previousStep?.name}</strong> a <strong>{newStep?.name}</strong></p>
        <Form.Group>
          <Form.Label>Notas opcionales</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />
          <Form.Text className="text-muted">{notes.length}/500</Form.Text>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>Cancelar</Button>
        <Button variant="primary" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Guardando...' : 'Confirmar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
```

### Criterios de Aceptación

- [ ] Al seleccionar una nueva etapa, se abre un modal de confirmación.
- [ ] El modal muestra la etapa anterior y la nueva.
- [ ] El modal incluye un campo de notas opcional con contador de caracteres.
- [ ] El usuario puede confirmar o cancelar.
- [ ] Al confirmar, se envía el request con `notes` si aplica.
- [ ] Al cancelar, se cierra el modal y se limpian las notas.
- [ ] En caso de error, el modal permanece abierto y muestra el mensaje de error.
- [ ] Tras éxito, el modal se cierra y se refresca el pipeline.

### Tests Requeridos

#### Unit Tests

- Test de apertura del modal al seleccionar nueva etapa.
- Test de envío con notas vacías.
- Test de envío con notas incluidas.
- Test de cancelación y limpieza de notas.
- Test de contador de caracteres máximo.
- Test de deshabilitado de botones durante loading.

### Dependencias

- Ticket FE-004 (CandidateStageUpdater) para disparar el modal.
- Backend Ticket #002 con soporte para `notes`.

### Notas / Riesgos

- Considerar que el backend no requiere `notes` pero debe aceptarla. Validar el contrato en el backend.
- Asegurar que el modal no se cierre accidentalmente si el usuario hace clic fuera durante una operación en curso (`backdrop="static"`).

---

## Ticket FE-006: Estados Especiales de Candidato

**Título**: Estados Especiales - Visualizar y gestionar Hired, Rejected y On Hold

**Prioridad**: Media  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-006  
**Backend Ticket relacionado**: Ticket #002  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero marcar visualmente cuando un candidato ha sido contratado, rechazado o puesto en pausa, para tener claridad sobre el estado final del proceso.

### Requisitos Funcionales

1. **Identificación de etapas finales**: definir una lista de nombres de etapas que se consideran finales: `Hired`, `Rejected`, `On Hold` (case-insensitive, configurable).
2. **Estilos distintivos**:
   - `Hired`: badge `success` + icono de check (✓).
   - `Rejected`: badge `danger` + icono de X.
   - `On Hold`: badge `warning` + icono de pausa.
3. **Visibilidad en pipeline**: un candidato en estado final sigue apareciendo en el pipeline pero resaltado visualmente (fila con fondo gris claro, badge distintivo).
4. **Permitir selección**: el control de cambio de etapa permite seleccionar estos estados si pertenecen al `InterviewFlow` de la posición.
5. **Confirmación adicional**: antes de mover a un estado final, mostrar una advertencia adicional en el modal de confirmación (FE-005) indicando que es una acción final.
6. **Ordenamiento**: los candidatos en estados finales pueden agruparse al final del pipeline o mantener el orden por `orderIndex` (decisión de UX; documentar).

### API Contract

No requiere endpoints nuevos. Utiliza los contratos de FE-001 y FE-004.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/utils/getStepBadgeVariant.ts` (actualizar para soportar estados finales).
- `frontend/src/utils/isFinalStep.ts` (nuevo).
- `frontend/src/components/StageConfirmationModal.tsx` (actualizar para advertencia de estado final).
- `frontend/src/components/CandidatePipelineRow.tsx` (actualizar estilos para estados finales).
- `frontend/src/types/api.ts` (agregar enum o tipo literal para estados finales).

#### Implementación detallada

```typescript
// frontend/src/utils/isFinalStep.ts
export type FinalStepType = 'Hired' | 'Rejected' | 'OnHold';

export const FINAL_STEP_NAMES: string[] = ['Hired', 'Rejected', 'On Hold'];

export const isFinalStep = (stepName: string): boolean => {
  return FINAL_STEP_NAMES.includes(stepName.trim());
};
```

```typescript
// frontend/src/utils/getStepBadgeVariant.ts
export const getStepBadgeVariant = (stepName: string): string => {
  const normalized = stepName.trim().toLowerCase();
  if (normalized === 'hired') return 'success';
  if (normalized === 'rejected') return 'danger';
  if (normalized === 'on hold') return 'warning';
  return 'primary';
};
```

### Criterios de Aceptación

- [ ] Las etapas finales se identifican correctamente.
- [ ] Cada estado final tiene un estilo distintivo (badge + icono + fondo de fila).
- [ ] Los candidatos en estado final permanecen visibles en el pipeline.
- [ ] El selector de etapas permite elegir estados finales si están en el flow.
- [ ] Se muestra confirmación adicional antes de mover a un estado final.
- [ ] Los estilos son consistentes en modo claro y responsive.

### Tests Requeridos

#### Unit Tests

- Test de `isFinalStep` para cada estado final y no final.
- Test de `getStepBadgeVariant` para cada estado.
- Test de renderizado de fila con estado final (fondo y badge).
- Test de confirmación adicional en modal para estado final.
- Test de no mostrar advertencia para estados no finales.

### Dependencias

- Ticket FE-003 (CandidatePipelineRow/Card) para aplicar estilos.
- Ticket FE-004 (CandidateStageUpdater) para permitir seleccionar estados finales.
- Ticket FE-005 (StageConfirmationModal) para mostrar advertencia adicional.
- React-Bootstrap Icons para iconos.

### Notas / Riesgos

- Los nombres de estados finales deben coincidir con los configurados en el backend. Mantener una lista centralizada en el frontend para facilitar cambios.
- Si en el futuro se agregan más estados finales (por ejemplo, `Withdrawn`), solo se debe actualizar la lista centralizada.

---

## Ticket FE-007: Manejo de Errores y Feedback al Usuario

**Título**: Manejo de Errores y Feedback - Alerts, Toasts y estados de loading

**Prioridad**: Media  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-007  
**Backend Ticket relacionado**: Ticket #001 y Ticket #002  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero recibir mensajes claros cuando una acción falla, para entender qué ocurrió y poder reintentar.

### Requisitos Funcionales

1. **Errores de carga de pipeline**: si `GET /positions/:id/candidates` falla, mostrar un `Alert` de error con:
   - Mensaje claro en español.
   - Código/nombre del error si está disponible.
   - Botón "Reintentar" que vuelva a invocar la petición.
2. **Errores de actualización de etapa**: si `PUT /candidates/:id/stage` falla, mostrar el error en el modal (FE-005) sin cerrarlo de forma abrupta, y un botón para reintentar o cerrar.
3. **Mapeo de errores HTTP**:
   - `400`: "Datos inválidos. Verifica la etapa seleccionada."
   - `404`: "Candidato o posición no encontrados."
   - `500`: "Error interno del servidor. Inténtalo más tarde."
   - Errores de red: "No se pudo conectar con el servidor. Verifica tu conexión."
4. **Mensajes de éxito**: mostrar `Toast` o `Alert` temporal tras actualizar etapa exitosamente (por ejemplo, "Etapa actualizada correctamente").
5. **Estados de loading**: todos los botones y selectores deben indicar visualmente cuando están procesando (spinner, texto "Guardando...", `disabled`).
6. **Limpieza de mensajes**: los mensajes de éxito deben desaparecer automáticamente después de 5 segundos (configurable). Los errores persisten hasta que el usuario cierre o reintente.

### API Contract

No aplica. Este ticket es transversal. Depende de los errores retornados por los endpoints de FE-001 y FE-004.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/utils/errorHandler.ts` (nuevo) para mapear errores de Axios a mensajes amigables.
- `frontend/src/components/ToastNotification.tsx` o `AlertNotification.tsx` (nuevo).
- `frontend/src/components/PositionPipeline.tsx` (actualizar para usar errorHandler).
- `frontend/src/components/StageConfirmationModal.tsx` (actualizar para mostrar errores).
- `frontend/src/hooks/useToast.ts` (opcional, custom hook para manejar toasts).

#### Implementación detallada

```typescript
// frontend/src/utils/errorHandler.ts
import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Verifica tu conexión.';
    const status = error.response.status;
    const backendMessage = error.response.data?.message || '';
    if (status === 400) return `Datos inválidos: ${backendMessage}`;
    if (status === 404) return 'Candidato o posición no encontrados.';
    if (status === 500) return 'Error interno del servidor. Inténtalo más tarde.';
    return `Error inesperado (${status}): ${backendMessage}`;
  }
  return 'Ocurrió un error inesperado.';
};
```

### Criterios de Aceptación

- [ ] Si falla el listado, se muestra alert de error con botón de reintentar.
- [ ] Si falla la actualización de etapa, se muestra el error dentro del modal sin cerrarlo.
- [ ] Los errores de validación (400, 404, 422) se traducen a mensajes en español.
- [ ] Se muestra mensaje de éxito temporal tras actualizar etapa.
- [ ] Los botones y selectores indican estado de loading.
- [ ] Los mensajes de éxito se autodescartan después de 5 segundos.

### Tests Requeridos

#### Unit Tests

- Test de `getErrorMessage` para cada tipo de error (red, 400, 404, 500, error genérico).
- Test de renderizado de alerta de error con botón de reintentar.
- Test de desaparición automática de mensaje de éxito.
- Test de estado `disabled` de botones durante loading.

#### Integration Tests

- Test de flujo: error en carga → reintentar → éxito.
- Test de flujo: error en actualización → cerrar modal → reintentar.

### Dependencias

- Ticket FE-001 (pipeline) para errores de listado.
- Ticket FE-004 (actualización) y FE-005 (modal) para errores de actualización.
- Axios para manejo de errores.

### Notas / Riesgos

- Evitar duplicar mensajes de error en múltiples componentes. Considerar un contexto global de notificaciones si la aplicación crece.
- Si el backend cambia el formato de mensajes de error, solo se debe actualizar `errorHandler.ts`.

---

## Ticket FE-008: Navegación y Layout del Dashboard de Reclutador

**Título**: Navegación y Layout - Integrar dashboard con pipeline y acciones

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**User Story relacionada**: US-FE-008  
**Backend Ticket relacionado**: Ticket #001 y Ticket #002  
**Estimación**: 5 story points

### User Story

Como reclutador, quiero que el dashboard de reclutador centralice las acciones de agregar candidato y gestionar el pipeline, para no tener que navegar entre múltiples pantallas.

### Requisitos Funcionales

1. **Layout del dashboard**: el `RecruiterDashboard` debe mostrar en una sola vista:
   - Logo y título actuales.
   - Botón/link para "Añadir Candidato" (existente, ruta `/add-candidate`).
   - Selector de posición (FE-002).
   - Pipeline de candidatos para la posición seleccionada (FE-001).
2. **Estructura visual**: usar `Container`, `Row`, `Col` y `Card` de React-Bootstrap para organizar las secciones.
3. **Responsive**: en móvil, las secciones se apilan verticalmente; en escritorio, el selector y pipeline ocupan el ancho completo o se distribuyen en columnas según diseño.
4. **Navegación con React Router**: mantener las rutas existentes:
   - `/` → `RecruiterDashboard`.
   - `/add-candidate` → `AddCandidateForm`.
5. **Refactor a TypeScript**: convertir `RecruiterDashboard.js` a `RecruiterDashboard.tsx` con tipado estricto, aprovechando la configuración TypeScript del proyecto.
6. **Mantenimiento de estilo**: conservar y extender los estilos actuales (`App.css`, `index.css`) sin romper el diseño existente.
7. **Estado global local**: gestionar en `RecruiterDashboard` el estado de `selectedPositionId` y pasarlo a `PositionSelector` y `PositionPipeline`.

### Especificación Técnica

#### Archivos a crear/modificar

- `frontend/src/components/RecruiterDashboard.tsx` (refactor completo de `.js` a `.tsx`).
- `frontend/src/components/RecruiterDashboard.js` (eliminar tras migrar).
- `frontend/src/App.js` o `App.tsx` (actualizar import si se migra el dashboard a `.tsx`).
- `frontend/src/App.css` (actualizar si es necesario para nuevas secciones).

#### Implementación detallada

```typescript
// frontend/src/components/RecruiterDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PositionSelector } from './PositionSelector';
import { PositionPipeline } from './PositionPipeline';
import { getPositions } from '../services/positionService';
import { PositionSummary } from '../types/api';
import logo from '../assets/lti-logo.png';

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
            {selectedPositionId && <PositionPipeline positionId={selectedPositionId} />}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecruiterDashboard;
```

### Criterios de Aceptación

- [ ] El dashboard muestra el logo, título, botón de añadir candidato, selector de posición y pipeline.
- [ ] El layout es responsive.
- [ ] La navegación a `/add-candidate` funciona correctamente.
- [ ] El dashboard se refactoriza a TypeScript (`RecruiterDashboard.tsx`).
- [ ] El archivo `RecruiterDashboard.js` se elimina tras la migración.
- [ ] El estado de `selectedPositionId` se gestiona en el dashboard y se propaga a los componentes hijos.
- [ ] No se rompen los estilos ni la navegación existentes.

### Tests Requeridos

#### Unit Tests

- Test de renderizado del dashboard completo.
- Test de selección de primera posición por defecto.
- Test de navegación a `/add-candidate`.
- Test de renderizado responsive (smoke test).
- Test de refactor a TypeScript: verificar que el componente compila sin errores.

#### Integration Tests

- Test de flujo completo: cargar dashboard → cargar posiciones → seleccionar posición → cargar pipeline.

### Dependencias

- Ticket FE-001 (PositionPipeline).
- Ticket FE-002 (PositionSelector).
- Ticket FE-003, FE-004, FE-005, FE-006, FE-007 para los componentes internos del pipeline.

### Notas / Riesgos

- Esta es la **capa de integración** de todos los componentes; debe realizarse tras tener los componentes base disponibles, aunque se puede empezar con placeholders.
- Si se migra a TypeScript, asegurar que `tsconfig.json` y `package.json` soportan la importación de imágenes (`*.png`).
- Considerar la eliminación segura del archivo `.js` para no romper imports durante la migración.

---

## Dependencias entre Tickets Frontend

```
FE-008 (Dashboard Layout)
 ├── FE-001 (PositionPipeline)
 │    ├── FE-002 (PositionSelector)  ← requiere Backend Ticket #003
 │    ├── FE-003 (CandidateCard/Row)
 │    ├── FE-004 (StageUpdater)      ← requiere Backend Ticket #002 + #004
 │    │    ├── FE-005 (ConfirmationModal)
 │    │    └── FE-006 (FinalStates)
 │    └── FE-007 (ErrorHandling)
```

## Gaps Técnicos Identificados (ahora cubiertos por tickets backend)

1. **GET /positions** → **Backend Ticket #003** creado. Es necesario para el selector de posiciones (FE-002). Implementación real o mock temporal durante el desarrollo.
2. **GET /positions/:id/interview-steps** → **Backend Ticket #004** creado. Es necesario para el `CandidateStageUpdater` (FE-004). Implementación real o mock temporal durante el desarrollo.
3. **Contrato de errores backend**: se asume que el backend retorna `{ message: string }` en errores. Validar contra la implementación real.

## Consideraciones Generales de Implementación

- **TypeScript**: aprovechar la configuración existente y migrar progresivamente los componentes a `.tsx`. Definir interfaces en `frontend/src/types/api.ts`.
- **Axios**: el proyecto usa `fetch` en `AddCandidateForm.js` y `axios` en `candidateService.js`. Estandarizar en `axios` para los nuevos servicios (FE-001 y siguientes) y considerar un refactor futuro de `AddCandidateForm` a `axios`.
- **Estilos**: mantener consistencia con Bootstrap 5 y React-Bootstrap. Usar `className="shadow"`, `className="mt-5"`, etc., como en el código existente.
- **Tests**: usar `@testing-library/react` y `@testing-library/jest-dom` ya incluidos en `package.json`. Ejecutar con `npm test`.
- **Entorno**: backend en `http://localhost:3010`, frontend en `http://localhost:3000`. Considerar variables de entorno para la URL del backend en el futuro.

## Criterios de Salida del Sprint

- [ ] Todos los tickets FE-001 a FE-008 implementados y probados individualmente.
- [ ] Flujo completo validado: seleccionar posición → ver pipeline → cambiar etapa → ver feedback.
- [ ] Tests unitarios ejecutándose con `npm test` sin errores.
- [ ] Código compilado exitosamente con `npm run build`.
- [ ] Revisión de código completada y aprobada.
