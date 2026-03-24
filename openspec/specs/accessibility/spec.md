## ADDED Requirements

### Requirement: Sidebar navigation is accessible
El `Sidebar` SHALL usar `<nav aria-label="Menú principal">` y marcar el enlace activo con `aria-current="page"`.

#### Scenario: Screen reader announces active page
- **WHEN** el usuario está en la página Candidatos
- **THEN** el enlace "Candidatos" en el sidebar tiene `aria-current="page"`
- **THEN** el resto de enlaces no tienen `aria-current`

### Requirement: Table inputs have accessible labels
Los inputs de filtro en las tablas SHALL tener `aria-label` descriptivo ya que no tienen `<label>` visible.

#### Scenario: Filter input is labeled
- **WHEN** un lector de pantalla enfoca el input de filtro de Nombre en CandidatesPage
- **THEN** anuncia "Filtrar por nombre" o equivalente via `aria-label`

### Requirement: Tables have captions
Cada tabla de gestión SHALL tener un `<caption>` visualmente oculto que describa el contenido.

#### Scenario: Table caption is read by screen reader
- **WHEN** un lector de pantalla navega a la tabla de candidatos
- **THEN** anuncia el caption "Tabla de candidatos"

### Requirement: Error messages are announced automatically
Los divs de error SHALL tener `role="alert"` para que los lectores de pantalla los anuncien al aparecer.

#### Scenario: Error is announced
- **WHEN** ocurre un error al cargar datos
- **THEN** el mensaje de error aparece en un elemento con `role="alert"`
- **THEN** el lector de pantalla lo anuncia automáticamente sin que el usuario navegue hasta él

### Requirement: Loading states are announced
Los estados de carga SHALL usar `aria-live="polite"` o `role="status"` para anuncio no intrusivo.

#### Scenario: Loading state is announced
- **WHEN** la página está cargando datos
- **THEN** el texto "Cargando..." está en un elemento con `role="status"` o `aria-live="polite"`

### Requirement: Action buttons have descriptive labels
Los botones de acción en tablas (Editar, Eliminar) ya tienen `aria-label` con el nombre del registro. SHALL mantenerse en todas las páginas.

#### Scenario: Delete button is labeled
- **WHEN** un lector de pantalla enfoca el botón Eliminar de un candidato "Jane Doe"
- **THEN** anuncia "Eliminar Jane Doe"

### Requirement: Forms can be dismissed with Escape
Los formularios de creación/edición SHALL cerrarse al pulsar la tecla Escape.

#### Scenario: Escape closes form
- **WHEN** el usuario pulsa Escape con un formulario abierto
- **THEN** el formulario se cierra (equivalente a pulsar Cancelar)

### Requirement: Dashboard panels are labeled
Los paneles del Dashboard SHALL tener `aria-label` descriptivo en su elemento contenedor.

#### Scenario: Panel is labeled
- **WHEN** un lector de pantalla navega al panel de estadísticas por provincia
- **THEN** el panel tiene `aria-label="Candidatos por provincia"` o equivalente
