/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,name]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `rooms_owner_id_name_key` ON `rooms`(`owner_id`, `name`);
