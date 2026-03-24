## ADDED Requirements

### Requirement: Servicio de email configurable por variables de entorno
El sistema SHALL disponer de un `EmailService` singleton que encapsule el envío de emails via SMTP. La configuración SHALL leerse de variables de entorno: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.

#### Scenario: Email enviado correctamente
- **WHEN** un servicio de aplicación llama a `EmailService.send({ to, subject, html })`
- **THEN** el email es enviado via SMTP y el método resuelve sin error

#### Scenario: Error de SMTP no propaga al usuario final
- **WHEN** el transporte SMTP falla al enviar un email
- **THEN** el error es registrado en el log del servidor pero la operación principal (crear usuario, reset password) no falla por ello

---

### Requirement: Email de bienvenida al crear usuario
El sistema SHALL enviar un email de bienvenida al usuario recién creado con sus credenciales de acceso.

#### Scenario: Email con credenciales enviado al crear usuario
- **WHEN** un ADMIN crea un nuevo usuario exitosamente
- **THEN** el sistema envía un email a la dirección del nuevo usuario con su login y contraseña temporal

---

### Requirement: Email de nueva contraseña en reset
El sistema SHALL enviar un email con la nueva contraseña generada cuando se produce un reset, tanto por ADMIN (`POST /api/users/:id/reset-password`) como por recuperación (`POST /api/auth/forgot-password`).

#### Scenario: Email enviado en reset por ADMIN
- **WHEN** un ADMIN hace reset de contraseña de otro usuario
- **THEN** el usuario afectado recibe un email con su nueva contraseña

#### Scenario: Email enviado en forgot-password
- **WHEN** el sistema procesa un `POST /api/auth/forgot-password` con un login existente
- **THEN** el usuario recibe un email con su nueva contraseña autogenerada
