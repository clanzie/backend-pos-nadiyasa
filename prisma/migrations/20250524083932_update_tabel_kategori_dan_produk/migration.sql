/*
  Warnings:

  - You are about to drop the column `deskripsi_kategori` on the `kategori` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi_produk` on the `produk` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `kategori` DROP COLUMN `deskripsi_kategori`;

-- AlterTable
ALTER TABLE `produk` DROP COLUMN `deskripsi_produk`;
