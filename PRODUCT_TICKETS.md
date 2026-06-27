# Product Tickets - LTI Talent Tracking System

## Ticket #001: Obtener Candidatos por Posición

**Título**: GET /positions/:id/candidates - Listar candidatos en proceso para una posición

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**Product Owner**: Especificado por usuario  
**Fecha**: 2026-06-26

### User Story
Como reclutador, quiero ver todos los candidatos que están en proceso de selección para una posición específica, para poder gestionar adecuadamente el pipeline de reclutamiento.

### Requisitos Funcionales

#### Endpoint: `GET /positions/:id/candidates`

**Parámetros:**
- `id` (path): ID de la posición (Position)

**Response esperado:**
```json
{
  "positionId": 1,
  "positionTitle": "Senior Developer",
  "candidates": [
    {
      "applicationId": 1,
      "candidateId": 1,
      "fullName": "Juan Pérez García",
      "currentInterviewStep": {
        "id": 3,
        "name": "Entrevista Técnica",
        "orderIndex": 3
      },
      "averageScore": 8.5,
      "applicationDate": "2024-01-15T10:30:00Z",
      "totalInterviews": 2,
      "completedInterviews": 2
    }
  ]
}
```

**Campos requeridos:**
1. **fullName**: Nombre completo del candidato (concatenación de firstName + lastName de tabla `candidate`)
2. **currentInterviewStep**: Fase actual del proceso (de tabla `application` → `interviewStep`)
3. **averageScore**: Puntuación media del candidato (promedio de scores de tabla `interview`)

### Lógica de Negocio

#### Cálculo de Puntuación Media:
- Sumar todos los `score` de las entrevistas (`interview`) realizadas por el candidato
- Dividir por el número total de entrevistas con score ≠ null
- Redondear a 2 decimales
- Si no hay entrevistas con score, retornar null o 0

#### Filtros Aplicados:
- Solo aplicaciones con `status` = "active" (si existe este campo)
- Incluir candidatos en cualquier fase del proceso
- Ordenar por `currentInterviewStep.orderIndex` descendente (más avanzado primero)

### Especificación Técnica

#### Query Prisma Esperada:
```typescript
const applications = await prisma.application.findMany({
  where: { positionId: parseInt(id) },
  include: {
    candidate: true,
    interviewStep: true,
    interviews: {
      where: { score: { not: null } }
    }
  }
});
```

#### Controller Implementation:
```typescript
// backend/src/presentation/controllers/positionController.ts
export const getCandidatesByPosition = async (req: Request, res: Response) => {
  // Implementation here
};
```

#### Route Definition:
```typescript
// backend/src/routes/positionRoutes.ts
router.get('/:id/candidates', getCandidatesByPosition);
```

### Criterios de Aceptación

- [ ] El endpoint retorna todos los candidatos aplicados a la posición
- [ ] Incluir nombre completo del candidato
- [ ] Mostrar fase actual del proceso de entrevista
- [ ] Calcular y retornar puntuación media correctamente
- [ ] Manejar caso de posición no encontrada (404)
- [ ] Manejar caso de sin candidatos (array vacío)
- [ ] Validar que positionId sea numérico
- [ ] Incluir metadata de cantidad de entrevistas

### Tests Requeridos

#### Unit Tests:
- Test cálculo de puntuación media con diferentes escenarios
- Test manejo de candidatos sin entrevistas
- Test validación de positionId

#### Integration Tests:
- Test endpoint completo con datos de prueba
- Test respuesta para posición inexistente
- Test estructura del JSON response

---

## Ticket #002: Actualizar Etapa de Candidato

**Título**: PUT /candidates/:id/stage - Actualizar fase del proceso de entrevista

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**Product Owner**: Especificado por usuario  
**Fecha**: 2026-06-26

### User Story
Como reclutador, quiero poder avanzar o retroceder un candidato a diferentes etapas del proceso de selección, para gestionar el flujo de entrevistas de manera eficiente.

### Requisitos Funcionales

#### Endpoint: `PUT /candidates/:id/stage`

**Parámetros:**
- `id` (path): ID del candidato (Candidate)

**Body Request:**
```json
{
  "positionId": 1,
  "newInterviewStepId": 4,
  "notes": "Candidato aprobado para siguiente fase"
}
```

**Response esperado:**
```json
{
  "success": true,
  "applicationId": 1,
  "previousStep": {
    "id": 3,
    "name": "Entrevista Técnica"
  },
  "currentStep": {
    "id": 4,
    "name": "Entrevista Final"
  },
  "message": "Etapa actualizada exitosamente"
}
```

### Lógica de Negocio

