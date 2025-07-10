/*
  Warnings:

  - You are about to drop the column `createdAt` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `detail_pengadaan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `detail_pengadaan` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `detail_produk` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `detail_produk` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `detail_transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `detail_transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `gudang` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `gudang` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `kategori` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `kategori` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `keranjang` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `keranjang` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `pengadaan` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `pengadaan` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `produk` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `profit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `profit` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `toko` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `toko` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `transaksi` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `detail_pengadaan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `detail_produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `detail_transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `gudang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `kategori` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `keranjang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `pengadaan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `profit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `toko` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `transaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `detail_pengadaan` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `detail_produk` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `detail_transaksi` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `gudang` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `kategori` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `keranjang` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `pengadaan` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `produk` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `profit` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `toko` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `transaksi` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `create_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;
