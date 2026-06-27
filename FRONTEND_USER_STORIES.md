# User Stories - Frontend LTI Talent Tracking System

> Rol: Senior Front-end TypeScript Developer & Product Owner
> Basado en los tickets de trabajo definidos en `PRODUCT_TICKETS.md`

---

## US-FE-001: Dashboard de Pipeline por Posición

**User Story:**
Como reclutador, quiero visualizar en el dashboard una lista de todos los candidatos que están en proceso para una posición específica, para gestionar el pipeline de reclutamiento sin salir del panel principal.

**Ticket relacionado:** Ticket #001 - `GET /positions/:id/candidates`

### Criterios de Aceptación

- [ ] El dashboard del reclutador debe mostrar una sección de posiciones activas con selector de posición.
- [ ] Al seleccionar una posición, se realiza una petición `GET /positions/:id/candidates`.
- [ ] Se muestra una tabla/tarjetas con los siguientes campos por candidato: nombre completo, etapa actual, puntuación media, fecha de aplicación, número de entrevistas completadas/total.
- [ ] Los candidatos se ordenan visualmente de mayor a menor avance en el proceso (`currentInterviewStep.orderIndex`).
- [ ] Se maneja el estado de carga (`loading`) con spinner o skeleton mientras se obtienen los datos.
- [ ] Si no hay candidatos para la posición, se muestra un mensaje informativo vacío.
- [ ] Si ocurre un error (404, 500, red), se muestra un mensaje de error claro al usuario.

### Consideraciones Técnicas

- Usar React con TypeScript y componentes funcionales (`React.FC`).
- Definir interfaces para `Position`, `CandidateStage`, `PositionCandidate` y `PositionPipeline`.
- Consumir el endpoint desde el servicio de candidatos (`candidateService.ts`), desacoplado de los componentes.
- Manejar estados con `useState` y `useEffect` (o React Query si se adopta más adelante).
- Reutilizar el diseño existente de `RecruiterDashboard` con Bootstrap/React-Bootstrap.

---

## US-FE-002: Kanban de Posición en el Dashboard

**User Story:**
Como reclutador, quiero visualizar y gestionar los candidatos de una posición en un tablero Kanban organizado por etapas del proceso de selección, para mover candidatos entre fases de forma visual e intuitiva y mantener el pipeline actualizado.

**Tickets relacionados:** Ticket #001 (`GET /positions/:id/candidates`), Ticket #002 (`PUT /candidates/:id/stage`), Ticket #003 (`GET /positions`), Ticket #004 (`GET /positions/:id/interview-steps`)

### Criterios de Aceptación

- [ ] El dashboard incluye un selector de posiciones con al menos `positionId` y `positionTitle`.
- [ ] Al cambiar de posición, se actualiza automáticamente el tablero Kanban y sus candidatos agrupados por etapa.
- [ ] La primera posición se puede seleccionar por defecto si existe al menos una.
- [ ] El selector muestra un mensaje cuando no hay posiciones disponibles.
- [ ] La posición seleccionada se refleja en el estado de la aplicación (por ejemplo, query param o estado local).
- [ ] El tablero muestra una columna por cada etapa del flujo de la posición, ordenadas por `orderIndex`.
- [ ] Cada candidato se representa como una tarjeta dentro de la columna de su etapa actual.
- [ ] El usuario puede arrastrar y soltar tarjetas entre columnas para cambiar la etapa del candidato.
- [ ] Al soltar una tarjeta en una columna diferente, se solicita confirmación y se permite agregar notas opcionales antes de actualizar.
- [ ] Si se suelta una tarjeta en la misma columna, no se realiza ninguna actualización (no-op).
- [ ] El tablero es responsive: scroll horizontal en escritorio y apilamiento vertical en móvil.

### Consideraciones Técnicas

- Tipar el selector con `Form.Select` de React-Bootstrap.
- Centralizar el estado de posición seleccionada en `RecruiterDashboard`.
- Usar una librería de drag and drop compatible con React 18, como `@dnd-kit/core` + `@dnd-kit/sortable`.
- Agrupar candidatos por `currentInterviewStep.id` para formar las columnas del Kanban.
- Preparar mocks de posiciones, etapas y candidatos si algún endpoint aún no está disponible, manteniendo la interfaz funcional.

