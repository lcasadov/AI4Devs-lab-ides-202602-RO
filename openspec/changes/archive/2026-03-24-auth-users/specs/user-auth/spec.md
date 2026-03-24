## ADDED Requirements

### Requirement: Login con usuario y contraseña
El sistema SHALL autenticar usuarios mediante login y contraseña. Si las credenciales son correctas, SHALL devolver un JWT válido. Si son incorrectas, SHALL responder con un mensaje genérico que no revele si el login existe.

#### Scenario: Login exitoso
- **WHEN** el usuario envía login y contraseña correctos a `POST /api/auth/login`
- **THEN** el sistema responde con `200 OK` y un JWT con `{ userId, login, role }` en el payload, expiración 8h

#### Scenario: Credenciales incorrectas — login no existe
- **WHEN** el usuario envía un login que no existe en la base de datos
- **THEN** el sistema responde con `401 Unauthorized` y el mensaje `"Credenciales incorrectas"`

#### Scenario: Credenciales incorrectas — contraseña errónea
- **WHEN** el usuario envía un login válido pero contraseña incorrecta
- **THEN** el sistema responde con `401 Unauthorized` y el mensaje `"Credenciales incorrectas"`

#### Scenario: Usuario inactivo
- **WHEN** el usuario existe y la contraseña es correcta pero `active = false`
- **THEN** el sistema responde con `401 Unauthorized` y el mensaje `"Credenciales incorrectas"`

---

### Requirement: Protección de rutas mediante JWT
El sistema SHALL requerir un JWT válido en la cabecera `Authorization: Bearer <token>` para acceder a cualquier ruta protegida.

#### Scenario: Acceso con token válido
- **WHEN** la petición incluye un `Authorization: Bearer <token>` válido y no expirado
- **THEN** el middleware permite continuar y adjunta el payload del token al request

#### Scenario: Acceso sin token
- **WHEN** la petición no incluye cabecera `Authorization`
- **THEN** el sistema responde con `401 Unauthorized` y el mensaje `"Token requerido"`

#### Scenario: Token expirado o inválido
- **WHEN** la petición incluye un token malformado o expirado
- **THEN** el sistema responde con `401 Unauthorized` y el mensaje `"Token inválido o expirado"`

---

### Requirement: Recuperación de contraseña por email
El sistema SHALL permitir a un usuario solicitar el reseteo de su contraseña. SHALL enviar un email con la nueva contraseña si el usuario existe, y SHALL responder siempre con el mismo mensaje para no revelar si el usuario existe.

#### Scenario: Solicitud con login existente
- **WHEN** el usuario envía su login a `POST /api/auth/forgot-password`
- **THEN** el sistema genera una nueva contraseña aleatoria, la hashea, actualiza la BD y envía un email al correo del usuario con la nueva contraseña
- **AND** responde con `200 OK` y el mensaje `"Si el usuario existe, recibirá una nueva contraseña en su correo electrónico"`

#### Scenario: Solicitud con login inexistente
- **WHEN** el usuario envía un login que no existe a `POST /api/auth/forgot-password`
- **THEN** el sistema responde con `200 OK` y el mismo mensaje `"Si el usuario existe, recibirá una nueva contraseña en su correo electrónico"` sin enviar ningún email

---

### Requirement: Cambio de contraseña propia
El sistema SHALL permitir al usuario autenticado cambiar su propia contraseña introduciendo la contraseña actual y dos veces la nueva.

#### Scenario: Cambio exitoso
- **WHEN** el usuario autenticado envía contraseña actual correcta y nueva contraseña válida (confirmada dos veces) a `PUT /api/auth/change-password`
- **THEN** el sistema actualiza el hash en la BD y responde con `200 OK`

#### Scenario: Contraseña actual incorrecta
- **WHEN** el usuario envía una contraseña actual que no coincide con la almacenada
- **THEN** el sistema responde con `400 Bad Request` y el mensaje `"La contraseña actual es incorrecta"`

#### Scenario: Nueva contraseña no cumple política
- **WHEN** la nueva contraseña no cumple los requisitos (mín 8 chars, mayúscula, minúscula, número, especial, máx 2 iguales consecutivos)
- **THEN** el sistema responde con `400 Bad Request` y descripción del requisito no cumplido

#### Scenario: Las dos nuevas contraseñas no coinciden
- **WHEN** los campos `newPassword` y `confirmPassword` no son idénticos
- **THEN** el sistema responde con `400 Bad Request` y el mensaje `"Las contraseñas no coinciden"`

---

### Requirement: Página de Login en el frontend
El frontend SHALL mostrar una página de login como ruta raíz cuando no hay sesión activa. SHALL redirigir al dashboard tras autenticación exitosa.

#### Scenario: Acceso sin sesión redirige a login
- **WHEN** el usuario navega a cualquier ruta protegida sin JWT en localStorage
- **THEN** el frontend redirige a `/login`

#### Scenario: Login exitoso redirige al dashboard
- **WHEN** el usuario introduce credenciales correctas y pulsa "Acceder"
- **THEN** el frontend almacena el JWT en localStorage y redirige a `/dashboard`

#### Scenario: Mostrar error genérico en login fallido
- **WHEN** el backend responde con `401`
- **THEN** el frontend muestra el mensaje `"Los datos introducidos no son correctos. No tienes acceso."` sin revelar detalles
