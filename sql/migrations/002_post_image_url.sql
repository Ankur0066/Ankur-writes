-- Run once against an existing blog_db. New installations should run create_tables.sql.
USE `blog_db`;

ALTER TABLE `posts`
  ADD COLUMN `image_url` VARCHAR(2048) DEFAULT NULL AFTER `summary`;
