/*
  Warnings:

  - A unique constraint covering the columns `[invoice]` on the table `transaksi` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `transaksi_invoice_key` ON `transaksi`(`invoice`);
