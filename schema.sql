-- Egay's Woodwork — database schema
-- Import this into your hosted MySQL before the first deploy:
--   mysql -h <host> -P <port> -u <user> -p <database> < schema.sql
-- The rate_hits table is also created automatically at runtime if missing.

CREATE TABLE IF NOT EXISTS `artworks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `category` varchar(100) NOT NULL,
  `medium` varchar(255) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `year_created` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` enum('Available','Display','Sold','Reserved') DEFAULT 'Available',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `artwork_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_artwork_id` (`artwork_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `inquiries_ibfk_1` FOREIGN KEY (`artwork_id`) REFERENCES `artworks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `rate_hits` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `bucket` varchar(190) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bucket_time` (`bucket`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

