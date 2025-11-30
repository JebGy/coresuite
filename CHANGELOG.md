## 2025-11-13

- Configurado Jest con proyectos cliente/servidor y `ts-jest`.
- Añadidas pruebas unitarias para `useProductos` y acciones de `OrdenesEntrega`.
- Eliminadas pruebas de `addProudcto` según solicitud.
- Cobertura verificada (≥80% en líneas/funciones/statements); reportes en `coverage/`.
- CI/CD: workflow de tests y workflow de revisión de pares para cambios en pruebas.
- APIs PageRouter cubiertas: `getproductos` con manejo de errores y `solicitudes/[id]` con validaciones.
- Pruebas de navegación y protección de rutas con `UserProvider`.
