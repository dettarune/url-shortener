-- CreateTable
CREATE TABLE `Shorten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shorten` VARCHAR(512) NOT NULL,
    `link` VARCHAR(512) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
