CREATE TABLE `project` (
  `id` int NOT NULL,
  `title` varchar(256) NOT NULL,
  `user` int NOT NULL,
  `url` varchar(2048) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `public` tinyint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `request` (
  `id` int NOT NULL,
  `user` int DEFAULT NULL,
  `type` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `token` varchar(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `id` int NOT NULL,
  `email` varchar(254) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `username` varchar(39) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `password` varchar(64) CHARACTER SET ascii COLLATE ascii_bin DEFAULT NULL,
  `category` enum('developer','clinician','educator','administrator') CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `enabled` tinyint DEFAULT 0,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `animation` (
  `id` int NOT NULL,
  `uploaded` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` varchar(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `duration` int NOT NULL,
  `size` int NOT NULL,
  `viewed` int NOT NULL DEFAULT '0',
  `user` int NOT NULL,
  `branch` varchar(256) CHARACTER SET ascii COLLATE ascii_bin NOT NULL DEFAULT 'main',
  `uploading` bit(1) DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

ALTER TABLE `request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

ALTER TABLE `project`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `request`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `animation`
  ADD PRIMARY KEY (`id`) USING BTREE;
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
