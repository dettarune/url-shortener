-- CreateTable
CREATE TABLE `Shorten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shorten` VARCHAR(10) NOT NULL,
    `link` VARCHAR(512) NOT NULL,

    UNIQUE INDEX `Shorten_shorten_key`(`shorten`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
