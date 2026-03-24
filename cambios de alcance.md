Quiero hacer que la aplicación tenga acceso con usuario y password (cifrado)
En la pantalla principal aparecerá para introducir el usuario y la password. 
Debe validar el usuario y la password con los datos del usuario  de la base de datos.

Se requiere gestión de excepciones
 - No debe aparece si el usuario o password es incorrecto. Solo debe indicar que los datos no son correctos y que no tiene acceso.
 - Si se ha olvidado la password, se debe enviar un mail a la cuenta del usuario con su nueva password. No se debe indicar si el usuario existe o no existe. Si existe se envía a su email. y se indica recibirá la nueva constraseña en su mail.

El mail que se va a usar en la aplicación es de etherial.mail
user: emmanuelle13@ethereal.email
pass: Pr7UPV5zUFDP3SSxDr
puerto: 587


Una vez que el usuario accede debe aparecer un menú a la izquierda y una cabecera de la aplicación en la que se vea LTI-Gestión de Candidatos. A la derecha de la cabecera aparecerá un avartar del usuario logado con la posibilidad de cambiar la password. PAra cambiar la password aparecerá un formulario con tres campos para introducir la password actual, y dos veces la nueva que deben ser iguales y cumplir los requisitos de password que se indican en el apartado de usuario.

El menú consta de los siguientes apartados:
Dashboard en que se visualicen datos de número de candidatos registrados por tipo de puesto, provincia, municipio.
Candidatos: Gestión de Candidatos
Usuarios : Gestión de usuarios de la aplicación.
Tipos de puesto : Gestión de tipos de puesto.
Sectores : Gestión de Sectores

El formato de los formularios siempre debe ser el mismo.
Al acceder aparece una tabla con los datos registrados en ese apartado(se indicarán las columnas de cada tabla). A la derecha de cada registro aparecerá un icono para editar el registro y otro para borrar el registro.
Al hacer doble click en un registro de la tabla o en editar debe aparecer el formulario de Alta/Modificación con los campos que se haya indicado en cada DTO. Al puslar guardar se actualizaran los datos del registro.
Encima de la tabla deben aparecer filtros, por las columnas de la tabla y las búsquedas de campos tipo string serán con like, un botón para crear un nuevo registro y exportar a Excel.
El botón nuevo registro abre el formulario de Alta/Modificación con los campos que se haya indicado en cada DTO y si se pulsa guardar se dará de alta un nuevo registro.

Gestión de candidatos:
	nombre texto 100
	apellido texto 150
	correo electrónico texto 250 formato correo electrónico identificador único
	teléfono texto 150 formato teléfono con prefijo de país +34 XXXXXXXXX
	dirección texto 250,
	Código Postal numérico de cinco cifras
	Provincia texto 100
	Municipio texto 100
	Sector: selección automática si se selecciona tipo de puesto
	Tipo de puesto combo con los tipos de puesto filtrados si se selecciona sector.
	educación texto 2000
	experiencia laboral. texto 2000
	Adjuntar documentos.

Gestión de usuarios:
	login  texto 250 identificador único
	nombre texto 100
	apellidos texto 150
	correo electrónico texto 250 formato correo electrónico 
	password mínimo 8 caracteres alfanuméricos, con al menos una Mayúcula, una minúscula, un número y un carácter extraño. No puede tener mas de dos caracteres o números iguales seguidos. La password no se visualiza en el formulario.
Cuando se crea un usuario se envía un mail al usuario con su password.
En el formulario al editar un usuario habrá un botón para resetear la password de un usuario. Se generará una nueva password y se enviará por correo al usuario.

Gestión de Sectores
	nombre de sector texto 100
Gestión de tipos de puesto
	nombre de tipos de puesto texto 100
	sector: combo con los sectores

La aplicación debe seguir las siguientes especificaciones:
Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.
Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web (Responsiva). UnoCSS como framework de estilos

La interfaz debe ser intuitiva (orden de campos, labels claros, feedback visual) y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.

Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.