#### Validaciones:
1. **Existencia de candidato**: Verificar que el candidato existe
2. **Aplicación activa**: Verificar que el candidato tiene aplicación activa para la posición
3. **Flow validation**: El nuevo step debe pertenecer al mismo interview flow que la posición
4. **Permisos**: Validar que el usuario tiene permisos para modificar (futuro)

#### Proceso de Actualización:
1. Buscar aplicación del candidato para la posición especificada
2. Validar que el nuevo interview step exista y pertenezca al flow correcto
3. Actualizar campo `currentInterviewStep` en tabla `application`
4. Opcional: Crear registro en tabla de auditoría (futuro)
5. Retornar información actualizada

### Especificación Técnica

#### Controller Implementation:
```typescript
// backend/src/presentation/controllers/candidateController.ts
export const updateCandidateStage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { positionId, newInterviewStepId, notes } = req.body;
  
  // Validation logic here
  // Update application.currentInterviewStep
  // Return updated state
};
```

#### Route Definition:
```typescript
// backend/src/routes/candidateRoutes.ts
router.put('/:id/stage', updateCandidateStage);
```

#### Validaciones de Input:
```typescript
const schema = {
  positionId: 'number|required',
  newInterviewStepId: 'number|required',
  notes: 'string|optional'
};
```

### Criterios de Aceptación

- [ ] Actualizar correctamente la etapa del candidato
- [ ] Validar que candidato existe
- [ ] Validar que aplicación existe para la posición
- [ ] Validar que nuevo step pertenece al flow correcto
- [ ] Manejar caso de candidato no encontrado (404)
- [ ] Manejar caso de aplicación no encontrada (404)
- [ ] Manejar caso de step inválido (400)
- [ ] Incluir información anterior y actual en response
- [ ] Soportar notas opcionales

### Casos de Uso Adicionales

#### Movimiento Hacia Atrás:
- Permitir retroceder a pasos anteriores del proceso
- Mantener historial de cambios (futuro)

#### Finalización de Proceso:
- Step especial "Rejected" para rechazados
- Step especial "Hired" para contratados
- Step especial "On Hold" para pausados

### Tests Requeridos

#### Unit Tests:
- Test validación de candidateId
- Test validación de positionId
- Test validación de interviewStepId
- Test lógica de actualización

#### Integration Tests:
- Test actualización exitosa
- Test candidato inexistente
- Test step inválido
- test step de diferente flow

#### Edge Cases:
- Test actualización al mismo step (no-op)
- Test con candidateId inválido
- Test con campos faltantes en body

---

## Ticket #003: Listar Posiciones Activas

**Título**: `GET /positions` - Listar posiciones activas del sistema

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**Product Owner**: Especificado por usuario  
**Fecha**: 2026-06-27

### User Story

Como reclutador, quiero ver un listado de todas las posiciones activas disponibles, para poder seleccionar una y consultar su pipeline de candidatos desde el frontend.

### Requisitos Funcionales

#### Endpoint: `GET /positions`

**Response esperado:**
```json
[
  {
    "id": 1,
    "title": "Senior Developer",
    "description": "Desarrollador senior para equipo backend",
    "status": "Open",
    "location": "Remoto",
    "employmentType": "Full-time",
    "salaryMin": 50000,
    "salaryMax": 70000
  },
  {
    "id": 2,
    "title": "Product Manager",
    "description": "Product Manager para nueva línea de negocio",
    "status": "Open",
    "location": "Madrid",
    "employmentType": "Full-time",
    "salaryMin": 60000,
    "salaryMax": 80000
  }
]
```

**Campos requeridos:**
1. **id**: Identificador único de la posición.
2. **title**: Título de la posición.
3. **description**: Descripción breve de la posición.
4. **status**: Estado actual de la posición (por ejemplo, `Open`, `Closed`, `Draft`).
5. **location**: Ubicación de la posición.
6. **employmentType**: Tipo de empleo (Full-time, Part-time, etc.).
7. **salaryMin**: Salario mínimo (opcional).
8. **salaryMax**: Salario máximo (opcional).

**Filtros aplicados:**
- Solo retornar posiciones con `status` = `Open` o `Active` (según modelo de datos; si el campo no existe, retornar todas).
- Si el modelo incluye `isVisible`, filtrar solo posiciones visibles (`isVisible = true`).
- Ordenar por `title` ascendente o por `id` ascendente.

### Lógica de Negocio

1. Consultar la tabla `Position` usando Prisma.
2. Aplicar filtros de estado y visibilidad si corresponden.
3. Mapear la respuesta a un DTO que no exponga información interna innecesaria.
4. Si no hay posiciones, retornar un array vacío `[]` con status 200.

### Especificación Técnica

