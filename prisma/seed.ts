import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Crear unidad base para el root
  const unidadAdmin = await prisma.unidad.upsert({
    where: { nombre: "Administración" },
    update: {},
    create: {
      nombre: "Administración",
      descripcion: "Unidad administrativa principal",
    },
  });

  // Crear roles base
  const roles = [
    {
      nombre: "Comercial",
      descripcion: "Funciones del área comercial",
      permisos: {
        puedeVerReportes: true,
        puedeEditarUsuarios: false,
        puedeCrearOrdenes: true,
        puedeGestionarInventario: false,
      },
    },
    {
      nombre: "Logística",
      descripcion: "Funciones del área logística",
      permisos: {
        puedeVerReportes: true,
        puedeEditarUsuarios: false,
        puedeCrearOrdenes: false,
        puedeGestionarInventario: true,
      },
    },
    {
      nombre: "RRHH",
      descripcion: "Funciones del área de recursos humanos",
      permisos: {
        puedeVerReportes: true,
        puedeEditarUsuarios: true,
        puedeCrearOrdenes: false,
        puedeGestionarInventario: false,
      },
    },
    {
      nombre: "Root",
      descripcion: "Control total",
      permisos: {
        puedeVerReportes: true,
        puedeEditarUsuarios: true,
        puedeCrearOrdenes: true,
        puedeGestionarInventario: true,
        accesoTotal: true,
      },
    },
  ];

  const rolesCreados: { [key: string]: any } = {};
  for (const rol of roles) {
    const rolCreado = await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
      },
    });
    rolesCreados[rol.nombre] = rolCreado;
  }

  // Crear usuario root inicial
  await prisma.trabajador.upsert({
    where: { email: "root@admin.com" },
    update: {},
    create: {
      dni: "00000000",
      nombres: "Root",
      apellidos: "Admin",
      email: "root@admin.com",
      telefono: "000000000",
      unidadId: unidadAdmin.id,
      rolId: rolesCreados["Root"].id,
    },
  });

  console.log("Seed completado: Unidades, roles y usuario root creados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
