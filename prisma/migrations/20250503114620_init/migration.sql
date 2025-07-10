/*
  Warnings:

  - The primary key for the `detail_pengadaan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_detail_pengadaan` on the `detail_pengadaan` table. All the data in the column will be lost.
  - You are about to drop the `detail_produk` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `toko` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `satuan` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stok_produk` to the `produk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `detail_produk` DROP FOREIGN KEY `detail_produk_id_gudang_fkey`;

-- DropForeignKey
ALTER TABLE `detail_produk` DROP FOREIGN KEY `detail_produk_id_produk_fkey`;

-- DropForeignKey
ALTER TABLE `detail_produk` DROP FOREIGN KEY `detail_produk_id_toko_fkey`;

-- AlterTable
ALTER TABLE `detail_pengadaan` DROP PRIMARY KEY,
    DROP COLUMN `id_detail_pengadaan`,
    ADD PRIMARY KEY (`id_pengadaan`, `id_produk`);

-- AlterTable
ALTER TABLE `produk` ADD COLUMN `satuan` VARCHAR(191) NOT NULL,
    ADD COLUMN `stok_produk` INTEGER NOT NULL;

-- DropTable
DROP TABLE `detail_produk`;

-- DropTable
DROP TABLE `toko`;

-- CreateTable
CREATE TABLE `detail_gudang` (
    `id_produk` INTEGER NOT NULL,
    `id_gudang` INTEGER NOT NULL,
    `stok_gudang` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_produk`, `id_gudang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detail_gudang` ADD CONSTRAINT `detail_gudang_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_gudang` ADD CONSTRAINT `detail_gudang_id_gudang_fkey` FOREIGN KEY (`id_gudang`) REFERENCES `gudang`(`id_gudang`) ON DELETE CASCADE ON UPDATE CASCADE;