#### Query Prisma Esperada:
```typescript
const positions = await prisma.position.findMany({
  where: {
    status: 'Open',
    isVisible: true
  },
  orderBy: {
    title: 'asc'
  },
  select: {
    id: true,
    title: true,
    description: true,
    status: true,
    location: true,
    employmentType: true,
    salaryMin: true,
    salaryMax: true
  }
});
```

#### Archivos a modificar/crear:
- `backend/src/application/services/positionService.ts`: agregar `getPositions`.
- `backend/src/presentation/controllers/positionController.ts`: agregar `getPositionsController`.
- `backend/src/routes/positionRoutes.ts`: agregar `router.get('/', getPositionsController)`.
- `backend/src/tests/positionController.test.ts`: agregar tests para el nuevo endpoint.
- `backend/api-spec.yaml`: documentar el nuevo endpoint.

#### Controller Implementation:
```typescript
// backend/src/presentation/controllers/positionController.ts
export const getPositionsController = async (req: Request, res: Response) => {
  try {
    const positions = await getPositions();
    res.json(positions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
```

#### Route Definition:
```typescript
// backend/src/routes/positionRoutes.ts
router.get('/', getPositionsController);
```

### Criterios de Aceptación

- [ ] El endpoint retorna un array de posiciones activas.
- [ ] Incluir `id`, `title`, `description`, `status`, `location`, `employmentType`, `salaryMin`, `salaryMax`.
- [ ] Aplicar filtros de estado y visibilidad si existen en el modelo.
- [ ] Manejar caso de no hay posiciones (array vacío con 200).
- [ ] Manejar errores internos con status 500.
- [ ] Documentar el endpoint en `api-spec.yaml`.
- [ ] La respuesta no exponga datos internos innecesarios.

### Tests Requeridos

#### Unit Tests:
- Test de filtrado por estado `Open`/`Active`.
- Test de filtrado por `isVisible` si aplica.
- Test de ordenamiento.
- Test de array vacío.
- Test de error interno (500).

#### Integration Tests:
- Test endpoint completo con datos de prueba.
- Test respuesta con posiciones filtradas.
- Test estructura del JSON response.

### Dependencias

- Modelo de datos `Position` ya definido en `schema.prisma`.
- No depende de otros tickets backend; puede implementarse en paralelo.
- Es requisito previo para el frontend Ticket FE-002 (Selector de Posición).

---

## Ticket #004: Listar Etapas del Flujo de Entrevistas de una Posición

**Título**: `GET /positions/:id/interview-steps` - Listar etapas del proceso de selección de una posición

**Prioridad**: Alta  
**Sprint**: Sprint 2  
**Product Owner**: Especificado por usuario  
**Fecha**: 2026-06-27

### User Story

Como reclutador, quiero ver las etapas disponibles del proceso de selección de una posición, para poder cambiar a un candidato a la etapa correcta desde el frontend.

### Requisitos Funcionales

#### Endpoint: `GET /positions/:id/interview-steps`

**Parámetros:**
- `id` (path): ID de la posición (`Position`).

**Response esperado:**
```json
{
  "positionId": 1,
  "positionTitle": "Senior Developer",
  "interviewFlowId": 2,
  "steps": [
    {
      "id": 1,
      "name": "Screening Inicial",
      "orderIndex": 1,
      "interviewType": "Phone Interview"
    },
    {
      "id": 2,
      "name": "Entrevista Técnica",
      "orderIndex": 2,
      "interviewType": "Technical Interview"
    },
    {
      "id": 3,
      "name": "Entrevista Final",
      "orderIndex": 3,
      "interviewType": "Final Interview"
    }
  ]
}
```

**Campos requeridos:**
1. **positionId**: ID de la posición consultada.
2. **positionTitle**: Título de la posición.
3. **interviewFlowId**: ID del flujo de entrevistas asociado.
4. **steps**: Array de etapas ordenadas por `orderIndex` ascendente.
   - **id**: ID de la etapa (`InterviewStep`).
   - **name**: Nombre de la etapa.
   - **orderIndex**: Orden de la etapa dentro del flujo.
   - **interviewType**: Nombre del tipo de entrevista asociado.

### Lógica de Negocio

1. Validar que `positionId` sea numérico.
2. Buscar la posición en la tabla `Position`. Si no existe, retornar 404.
3. Obtener el `interviewFlowId` de la posición.
4. Buscar las etapas (`InterviewStep`) asociadas a ese `InterviewFlow`, incluyendo el `InterviewType`.
5. Ordenar las etapas por `orderIndex` ascendente.
6. Retornar la estructura con `positionId`, `positionTitle`, `interviewFlowId` y `steps`.

### Especificación Técnica

#### Query Prisma Esperada:
```typescript
const position = await prisma.position.findUnique({
  where: { id: parseInt(id) },
  include: {
    interviewFlow: {
      include: {
        interviewSteps: {
          include: {
            interviewType: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    }
  }
});
```

