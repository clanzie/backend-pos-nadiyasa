/*
  Warnings:

  - The primary key for the `detail_transaksi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_detail_transaksi` on the `detail_transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `total_profit` on the `profit` table. All the data in the column will be lost.
  - Added the required column `nominal` to the `profit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `detail_transaksi` DROP PRIMARY KEY,
    DROP COLUMN `id_detail_transaksi`,
    ADD PRIMARY KEY (`id_transaksi`, `id_produk`);

-- AlterTable
ALTER TABLE `profit` DROP COLUMN `total_profit`,
    ADD COLUMN `nominal` DOUBLE NOT NULL;

-- CreateTable
CREATE TABLE `retur_customer` (
    `id_retur_customer` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `invoice` VARCHAR(191) NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `tanggal_retur` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_retur_customer`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_retur_customer` (
    `id_retur_customer` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `alasan` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_retur_customer`, `id_produk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retur_supplier` (
    `id_retur_supplier` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pengadaan` INTEGER NOT NULL,
    `alasan` VARCHAR(191) NOT NULL,
    `tanggal_retur` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_retur_supplier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_retur_supplier` (
    `id_retur_supplier` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `alasan` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_retur_supplier`, `id_produk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_stok` (
    `id_audit` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produk` INTEGER NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `id_gudang` INTEGER NULL,
    `id_transaksi` INTEGER NULL,
    `id_pengadaan` INTEGER NULL,
    `id_retur_supplier` INTEGER NULL,
    `id_retur_customer` INTEGER NULL,
    `keterangan` VARCHAR(191) NULL,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_audit`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `retur_customer` ADD CONSTRAINT `retur_customer_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_customer` ADD CONSTRAINT `detail_retur_customer_id_retur_customer_fkey` FOREIGN KEY (`id_retur_customer`) REFERENCES `retur_customer`(`id_retur_customer`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_customer` ADD CONSTRAINT `detail_retur_customer_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retur_supplier` ADD CONSTRAINT `retur_supplier_id_pengadaan_fkey` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan`(`id_pengadaan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_supplier` ADD CONSTRAINT `detail_retur_supplier_id_retur_supplier_fkey` FOREIGN KEY (`id_retur_supplier`) REFERENCES `retur_supplier`(`id_retur_supplier`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_supplier` ADD CONSTRAINT `detail_retur_supplier_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_pengadaan_fkey` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan`(`id_pengadaan`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_retur_customer_fkey` FOREIGN KEY (`id_retur_customer`) REFERENCES `retur_customer`(`id_retur_customer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_retur_supplier_fkey` FOREIGN KEY (`id_retur_supplier`) REFERENCES `retur_supplier`(`id_retur_supplier`) ON DELETE SET NULL ON UPDATE CASCADE;
