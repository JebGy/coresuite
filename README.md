# CoreSuite - Sistema de Gestión Empresarial

CoreSuite es un sistema completo de gestión empresarial que incluye control de inventario, gestión de almacenes, productos, movimientos y reportes con gráficos.

## 🚀 Características

- **Gestión de Almacenes**: Crear y administrar múltiples almacenes
- **Gestión de Productos**: Catálogo completo de productos con códigos únicos
- **Control de Movimientos**: Registro de entradas y salidas de inventario
- **Kardex Valorizado**: Control de inventario con costo promedio
- **Reportes con Gráficos**: Análisis visual de datos con exportación
- **Interfaz Moderna**: Diseño responsive con Tailwind CSS
- **Base de Datos PostgreSQL**: Almacenamiento robusto y escalable

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Estilos**: Tailwind CSS 4
- **Gráficos**: Chart.js, React-Chartjs-2
- **Exportación**: jsPDF, html2canvas

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd coresuite
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/coresuite"
   NEXTAUTH_SECRET="tu-clave-secreta-aqui"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Configurar PostgreSQL**
   ```sql
   CREATE DATABASE coresuite;
   CREATE USER coresuite_user WITH PASSWORD 'tu_contraseña';
   GRANT ALL PRIVILEGES ON DATABASE coresuite TO coresuite_user;
   ```

5. **Generar el cliente de Prisma y ejecutar migraciones**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Ejecutar el seed de datos (opcional)**
   ```bash
   npm run seed
   ```

7. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

8. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **Almacen**: Información de almacenes (id, nombre, ubicación, descripción)
- **Producto**: Catálogo de productos (id, código, nombre, descripción)
- **Movimiento**: Registro de entradas/salidas (id, tipo, fecha, cantidad, precio, motivo, productoId, almacenId)

### Relaciones

- Un almacén puede tener múltiples movimientos
- Un producto puede tener múltiples movimientos
- Cada movimiento está asociado a un producto y un almacén

## 🎯 Funcionalidades

### Dashboard
- Métricas en tiempo real
- Resumen de actividad reciente
- Gráficos de distribución

### Gestión de Almacenes
- Crear nuevos almacenes
- Ver lista de almacenes activos
- Información detallada de ubicación

### Gestión de Productos
- Registrar productos con códigos únicos
- Catálogo completo con descripciones
- Estado de productos activos

### Control de Movimientos
- Registrar entradas y salidas
- Asociar movimientos a productos y almacenes
- Precio unitario para entradas
- Motivo del movimiento

### Kardex
- **Por Producto**: Control individual por producto
- **Por Almacén**: Control por almacén específico
- **Consolidado**: Vista general de todo el inventario

### Reportes
- Gráficos de movimientos por mes
- Distribución de entradas vs salidas
- Productos más movidos
- Valor de inventario por almacén
- Exportación a PDF e imagen

## 🔄 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código
npm run seed         # Ejecutar datos de prueba
```

## 📁 Estructura del Proyecto

```
coresuite/
├── app/
│   ├── actions/           # Acciones del servidor
│   ├── components/        # Componentes React
│   ├── cotizaciones/      # Módulo de cotizaciones
│   ├── recursoshumanos/   # Módulo de RRHH
│   └── valorizado/        # Módulo de inventario valorizado
├── lib/                   # Utilidades y configuración
├── pages/api/            # API Routes
├── prisma/               # Esquema y migraciones
├── public/               # Archivos estáticos
└── types.ts              # Tipos TypeScript
```

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### Docker
```bash
docker build -t coresuite .
docker run -p 3000:3000 coresuite
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisar la documentación
2. Verificar la configuración de la base de datos
3. Revisar los logs del servidor
4. Crear un issue en el repositorio

## 🔮 Próximas Características

- [ ] Módulo de cotizaciones
- [ ] Gestión de recursos humanos
- [ ] Facturación electrónica
- [ ] Integración con proveedores
- [ ] App móvil
- [ ] Notificaciones en tiempo real
