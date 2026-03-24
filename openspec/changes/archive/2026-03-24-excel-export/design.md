## Context

Las cuatro páginas de gestión ya cargan sus datos en memoria y aplican filtros en el cliente. La exportación puede generarse directamente desde esos datos sin llamadas adicionales al backend.

## Goals / Non-Goals

**Goals:**
- Exportar a `.xlsx` los datos filtrados visibles en cada tabla
- Implementación 100% en el cliente con SheetJS (`xlsx`)
- Función genérica reutilizable para todas las páginas

**Non-Goals:**
- Exportación desde el backend
- Exportación de todos los registros (paginación server-side no existe)
- Formato CSV o PDF
- Configuración de columnas por el usuario

## Decisions

### 1. SheetJS (`xlsx`) como biblioteca de exportación

**Decision**: usar el paquete npm `xlsx` (SheetJS community edition).

**Rationale**: pure JavaScript, sin dependencias nativas, funciona en CRA sin eject, soporta `.xlsx` nativo, ampliamente usado.

**Alternative considered**: `exceljs` — más pesado, API más compleja para este caso simple.

### 2. Exportación client-side de datos filtrados

**Decision**: exportar los datos que ya están en el estado de React (los mismos que se muestran en la tabla, post-filtro), sin nuevo endpoint.

**Rationale**: los datos ya están cargados en memoria. Añadir un endpoint solo para exportación sería redundante. Si en el futuro hay paginación server-side, se revisará.

### 3. Función genérica `exportToExcel`

**Decision**: crear `frontend/src/utils/exportExcel.ts` con una función:
```ts
exportToExcel(rows: Record<string, unknown>[], columns: { header: string; key: string }[], filename: string): void
```

**Rationale**: evita duplicar la lógica de SheetJS en cada página. Cada página define sus propias columnas y llama a la función con sus datos filtrados.

### 4. Nombre de archivo con fecha

**Decision**: el filename incluye la fecha actual: e.g., `candidatos-2026-03-24.xlsx`.

**Rationale**: facilita identificar exportaciones múltiples sin sobrescribir.

## Risks / Trade-offs

- **Tamaño del bundle**: SheetJS añade ~250KB al bundle. Aceptable dado que es la única biblioteca de exportación.
- **Datos en memoria**: si hay miles de registros sin paginación, todos están en memoria igualmente. Sin riesgo adicional.

## Migration Plan

1. `npm install xlsx` en `frontend/`
2. Crear `exportExcel.ts`
3. Actualizar las cuatro páginas
4. Sin cambios de backend ni schema

## Open Questions

Ninguna.
