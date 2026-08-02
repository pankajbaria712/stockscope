-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 01, 2026 at 03:31 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stockscope`
--

-- --------------------------------------------------------

--
-- Table structure for table `compare_history`
--

CREATE TABLE `compare_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_one_symbol` varchar(20) NOT NULL,
  `company_two_symbol` varchar(20) NOT NULL,
  `compared_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `search_history`
--

CREATE TABLE `search_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `search_text` varchar(255) NOT NULL,
  `searched_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `avatar`, `role`, `is_verified`, `created_at`, `updated_at`) VALUES
(1, 'Pankaj', 'pankajbaria712@gmail.com', '$2b$12$oz6rES7yRFlb5mIdZYmLl.x5bDzIqgbtAtlSDFn94hOmkbUireJqm', NULL, 'user', 0, '2026-07-26 12:22:57', '2026-07-26 12:22:57'),
(2, 'Aarav Patel', 'aarav.patel@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(3, 'Priya Sharma', 'priya.sharma@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(4, 'Rohan Mehta', 'rohan.mehta@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(5, 'Ananya Verma', 'ananya.verma@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(6, 'Vikram Singh', 'vikram.singh@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(7, 'Neha Joshi', 'neha.joshi@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(8, 'Karan Desai', 'karan.desai@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(9, 'Sneha Nair', 'sneha.nair@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(10, 'Rahul Kumar', 'rahul.kumar@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(11, 'Isha Shah', 'isha.shah@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(12, 'Dev Patel', 'dev.patel@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(13, 'Meera Kapoor', 'meera.kapoor@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(14, 'Yash Trivedi', 'yash.trivedi@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(15, 'Kavya Reddy', 'kavya.reddy@example.com', 'password123', NULL, 'user', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52'),
(16, 'Admin User', 'admin@stockscope.com', 'password123', NULL, 'admin', 0, '2026-07-31 12:13:52', '2026-07-31 12:13:52');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `refresh_token` text NOT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `watchlists`
--

CREATE TABLE `watchlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stock_symbol` varchar(20) NOT NULL,
  `company_name` varchar(150) NOT NULL,
  `exchange` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `watchlists`
--

INSERT INTO `watchlists` (`id`, `user_id`, `stock_symbol`, `company_name`, `exchange`, `created_at`, `updated_at`) VALUES
(1, 1, 'RELIANCE.NS', 'Reliance Industries Limited', 'NSI', '2026-07-31 07:08:09', '2026-07-31 07:08:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `compare_history`
--
ALTER TABLE `compare_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_compare_history_user` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notifications_user` (`user_id`);

--
-- Indexes for table `search_history`
--
ALTER TABLE `search_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_search_history_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_sessions_user` (`user_id`);

--
-- Indexes for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_stock` (`user_id`,`stock_symbol`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `compare_history`
--
ALTER TABLE `compare_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `search_history`
--
ALTER TABLE `search_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `watchlists`
--
ALTER TABLE `watchlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `compare_history`
--
ALTER TABLE `compare_history`
  ADD CONSTRAINT `fk_compare_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `fk_search_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD CONSTRAINT `fk_watchlists_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