---

## US-FE-003: Tarjeta de Candidato con Detalle del Proceso

**User Story:**
Como reclutador, quiero ver los detalles clave de cada candidato en una tarjeta o fila, para evaluar rápidamente su estado en el proceso de selección.

**Ticket relacionado:** Ticket #001 - `GET /positions/:id/candidates`

### Criterios de Aceptación

- [ ] Cada candidato se representa como fila de tabla o tarjeta con: nombre completo, etapa actual, puntuación media, fecha de aplicación, progreso de entrevistas.
- [ ] La etapa actual se muestra como badge con color según el tipo (técnica, final, rechazado, etc.).
- [ ] La puntuación media se muestra con 2 decimales; si es `null` o `0`, se muestra "Sin evaluar".
- [ ] El progreso de entrevistas se muestra como `completadas / total`.
- [ ] Al hacer clic en un candidato se puede abrir un panel o navegar a una vista de detalle.

### Consideraciones Técnicas

- Crear componente `CandidatePipelineCard` o `CandidatePipelineRow` reutilizable.
- Tipar las props con `CandidatePipelineItem`.
- Usar componentes de React-Bootstrap (`Badge`, `ProgressBar`, `Card`).
- Mantener la separación entre presentación y lógica de datos.

---

## US-FE-004: Actualizar Etapa de Candidato desde el Pipeline

**User Story:**
Como reclutador, quiero cambiar la etapa de un candidato directamente desde el pipeline de la posición, para avanzar o retroceder el proceso de selección de forma ágil.

**Ticket relacionado:** Ticket #002 - `PUT /candidates/:id/stage`

### Criterios de Aceptación

- [ ] Cada fila/tarjeta de candidato incluye un control para actualizar la etapa (dropdown o modal).
- [ ] Al abrir el control, se muestran las etapas disponibles del flujo asociado a la posición.
- [ ] Al seleccionar una nueva etapa, se realiza una petición `PUT /candidates/:id/stage` con `positionId`, `newInterviewStepId` y `notes` opcional.
- [ ] Tras una actualización exitosa, se refresca el listado de candidatos y se muestra mensaje de confirmación.
- [ ] Se inhabilita el control durante la actualización para evitar doble envío.
- [ ] Si la etapa seleccionada es la misma, no se realiza la petición (no-op).

### Consideraciones Técnicas

- Crear componente `CandidateStageUpdater` con props tipadas: `candidateId`, `positionId`, `currentStep`, `availableSteps`, `onUpdate`.
- Consumir el endpoint `PUT /candidates/:id/stage` desde `candidateService.ts`.
- Manejar loading y errores locales en el componente.
- Actualizar el estado del pipeline optimistamente o refrescando tras confirmación.

---

## US-FE-005: Modal de Confirmación y Notas al Cambiar Etapa

**User Story:**
Como reclutador, quiero poder agregar notas opcionales al cambiar la etapa de un candidato y confirmar la acción, para documentar la decisión y evitar cambios accidentales.

**Ticket relacionado:** Ticket #002 - `PUT /candidates/:id/stage`

### Criterios de Aceptación

- [ ] Al seleccionar una nueva etapa, se abre un modal de confirmación con la etapa anterior y la nueva.
- [ ] El modal incluye un campo de texto opcional para ingresar notas.
- [ ] El usuario puede confirmar o cancelar la acción.
- [ ] Al confirmar, se envía el request con las notas incluidas si existen.
- [ ] Se muestra feedback de éxito o error tras cerrar el modal.

### Consideraciones Técnicas

- Usar `Modal` de React-Bootstrap.
- Tipar el formulario de notas con `Form.Control` y validación opcional de longitud máxima.
- Manejar el estado del modal con `useState`.
- Limpiar el formulario al cerrar el modal.

---

## US-FE-006: Estados Especiales de Candidato (Hired, Rejected, On Hold)

**User Story:**
Como reclutador, quiero marcar visualmente cuando un candidato ha sido contratado, rechazado o puesto en pausa, para tener claridad sobre el estado final del proceso.

