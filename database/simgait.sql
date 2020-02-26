CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `repository` varchar(2048) NOT NULL,
  `branch` varchar(256) NOT NULL,
  `tag` varchar(256) NOT NULL,
  `simulator` varchar(256) NOT NULL,
  `version` varchar(256) NOT NULL,
  `published` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `request` (
  `id` int(11) NOT NULL,
  `user` int(11) DEFAULT NULL,
  `type` varchar(16) NOT NULL,
  `token` varchar(32) NOT NULL,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(254) NOT NULL,
  `username` varchar(39) NOT NULL,
  `password` varchar(64) DEFAULT NULL,
  `category` enum('developer','clinician','educator','administrator') NOT NULL,
  `enabled` tinyint(1) DEFAULT 0,
  `updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
  ADD KEY `user` (`user`);

ALTER TABLE `request`
  ADD PRIMARY KEY (`id`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
  ADD KEY `user` (`user`);

ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);