#### Archivos a modificar/crear:
- `backend/src/application/services/positionService.ts`: agregar `getInterviewStepsByPosition`.
- `backend/src/presentation/controllers/positionController.ts`: agregar `getInterviewStepsByPositionController`.
- `backend/src/routes/positionRoutes.ts`: agregar `router.get('/:id/interview-steps', getInterviewStepsByPositionController)`.
- `backend/src/tests/positionController.test.ts`: agregar tests para el nuevo endpoint.
- `backend/api-spec.yaml`: documentar el nuevo endpoint.

#### Controller Implementation:
```typescript
// backend/src/presentation/controllers/positionController.ts
export const getInterviewStepsByPositionController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid position ID format' });
    }

    const result = await getInterviewStepsByPosition(id);
    res.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Position not found') {
        return res.status(404).json({ error: 'Position not found' });
      }
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
```

#### Route Definition:
```typescript
// backend/src/routes/positionRoutes.ts
router.get('/:id/interview-steps', getInterviewStepsByPositionController);
```

### Criterios de Aceptación

- [ ] El endpoint retorna las etapas del flujo de entrevistas asociado a la posición.
- [ ] Incluir `positionId`, `positionTitle`, `interviewFlowId` y array `steps` ordenado.
- [ ] Cada etapa incluye `id`, `name`, `orderIndex` e `interviewType`.
- [ ] Manejar caso de posición no encontrada (404).
- [ ] Manejar caso de `positionId` no numérico (400).
- [ ] Manejar errores internos con status 500.
- [ ] Documentar el endpoint en `api-spec.yaml`.
- [ ] Las etapas se ordenan por `orderIndex` ascendente.

### Tests Requeridos

#### Unit Tests:
- Test de validación de `positionId` numérico.
- Test de posición no encontrada (404).
- Test de ordenamiento por `orderIndex`.
- Test de inclusión de `interviewType` en cada etapa.
- Test de posición sin etapas (array vacío).
- Test de error interno (500).

#### Integration Tests:
- Test endpoint completo con datos de prueba.
- Test respuesta para posición inexistente.
- Test estructura del JSON response.
- Test de orden correcto de las etapas.

### Dependencias

- Modelo de datos `Position`, `InterviewFlow`, `InterviewStep` e `InterviewType` definidos en `schema.prisma`.
- Relación `Position.interviewFlow` y `InterviewFlow.interviewSteps` ya existente en el schema.
- No depende de otros tickets backend; puede implementarse en paralelo.
- Es requisito previo para el frontend Ticket FE-004 (Actualizar Etapa de Candidato).

### Casos de Uso Adicionales

- El endpoint puede ser reutilizado por cualquier otro módulo que necesite conocer el flujo de entrevistas de una posición.
- Facilita la validación en el frontend antes de enviar una actualización de etapa (PUT /candidates/:id/stage).

---

## Notas de Implementación

### Dependencias entre Tickets:
- El Ticket #002 depende del modelo de datos del Ticket #001.
- Ambos tickets comparten lógica de validación de applications.
- El Ticket #003 (`GET /positions`) y el Ticket #004 (`GET /positions/:id/interview-steps`) son independientes entre sí, pero ambos son requisitos previos para los tickets frontend FE-002 y FE-004 respectivamente.
- El frontend Ticket FE-002 (Selector de Posición) depende del backend Ticket #003.
- El frontend Ticket FE-004 (Actualizar Etapa de Candidato) depende del backend Ticket #004.
- El frontend Ticket FE-008 (Dashboard de Reclutador) es la capa de integración y depende de FE-001, FE-002, FE-003, FE-004, FE-005, FE-006 y FE-007.

### Consideraciones de Seguridad:
- Implementar validación de permisos (futuro)
- Logging de cambios de etapa (auditoría)
- Rate limiting para prevención de abusos

### Performance:
- Considerar índices en los campos utilizados frecuentemente (por ejemplo, `Position.status`, `Position.interviewFlowId`, `InterviewStep.interviewFlowId`)
- Paginación para listados grandes (futuro); especialmente relevante para `GET /positions` si el número de posiciones crece
- Caching para consultas repetitivas (por ejemplo, flujos de entrevistas que no cambian frecuentemente)

### Próximos Pasos:
- Implementar los tickets backend #003 y #004 para desbloquear la funcionalidad frontend completa.
- Implementar frontend para consumir todos los endpoints (tickets FE-001 a FE-008).
- Crear dashboard de gestión de candidatos.
- Implementar notificaciones automáticas de cambios de etapa.
- Actualizar `api-spec.yaml` con los nuevos endpoints de los tickets #003 y #004.
