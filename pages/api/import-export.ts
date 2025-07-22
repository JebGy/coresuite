import { NextApiRequest, NextApiResponse } from "next";
import * as XLSX from "xlsx";
import { prisma } from "../../lib/prisma";

export const config = {
  api: {
    bodyParser: false, // Para manejar archivos
  },
};

// Utilidad para leer el archivo Excel del request
async function parseExcelFile(req: NextApiRequest): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const buffer = Buffer.concat(chunks);
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Importar datos desde Excel
    try {
      const workbook = await parseExcelFile(req);
      // Procesar cada hoja y guardar los datos en la base de datos
      const results: any = {};
      const errors: any = {};
      // Unidades
      const unidadesSheet = workbook.Sheets["Unidades"];
      if (unidadesSheet) {
        const unidades = XLSX.utils.sheet_to_json(unidadesSheet);
        let ok = 0, fail = 0;
        for (const [i, unidad] of (unidades as Record<string, unknown>[]).entries()) {
          if (!unidad.nombre) {
            errors.unidades = errors.unidades || [];
            errors.unidades.push(`Fila ${i + 2}: Falta el nombre`);
            fail++;
            continue;
          }
          try {
            await prisma.unidad.upsert({
              where: { id: typeof unidad.id === "number" && !isNaN(unidad.id) ? unidad.id : -1 },
              update: { 
                nombre: String(unidad.nombre), 
                descripcion: unidad.descripcion ? String(unidad.descripcion) : null 
              },
              create: { 
                nombre: String(unidad.nombre), 
                descripcion: unidad.descripcion ? String(unidad.descripcion) : null 
              },
            });
            ok++;
          } catch (e) {
            errors.unidades = errors.unidades || [];
            errors.unidades.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.unidades = { ok, fail };
      }
      // Almacenes
      const almacenesSheet = workbook.Sheets["Almacenes"];
      if (almacenesSheet) {
        const almacenes = XLSX.utils.sheet_to_json(almacenesSheet);
        let ok = 0, fail = 0;
        for (const [i, almacen] of (almacenes as Record<string, unknown>[]).entries()) {
          if (!almacen.nombre) {
            errors.almacenes = errors.almacenes || [];
            errors.almacenes.push(`Fila ${i + 2}: Falta el nombre`);
            fail++;
            continue;
          }
          try {
            await prisma.almacen.upsert({
              where: { id: typeof almacen.id === "number" && !isNaN(almacen.id) ? almacen.id : -1 },
              update: { nombre: String(almacen.nombre), ubicacion: String(almacen.ubicacion), descripcion: String(almacen.descripcion), unidadId: almacen.unidadId ? Number(almacen.unidadId) : undefined },
              create: { nombre: String(almacen.nombre), ubicacion: String(almacen.ubicacion), descripcion: String(almacen.descripcion), unidadId: almacen.unidadId ? Number(almacen.unidadId) : undefined },
            });
            ok++;
          } catch (e) {
            errors.almacenes = errors.almacenes || [];
            errors.almacenes.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.almacenes = { ok, fail };
      }
      // Roles
      const rolesSheet = workbook.Sheets["Roles"];
      if (rolesSheet) {
        const roles = XLSX.utils.sheet_to_json(rolesSheet);
        let ok = 0, fail = 0;
        for (const [i, rol] of (roles as Record<string, unknown>[]).entries()) {
          if (!rol.nombre) {
            errors.roles = errors.roles || [];
            errors.roles.push(`Fila ${i + 2}: Falta el nombre`);
            fail++;
            continue;
          }
          try {
            await prisma.rol.upsert({
              where: { id: typeof rol.id === "number" && !isNaN(rol.id) ? rol.id : -1 },
              update: { nombre: String(rol.nombre), descripcion: String(rol.descripcion), permisos: rol.permisos ? JSON.parse(String(rol.permisos)) : {} },
              create: { nombre: String(rol.nombre), descripcion: String(rol.descripcion), permisos: rol.permisos ? JSON.parse(String(rol.permisos)) : {} },
            });
            ok++;
          } catch (e) {
            errors.roles = errors.roles || [];
            errors.roles.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.roles = { ok, fail };
      }
      // Trabajadores
      const trabajadoresSheet = workbook.Sheets["Trabajadores"];
      if (trabajadoresSheet) {
        const trabajadores = XLSX.utils.sheet_to_json(trabajadoresSheet);
        let ok = 0, fail = 0;
        for (const [i, t] of (trabajadores as Record<string, unknown>[]).entries()) {
          if (!t.dni || !t.nombres || !t.apellidos || !t.email) {
            errors.trabajadores = errors.trabajadores || [];
            errors.trabajadores.push(`Fila ${i + 2}: Faltan campos obligatorios (dni, nombres, apellidos, email)`);
            fail++;
            continue;
          }
          try {
            const trabajadorData: any = {
              dni: String(t.dni),
              nombres: String(t.nombres),
              apellidos: String(t.apellidos),
              email: String(t.email),
              telefono: t.telefono !== undefined && t.telefono !== null ? String(t.telefono) : undefined,
              password: t.password,
            };
            if (typeof t.unidadId === 'number' && !isNaN(Number(t.unidadId))) trabajadorData.unidadId = Number(t.unidadId);
            if (typeof t.rolId === 'number' && !isNaN(Number(t.rolId))) trabajadorData.rolId = Number(t.rolId);
            await prisma.trabajador.upsert({
              where: { id: typeof t.id === "number" && !isNaN(t.id) ? t.id : -1 },
              update: trabajadorData,
              create: trabajadorData,
            });
            ok++;
          } catch (e) {
            errors.trabajadores = errors.trabajadores || [];
            errors.trabajadores.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.trabajadores = { ok, fail };
      }
      // Productos
      const productosSheet = workbook.Sheets["Productos"];
      if (productosSheet) {
        const productos = XLSX.utils.sheet_to_json(productosSheet);
        let ok = 0, fail = 0;
        for (const [i, p] of (productos as Record<string, unknown>[]).entries()) {
          if (!p.codigo || !p.nombre) {
            errors.productos = errors.productos || [];
            errors.productos.push(`Fila ${i + 2}: Faltan campos obligatorios (codigo, nombre)`);
            fail++;
            continue;
          }
          try {
            await prisma.producto.upsert({
              where: { id: typeof p.id === "number" && !isNaN(p.id) ? p.id : -1 },
              update: { codigo: String(p.codigo), nombre: String(p.nombre), descripcion: String(p.descripcion), almacenId: p.almacenId ? Number(p.almacenId) : undefined },
              create: { codigo: String(p.codigo), nombre: String(p.nombre), descripcion: String(p.descripcion), almacenId: p.almacenId ? Number(p.almacenId) : undefined },
            });
            ok++;
          } catch (e) {
            errors.productos = errors.productos || [];
            errors.productos.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.productos = { ok, fail };
      }
      // Movimientos
      const movimientosSheet = workbook.Sheets["Movimientos"];
      if (movimientosSheet) {
        const movimientos = XLSX.utils.sheet_to_json(movimientosSheet);
        let ok = 0, fail = 0;
        for (const [i, m] of (movimientos as Record<string, unknown>[]).entries()) {
          if (!m.tipo || !m.fecha || !m.cantidad || !m.productoId || !m.almacenId) {
            errors.movimientos = errors.movimientos || [];
            errors.movimientos.push(`Fila ${i + 2}: Faltan campos obligatorios (tipo, fecha, cantidad, productoId, almacenId)`);
            fail++;
            continue;
          }
          try {
            const movimientoData: any = {
              tipo: String(m.tipo),
              fecha: new Date(String(m.fecha)),
              cantidad: Number(m.cantidad),
              precioUnitario: m.precioUnitario ? Number(m.precioUnitario) : undefined,
              motivo: String(m.motivo),
              factura: String(m.factura),
            };
            if (typeof m.productoId === 'number' && !isNaN(Number(m.productoId))) movimientoData.productoId = Number(m.productoId);
            if (typeof m.almacenId === 'number' && !isNaN(Number(m.almacenId))) movimientoData.almacenId = Number(m.almacenId);
            if (typeof m.ordenEntregaId === 'number' && !isNaN(Number(m.ordenEntregaId))) movimientoData.ordenEntregaId = Number(m.ordenEntregaId);
            await prisma.movimiento.upsert({
              where: { id: typeof m.id === "number" && !isNaN(m.id) ? m.id : -1 },
              update: movimientoData,
              create: movimientoData,
            });
            ok++;
          } catch (e) {
            errors.movimientos = errors.movimientos || [];
            errors.movimientos.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.movimientos = { ok, fail };
      }
      // OrdenesEntrega
      const ordenesSheet = workbook.Sheets["OrdenesEntrega"];
      if (ordenesSheet) {
        const ordenes = XLSX.utils.sheet_to_json(ordenesSheet);
        let ok = 0, fail = 0;
        for (const [i, o] of (ordenes as Record<string, unknown>[]).entries()) {
          if (!o.numeroTicket || !o.estado || !o.cantidad || !o.trabajadorId || !o.productoId || !o.almacenId) {
            errors.ordenesEntrega = errors.ordenesEntrega || [];
            errors.ordenesEntrega.push(`Fila ${i + 2}: Faltan campos obligatorios (numeroTicket, estado, cantidad, trabajadorId, productoId, almacenId)`);
            fail++;
            continue;
          }
          try {
            const ordenData: any = {
              numeroTicket: String(o.numeroTicket),
              fechaSolicitud: o.fechaSolicitud ? new Date(String(o.fechaSolicitud)) : undefined,
              fechaAprobacion: o.fechaAprobacion ? new Date(String(o.fechaAprobacion)) : undefined,
              estado: String(o.estado),
              cantidad: Number(o.cantidad),
              motivo: String(o.motivo),
              observaciones: String(o.observaciones),
            };
            if (typeof o.trabajadorId === 'number' && !isNaN(Number(o.trabajadorId))) ordenData.trabajadorId = Number(o.trabajadorId);
            if (typeof o.productoId === 'number' && !isNaN(Number(o.productoId))) ordenData.productoId = Number(o.productoId);
            if (typeof o.almacenId === 'number' && !isNaN(Number(o.almacenId))) ordenData.almacenId = Number(o.almacenId);
            await prisma.ordenEntrega.upsert({
              where: { id: typeof o.id === "number" && !isNaN(o.id) ? o.id : -1 },
              update: ordenData,
              create: ordenData,
            });
            ok++;
          } catch (e) {
            errors.ordenesEntrega = errors.ordenesEntrega || [];
            errors.ordenesEntrega.push(`Fila ${i + 2}: ${e instanceof Error ? e.message : e}`);
            fail++;
          }
        }
        results.ordenesEntrega = { ok, fail };
      }
      return res.status(200).json({ message: "Importación finalizada", results, errors });
    } catch (error) {
      return res.status(400).json({ error: "Error al procesar el archivo Excel" });
    }
  }

  if (req.method === "GET") {
    if (req.query.template !== undefined) {
      // Descargar plantilla de ejemplo
      const wb = XLSX.utils.book_new();
      // Ejemplo de estructura de hojas
      const productos = XLSX.utils.aoa_to_sheet([
        ["id", "codigo", "nombre", "descripcion", "almacenId"],
        [1, "P001", "Producto 1", "Descripción", 1],
      ]);
      const trabajadores = XLSX.utils.aoa_to_sheet([
        ["id", "nombre", "cargo", "email"],
        [1, "Juan Pérez", "Operario", "juan@empresa.com"],
      ]);
      // ... otras hojas
      XLSX.utils.book_append_sheet(wb, productos, "Productos");
      XLSX.utils.book_append_sheet(wb, trabajadores, "Trabajadores");
      // ...
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=plantilla_importacion.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    } else {
      // Exportar todos los datos a Excel
      // Obtener datos de la base de datos
      const productos = await prisma.producto.findMany();
      const trabajadores = await prisma.trabajador.findMany();
      const movimientos = await prisma.movimiento.findMany();
      const almacenes = await prisma.almacen.findMany();
      const unidades = await prisma.unidad.findMany();
      const ordenesEntrega = await prisma.ordenEntrega.findMany();
      // ...
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productos), "Productos");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trabajadores), "Trabajadores");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(movimientos), "Movimientos");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(almacenes), "Almacenes");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(unidades), "Unidades");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordenesEntrega), "OrdenesEntrega");
      // ...
      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Disposition", "attachment; filename=exportacion_completa.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buffer);
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end(`Método ${req.method} no permitido`);
} 