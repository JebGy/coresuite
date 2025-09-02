# Módulo de Solicitudes de Material y Equipo

## Descripción
Este módulo permite a los usuarios crear solicitudes de material y/o equipo, las cuales son almacenadas en la base de datos como constancia digital y enviadas por correo electrónico para su evaluación.

## Características Implementadas

### ✅ Funcionalidades Completadas
- **Formulario de solicitud**: Interfaz para crear solicitudes con validaciones
- **Base de datos**: Tabla SOLICITUDES con todos los atributos requeridos
- **Panel de aprobación**: Sistema para aprobar/rechazar solicitudes
- **Notificaciones por correo**: Envío automático de emails
- **Navegación**: Integración en el menú principal
- **Roles especiales**: Soporte para residente y gerente de obra

### 📋 Atributos de la Solicitud
- **ID**: Identificador único
- **Usuario solicitante**: Referencia al trabajador que solicita
- **Asunto**: Descripción del propósito de la solicitud
- **Elementos**: Lista de materiales/equipos con cantidades
- **Estado**: Pendiente, Aprobado, Rechazado
- **Motivo**: Razón del rechazo (opcional)
- **Fechas**: Creación y última actualización

## Configuración Requerida

### Variables de Entorno
Agregar las siguientes variables al archivo `.env`:

```env
# Configuración SMTP para correos electrónicos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@empresa.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM=tu-email@empresa.com

# Correos de notificación
GERENCIA_ADMIN_EMAIL=gerencia.admin@empresa.com
GERENCIA_LOGISTICA_EMAIL=gerencia.logistica@empresa.com
```

### Roles de Usuario
Asegúrate de que existan los siguientes roles en la base de datos:
- `RESIDENTE_OBRA`: Para residentes de obra
- `GERENTE_OBRA`: Para gerentes de obra
- `ADMIN`: Para administradores del sistema

## Uso del Módulo

### Para Usuarios Regulares
1. Navegar a "Solicitudes" en el menú principal
2. Completar el formulario con:
   - Asunto de la solicitud
   - Lista de elementos con cantidades
3. Enviar la solicitud
4. Recibir confirmación por correo electrónico

### Para Aprobadores (Residentes/Gerentes)
1. Acceder a la pestaña "Aprobar Solicitudes"
2. Revisar las solicitudes pendientes
3. Aprobar o rechazar con motivo
4. El solicitante recibe notificación automática

## Archivos Creados/Modificados

### Nuevos Archivos
- `/app/solicitudes/page.tsx` - Página principal del módulo
- `/pages/api/solicitudes.ts` - API para CRUD de solicitudes
- `/pages/api/solicitudes/[id].ts` - API para actualizar estado
- `/lib/emailService.ts` - Servicio de correo electrónico

### Archivos Modificados
- `/prisma/schema.prisma` - Modelo Solicitud agregado
- `/app/config/navigationSections.tsx` - Navegación actualizada
- `/app/components/Icons.tsx` - Icono de solicitudes
- `/types.ts` - Tipos TypeScript para solicitudes

## Dependencias Instaladas
- `nodemailer` - Para envío de correos electrónicos
- `@types/nodemailer` - Tipos TypeScript para nodemailer

## Notas Técnicas
- Las solicitudes se almacenan con estado inicial "PENDIENTE"
- Los correos se envían de forma asíncrona sin bloquear la operación
- El sistema mantiene logs de todas las acciones realizadas
- La interfaz es responsive y sigue el diseño del sistema existente

## Próximos Pasos Recomendados
1. Configurar las variables de entorno SMTP
2. Verificar que los roles de usuario estén creados
3. Probar el envío de correos electrónicos
4. Capacitar a los usuarios en el uso del módulo