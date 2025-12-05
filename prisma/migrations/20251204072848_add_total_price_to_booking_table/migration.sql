/*
  Warnings:

  - You are about to drop the column `checkIn` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `check_in` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `check_out` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `checkIn`,
    DROP COLUMN `checkOut`,
    ADD COLUMN `check_in` DATETIME(3) NOT NULL,
    ADD COLUMN `check_out` DATETIME(3) NOT NULL,
    ADD COLUMN `totalPrice` DECIMAL(10, 2) NOT NULL;
