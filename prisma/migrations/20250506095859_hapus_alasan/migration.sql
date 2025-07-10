/*
  Warnings:

  - You are about to drop the column `alasan` on the `retur_customer` table. All the data in the column will be lost.
  - You are about to drop the column `alasan` on the `retur_supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `retur_customer` DROP COLUMN `alasan`;

-- AlterTable
ALTER TABLE `retur_supplier` DROP COLUMN `alasan`;
