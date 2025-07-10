/*
  Warnings:

  - Added the required column `jenis` to the `detail_retur_customer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `detail_retur_customer` ADD COLUMN `jenis` VARCHAR(191) NOT NULL;
