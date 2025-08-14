/*
  Warnings:

  - Added the required column `segmentoId` to the `proveedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proveedores" ADD COLUMN     "segmentoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "segmentos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "segmentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "segmentos_nombre_key" ON "segmentos"("nombre");

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_segmentoId_fkey" FOREIGN KEY ("segmentoId") REFERENCES "segmentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