**Ticket relacionado:** Ticket #002 - `PUT /candidates/:id/stage`

### Criterios de Aceptación

- [ ] Las etapas finales como "Hired", "Rejected" u "On Hold" se muestran con estilos distintivos (colores, iconos).
- [ ] Un candidato en estado final sigue visible en el pipeline pero resaltado como finalizado.
- [ ] El control de cambio de etapa permite seleccionar estos estados si pertenecen al flujo.
- [ ] Se muestra confirmación adicional antes de mover a un estado final.

### Consideraciones Técnicas

- Crear función auxiliar `getStepBadgeVariant(stepName: string)` para determinar colores de badge.
- Incluir tipos literales o enum para las etapas finales (`Hired`, `Rejected`, `OnHold`).
- Actualizar el componente `CandidateStageUpdater` para validar estados finales.

---

## US-FE-007: Manejo de Errores y Feedback al Usuario

**User Story:**
Como reclutador, quiero recibir mensajes claros cuando una acción falla, para entender qué ocurrió y poder reintentar.

**Ticket relacionado:** Ticket #001 y Ticket #002

### Criterios de Aceptación

- [ ] Si el endpoint de listado falla, se muestra un alert de error con opción de reintentar.
- [ ] Si el endpoint de actualización de etapa falla, se muestra el mensaje de error sin cerrar el modal de forma abrupta.
- [ ] Los errores de validación del backend (400, 404, 422) se muestran en español de forma comprensible.
- [ ] Se implementan mensajes de éxito con `Toast` o `Alert` temporales.
- [ ] Los estados de loading se indican visualmente en botones y selectores.

### Consideraciones Técnicas

- Implementar un `Toast` o `Alert` global con React Context o simplemente localmente en `RecruiterDashboard`.
- Tipar los errores de Axios para extraer `error.response?.data?.message`.
- Estandarizar el manejo de errores en `candidateService.ts`.

---

## US-FE-008: Navegación y Layout del Dashboard de Reclutador

**User Story:**
Como reclutador, quiero que el dashboard de reclutador centralice las acciones de agregar candidato y gestionar el pipeline, para no tener que navegar entre múltiples pantallas.

**Ticket relacionado:** Ticket #001 y Ticket #002

### Criterios de Aceptación

- [ ] El `RecruiterDashboard` existente se amplía para incluir la sección de pipeline de posiciones.
- [ ] Se mantiene el acceso a "Añadir Candidato" junto al nuevo pipeline.
- [ ] El layout es responsive y se adapta a diferentes tamaños de pantalla usando Bootstrap grid.
- [ ] Se mantiene el logo y título actuales del dashboard.
- [ ] La navegación con React Router continúa funcionando correctamente.

### Consideraciones Técnicas

- Refactorizar `RecruiterDashboard.js` a TypeScript (`RecruiterDashboard.tsx`) si el proyecto lo permite.
- Usar `Row`, `Col`, `Container`, `Card` de React-Bootstrap.
- Mantener la consistencia con el estilo visual existente (`App.css`, `index.css`).
- Asegurar que el componente siga siendo el punto de entrada principal del reclutador.

---

## Notas de Priorización

- **Alta prioridad**: US-FE-001, US-FE-002 (Kanban), US-FE-004, US-FE-008 (habilitan el flujo base del pipeline y la gestión de etapas).
- **Media prioridad**: US-FE-003, US-FE-007 (mejoran la UX y la claridad del sistema).
- **Baja prioridad / Futuro**: US-FE-005, US-FE-006 (funcionalidades adicionales de confirmación y estados finales).

## Dependencias Técnicas

- El frontend depende de que los endpoints `GET /positions`, `GET /positions/:id/interview-steps`, `GET /positions/:id/candidates` y `PUT /candidates/:id/stage` estén implementados y funcionando en el backend (puerto 3010).
- Se recomienda tipar los contratos de API para alinear el frontend (`types/api.ts`) con los contratos de backend.
- Es conveniente extender `candidateService.ts` y `positionService.ts` con los nuevos métodos: `getPositions`, `getInterviewStepsByPosition`, `getCandidatesByPosition` y `updateCandidateStage`.
