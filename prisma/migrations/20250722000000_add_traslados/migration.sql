-- CreateTable
CREATE TABLE "Traslado" (
  "id" SERIAL NOT NULL,
  "numeroGuia" TEXT NOT NULL,
  "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaAprobacion" TIMESTAMP(3),
  "estado" TEXT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "observaciones" TEXT,
  "productoId" INTEGER NOT NULL,
  "almacenOrigenId" INTEGER NOT NULL,
  "almacenDestinoId" INTEGER NOT NULL,
  "trabajadorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Traslado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Traslado_numeroGuia_key" ON "Traslado"("numeroGuia");

-- AddForeignKey
ALTER TABLE "Traslado" ADD CONSTRAINT "Traslado_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traslado" ADD CONSTRAINT "Traslado_almacenOrigenId_fkey" FOREIGN KEY ("almacenOrigenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traslado" ADD CONSTRAINT "Traslado_almacenDestinoId_fkey" FOREIGN KEY ("almacenDestinoId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traslado" ADD CONSTRAINT "Traslado_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "Trabajador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
