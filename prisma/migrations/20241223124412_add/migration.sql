/*
  Warnings:

  - A unique constraint covering the columns `[shorten]` on the table `Shorten` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Shorten_shorten_key` ON `Shorten`(`shorten`);
