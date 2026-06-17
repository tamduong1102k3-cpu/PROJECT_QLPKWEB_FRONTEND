-- Create database if not exists (docker-compose handles this via MYSQL_DATABASE env)
-- This file runs on first container startup

CREATE TABLE IF NOT EXISTS `database_init` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `init_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);