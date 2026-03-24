## ADDED Requirements

### Requirement: Modelo de usuario con rol y estado
El sistema SHALL gestionar usuarios con los campos: `login` (único), `firstName`, `lastName`, `email` (único), `passwordHash`, `role` (ADMIN | RECRUITER), `active` (boolean). La contraseña nunca SHALL ser devuelta en ninguna respuesta de la API.

#### Scenario: Campos sensibles excluidos de respuestas
- **WHEN** cualquier endpoint de usuarios devuelve un usuario
- **THEN** el campo `passwordHash` no está presente en la respuesta

---

### Requirement: Listado de usuarios con filtros (ADMIN)
El sistema SHALL proporcionar un endpoint `GET /api/users` protegido por JWT y restringido a rol ADMIN que devuelva la lista de usuarios con soporte de filtrado.

#### Scenario: Listado completo
- **WHEN** un ADMIN hace `GET /api/users` sin parámetros
- **THEN** el sistema responde con `200 OK` y array de usuarios (sin passwordHash)

#### Scenario: Filtrado por login (like)
- **WHEN** un ADMIN hace `GET /api/users?login=adm`
- **THEN** el sistema devuelve solo usuarios cuyo login contenga "adm" (case-insensitive)

#### Scenario: Acceso denegado a RECRUITER
- **WHEN** un usuario con rol RECRUITER accede a `GET /api/users`
- **THEN** el sistema responde con `403 Forbidden`

---

### Requirement: Creación de usuario con email de bienvenida (ADMIN)
El sistema SHALL permitir a un ADMIN crear un usuario nuevo. SHALL generar automáticamente una contraseña aleatoria que cumpla la política, enviar un email al usuario con sus credenciales y responder con `201 Created`.

#### Scenario: Creación exitosa
- **WHEN** un ADMIN envía datos válidos a `POST /api/users`
- **THEN** el sistema crea el usuario con contraseña generada, envía email con credenciales y responde con `201 Created` (sin passwordHash)

#### Scenario: Login duplicado
- **WHEN** el login ya existe en la BD
- **THEN** el sistema responde con `409 Conflict` y el mensaje `"El login ya está en uso"`

#### Scenario: Email duplicado
- **WHEN** el email ya existe en la BD
- **THEN** el sistema responde con `409 Conflict` y el mensaje `"El email ya está en uso"`

---

### Requirement: Edición de usuario (ADMIN)
El sistema SHALL permitir a un ADMIN modificar los datos de un usuario (login, firstName, lastName, email, role, active) mediante `PUT /api/users/:id`. La contraseña no se modifica en este endpoint.

#### Scenario: Edición exitosa
- **WHEN** un ADMIN envía datos válidos a `PUT /api/users/:id`
- **THEN** el sistema actualiza los campos y responde con `200 OK` (sin passwordHash)

#### Scenario: Usuario no encontrado
- **WHEN** el id no corresponde a ningún usuario
- **THEN** el sistema responde con `404 Not Found`

---

### Requirement: Eliminación de usuario (ADMIN)
El sistema SHALL permitir a un ADMIN eliminar un usuario mediante `DELETE /api/users/:id`.

#### Scenario: Eliminación exitosa
- **WHEN** un ADMIN envía `DELETE /api/users/:id` con un id existente
- **THEN** el sistema elimina el usuario y responde con `204 No Content`

#### Scenario: No se puede eliminar a uno mismo
- **WHEN** el ADMIN intenta eliminar su propio usuario
- **THEN** el sistema responde con `400 Bad Request` y el mensaje `"No puedes eliminar tu propio usuario"`

---

### Requirement: Reset de contraseña por ADMIN
El sistema SHALL permitir a un ADMIN generar una nueva contraseña para cualquier usuario mediante `POST /api/users/:id/reset-password`. La nueva contraseña SHALL ser enviada por email al usuario afectado.

#### Scenario: Reset exitoso
- **WHEN** un ADMIN hace `POST /api/users/:id/reset-password`
- **THEN** el sistema genera nueva contraseña, actualiza el hash en BD, envía email al usuario y responde con `200 OK`

---

### Requirement: Página de gestión de usuarios en el frontend (ADMIN)
El frontend SHALL mostrar la página de usuarios solo a usuarios con rol ADMIN. SHALL presentar tabla con columnas: login, nombre, apellidos, email, rol, activo; con filtros por columna, botón de nuevo usuario, icono de editar e icono de borrar por registro.

#### Scenario: Acceso de RECRUITER oculta el menú de usuarios
- **WHEN** un RECRUITER inicia sesión
- **THEN** el item "Usuarios" no aparece en el menú lateral

#### Scenario: Doble click en fila abre formulario de edición
- **WHEN** el ADMIN hace doble click en una fila de la tabla
- **THEN** se abre el formulario con los datos del usuario (sin campo de contraseña)

#### Scenario: Formulario de edición tiene botón "Resetear contraseña"
- **WHEN** el ADMIN abre el formulario de edición de cualquier usuario
- **THEN** hay un botón "Resetear contraseña" que al pulsarlo llama a `POST /api/users/:id/reset-password`

---

### Requirement: Modal de cambio de contraseña propia
El frontend SHALL ofrecer un modal accesible desde el avatar del header que permita al usuario cambiar su propia contraseña con tres campos: contraseña actual, nueva contraseña y confirmación.

#### Scenario: Cambio exitoso cierra el modal
- **WHEN** el usuario rellena los tres campos correctamente y pulsa "Guardar"
- **THEN** el frontend llama a `PUT /api/auth/change-password`, muestra mensaje de éxito y cierra el modal

#### Scenario: Validación de política en tiempo real
- **WHEN** el usuario escribe en el campo nueva contraseña
- **THEN** el frontend muestra en tiempo real qué requisitos se cumplen y cuáles faltan
