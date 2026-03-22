# Prompt 01 — Docker Setup

**Ejecutar primero. Levanta la base de datos PostgreSQL.**

---

Necesito levantar la base de datos del proyecto LTI. El proyecto usa Docker para correr PostgreSQL.

## Pasos

1. Asegúrate de que Docker Desktop está instalado y corriendo.

2. Si Docker no puede descargar imágenes (error de red/Cloudflare), configura en Docker Desktop → Settings → Docker Engine:
```json
{
  "registry-mirrors": ["https://mirror.gcr.io"],
  "mtu": 1400,
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```
Haz clic en **Apply & Restart**.

3. Levanta el contenedor de PostgreSQL desde la raíz del proyecto:
```bash
docker-compose up -d
```

4. Verifica que está corriendo:
```bash
docker-compose ps
```
Debe mostrar el contenedor `db` en estado `Up` con el puerto `5432` mapeado.

## Conexión a la base de datos
- Host: `localhost`
- Puerto: `5432`
- Usuario: `LTIdbUser`
- Password: definido en `backend/.env`
- Base de datos: `LTIdb`

## Para detener
```bash
docker-compose down
```
