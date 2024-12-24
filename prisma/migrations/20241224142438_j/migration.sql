/*
  Warnings:

  - You are about to drop the `Shorten` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Shorten`;

-- CreateTable
CREATE TABLE `shorten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shorten` VARCHAR(10) NOT NULL,
    `link` VARCHAR(512) NOT NULL,

    UNIQUE INDEX `shorten_shorten_key`(`shorten`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
