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

## Notas de Implementación

### Dependencias entre Tickets:
- El Ticket #002 depende del modelo de datos del Ticket #001
- Ambos tickets comparten lógica de validación de applications

### Consideraciones de Seguridad:
- Implementar validación de permisos (futuro)
- Logging de cambios de etapa (auditoría)
- Rate limiting para prevención de abusos

### Performance:
- Considerar índices en los campos utilizados frecuentemente
- Paginación para listados grandes (futuro)
- Caching para consultas repetitivas

### Próximos Pasos:
- Implementar frontend para consumir estos endpoints
- Crear dashboard de gestión de candidatos
- Implementar notificaciones automáticas de cambios de etapa
