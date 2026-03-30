-- CreateTable: OrdenVolumen (cabecera)
CREATE TABLE "OrdenVolumen" (
    "id" SERIAL NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAprobacion" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "trabajadorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdenVolumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ItemOrdenVolumen (detalle)
CREATE TABLE "ItemOrdenVolumen" (
    "id" SERIAL NOT NULL,
    "ordenId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "almacenId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,

    CONSTRAINT "ItemOrdenVolumen_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "OrdenVolumen_numeroTicket_key" ON "OrdenVolumen"("numeroTicket");

-- AddForeignKey
ALTER TABLE "OrdenVolumen" ADD CONSTRAINT "OrdenVolumen_trabajadorId_fkey"
    FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrdenVolumen" ADD CONSTRAINT "ItemOrdenVolumen_ordenId_fkey"
    FOREIGN KEY ("ordenId") REFERENCES "OrdenVolumen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrdenVolumen" ADD CONSTRAINT "ItemOrdenVolumen_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrdenVolumen" ADD CONSTRAINT "ItemOrdenVolumen_almacenId_fkey"
    FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
