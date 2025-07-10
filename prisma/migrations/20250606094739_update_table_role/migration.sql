/*
  Warnings:

  - Added the required column `id_role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `detail_pengadaan` DROP FOREIGN KEY `detail_pengadaan_id_pengadaan_fkey`;

-- DropForeignKey
ALTER TABLE `detail_pengadaan` DROP FOREIGN KEY `detail_pengadaan_id_produk_fkey`;

-- DropForeignKey
ALTER TABLE `detail_retur_customer` DROP FOREIGN KEY `detail_retur_customer_id_produk_fkey`;

-- DropForeignKey
ALTER TABLE `detail_retur_customer` DROP FOREIGN KEY `detail_retur_customer_id_retur_customer_fkey`;

-- DropForeignKey
ALTER TABLE `detail_retur_supplier` DROP FOREIGN KEY `detail_retur_supplier_id_produk_fkey`;

-- DropForeignKey
ALTER TABLE `detail_retur_supplier` DROP FOREIGN KEY `detail_retur_supplier_id_retur_supplier_fkey`;

-- DropForeignKey
ALTER TABLE `detail_transaksi` DROP FOREIGN KEY `detail_transaksi_id_produk_fkey`;

-- DropForeignKey
ALTER TABLE `detail_transaksi` DROP FOREIGN KEY `detail_transaksi_id_transaksi_fkey`;

-- DropForeignKey
ALTER TABLE `pengadaan` DROP FOREIGN KEY `pengadaan_id_supplier_fkey`;

-- DropForeignKey
ALTER TABLE `produk` DROP FOREIGN KEY `produk_id_kategori_fkey`;

-- DropForeignKey
ALTER TABLE `profit` DROP FOREIGN KEY `profit_id_transaksi_fkey`;

-- DropForeignKey
ALTER TABLE `retur_customer` DROP FOREIGN KEY `retur_customer_id_transaksi_fkey`;

-- DropForeignKey
ALTER TABLE `retur_supplier` DROP FOREIGN KEY `retur_supplier_id_pengadaan_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_customer_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_user_fkey`;

-- DropIndex
DROP INDEX `detail_pengadaan_id_produk_fkey` ON `detail_pengadaan`;

-- DropIndex
DROP INDEX `detail_retur_customer_id_produk_fkey` ON `detail_retur_customer`;

-- DropIndex
DROP INDEX `detail_retur_supplier_id_produk_fkey` ON `detail_retur_supplier`;

-- DropIndex
DROP INDEX `detail_transaksi_id_produk_fkey` ON `detail_transaksi`;

-- DropIndex
DROP INDEX `pengadaan_id_supplier_fkey` ON `pengadaan`;

-- DropIndex
DROP INDEX `produk_id_kategori_fkey` ON `produk`;

-- DropIndex
DROP INDEX `profit_id_transaksi_fkey` ON `profit`;

-- DropIndex
DROP INDEX `retur_customer_id_transaksi_fkey` ON `retur_customer`;

-- DropIndex
DROP INDEX `retur_supplier_id_pengadaan_fkey` ON `retur_supplier`;

-- DropIndex
DROP INDEX `transaksi_id_customer_fkey` ON `transaksi`;

-- DropIndex
DROP INDEX `transaksi_id_user_fkey` ON `transaksi`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `id_role` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `role` (
    `id_role` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `role_nama_role_key`(`nama_role`),
    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `role`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produk` ADD CONSTRAINT `produk_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_customer_fkey` FOREIGN KEY (`id_customer`) REFERENCES `customer`(`id_customer`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retur_customer` ADD CONSTRAINT `retur_customer_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_customer` ADD CONSTRAINT `detail_retur_customer_id_retur_customer_fkey` FOREIGN KEY (`id_retur_customer`) REFERENCES `retur_customer`(`id_retur_customer`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_customer` ADD CONSTRAINT `detail_retur_customer_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pengadaan` ADD CONSTRAINT `pengadaan_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `supplier`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pengadaan` ADD CONSTRAINT `detail_pengadaan_id_pengadaan_fkey` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan`(`id_pengadaan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pengadaan` ADD CONSTRAINT `detail_pengadaan_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retur_supplier` ADD CONSTRAINT `retur_supplier_id_pengadaan_fkey` FOREIGN KEY (`id_pengadaan`) REFERENCES `pengadaan`(`id_pengadaan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_supplier` ADD CONSTRAINT `detail_retur_supplier_id_retur_supplier_fkey` FOREIGN KEY (`id_retur_supplier`) REFERENCES `retur_supplier`(`id_retur_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur_supplier` ADD CONSTRAINT `detail_retur_supplier_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profit` ADD CONSTRAINT `profit_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_stok` ADD CONSTRAINT `audit_stok_id_gudang_fkey` FOREIGN KEY (`id_gudang`) REFERENCES `gudang`(`id_gudang`) ON DELETE SET NULL ON UPDATE CASCADE;
