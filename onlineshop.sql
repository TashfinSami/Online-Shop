-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 18, 2024 at 06:18 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onlineshop`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `ID` int(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` int(100) NOT NULL,
  `Details` varchar(4000) NOT NULL,
  `image_add` varchar(4000) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `ID` int(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `adress1` varchar(255) NOT NULL,
  `adress2` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `zipcode` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`ID`, `email`, `password`, `name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES
(10, 'customer1@gmail.com', '142584', 'Dastan Sheikh', 'Barishal to Khulna Highyway', 'Barishal to Khulna Highyway', 'Barisal', 'kolapara', 8206),
(11, 'customer2@gmail.com', '142584', 'Abdullah Rahman', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(12, 'customer3@gmail.com', '142584', 'Fatima Akhtar', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(13, 'customer4@gmail.com', '142584', 'Ahmed Ali', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(14, 'customer5@gmail.com', '142584', 'Ayesha Begum', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(15, 'customer6@gmail.com', '142584', 'Kamal Uddin', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(16, 'customer7@gmail.com', '142584', 'Farida Khatun', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(17, 'customer8@gmail.com', '142584', 'Ibrahim Hasan', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(18, 'customer9@gmail.com', '142584', 'Nasrin Akter', 'Barishal', '', 'Barishal', 'Barishal', 8200),
(19, 'customer10@gmail.com', '142584', 'Shafiqul Islam', 'Barishal', '', 'Barishal', 'Barishal', 8200);

-- --------------------------------------------------------

--
-- Table structure for table `dev`
--

CREATE TABLE `dev` (
  `ID` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `adress1` varchar(255) DEFAULT NULL,
  `adress2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dev`
--

INSERT INTO `dev` (`ID`, `email`, `password`, `name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES
(1, 'hrkhan@gmail.com', '142584', 'HR Khan Ratin', '123 Main St', 'Apt 4B', 'New York', 'NY', 12345),
(4, 'dev4@gmail.com', '142584', 'Mita Das', 'Rajshahi', NULL, 'Rajshahi', 'Rajshahi', 6000),
(5, 'dev2@gmail.com', '142584', 'Jane Smith', 'Chittagong', NULL, 'Chittagong', 'Chittagong', 4100),
(6, 'dev9@gmail.com', '142584', 'Shafiqul Islam', 'Comilla', NULL, 'Comilla', 'Comilla', 3500);

-- --------------------------------------------------------

--
-- Table structure for table `dev_approve`
--

CREATE TABLE `dev_approve` (
  `ID` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `adress1` varchar(255) DEFAULT NULL,
  `adress2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dev_approve`
--

INSERT INTO `dev_approve` (`ID`, `email`, `password`, `name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES
(6, 'dev1@gmail.com', '142584', 'John Doe', 'Dhaka', NULL, 'Dhaka', 'Dhaka', 1200),
(8, 'dev3@gmail.com', '142584', 'Ahmed Rahman', 'Sylhet', NULL, 'Sylhet', 'Sylhet', 3100),
(10, 'dev5@gmail.com', '142584', 'Kamal Uddin', 'Khulna', NULL, 'Khulna', 'Khulna', 9000),
(11, 'dev6@gmail.com', '142584', 'Farida Begum', 'Barisal', NULL, 'Barisal', 'Barisal', 8200),
(12, 'dev7@gmail.com', '142584', 'Ibrahim Hasan', 'Rangpur', NULL, 'Rangpur', 'Rangpur', 5400),
(13, 'dev8@gmail.com', '142584', 'Nasrin Akter', 'Mymensingh', NULL, 'Mymensingh', 'Mymensingh', 2200),
(15, 'dev10@gmail.com', '142584', 'Fatima Rahman', 'Dinajpur', NULL, 'Dinajpur', 'Dinajpur', 2100);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `tracking_number` int(11) NOT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `quantity` varchar(10) DEFAULT NULL,
  `customer_id` varchar(10) DEFAULT NULL,
  `customer_status` varchar(255) DEFAULT 'Order Placed',
  `seller_status` varchar(255) NOT NULL DEFAULT 'Order Placed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`tracking_number`, `product_id`, `quantity`, `customer_id`, `customer_status`, `seller_status`) VALUES
(43, '26', '3', '10', 'Received from Seller', 'Payment Received'),
(44, '24', '1', '10', 'Order Placed', 'Order Placed'),
(45, '25', '4', '10', 'Order Placed', 'Order Placed'),
(46, '27', '1', '10', 'Order Placed', 'Order Placed'),
(47, '25', '1', '10', 'Order Placed', 'Order Placed'),
(48, '27', '1', '10', 'Order Placed', 'Order Placed'),
(49, '26', '1', '10', 'Order Placed', 'Order Placed');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `seller_id` int(255) NOT NULL,
  `p_name` varchar(255) NOT NULL,
  `price` int(100) NOT NULL,
  `Details` varchar(4000) NOT NULL,
  `image_add` varchar(4000) NOT NULL,
  `product_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seller`
--

CREATE TABLE `seller` (
  `ID` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `adress1` varchar(255) DEFAULT NULL,
  `adress2` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seller`
--

INSERT INTO `seller` (`ID`, `email`, `password`, `name`, `adress1`, `adress2`, `city`, `state`, `zipcode`) VALUES
(8, 'seller1@gmail.com', '142584', 'HR khan Ratin', 'KalusahSarak,Barisal', 'new college row', 'Barisal', '...', 8200),
(10, 'seller2@gmail.com', '142584', 'Kothon Haldar', 'Chittagong', NULL, 'Chittagong', 'Chittagong', 4100),
(11, 'seller3@gmail.com', '142584', 'Ahmed Rahman', 'Sylhet', NULL, 'Sylhet', 'Sylhet', 3100),
(12, 'seller4@gmail.com', '142584', 'Mita Das', 'Rajshahi', NULL, 'Rajshahi', 'Rajshahi', 6000),
(13, 'seller5@gmail.com', '142584', 'Kamal Uddin', 'Khulna', NULL, 'Khulna', 'Khulna', 9000),
(14, 'seller6@gmail.com', '142584', 'Farida Begum', 'Barisal', NULL, 'Barisal', 'Barisal', 8200),
(15, 'seller7@gmail.com', '142584', 'Ibrahim Hasan', 'Rangpur', NULL, 'Rangpur', 'Rangpur', 5400),
(16, 'seller8@gmail.com', '142584', 'Nasrin Akter', 'Mymensingh', NULL, 'Mymensingh', 'Mymensingh', 2200),
(17, 'seller9@gmail.com', '142584', 'Shafiqul Islam', 'Comilla', NULL, 'Comilla', 'Comilla', 3500),
(18, 'seller10@gmail.com', '142584', 'Fatima Rahman', 'Dinajpur', NULL, 'Dinajpur', 'Dinajpur', 2100);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('FFE5nS7MB7zO_-P9updcJ_JO5p0jkI7Z', 1708189834, '{\"cookie\":{\"originalMaxAge\":2591999999,\"expires\":\"2024-02-17T17:09:45.862Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":8,\"name\":\"HR khan Ratin\",\"account_type\":\"seller\"},\"isAuthenticated\":true}'),
('QWlLIrEFSvjAYtN7s5O22iAcJ3UDRk8D', 1706178036, '{\"cookie\":{\"originalMaxAge\":2592000000,\"expires\":\"2024-01-25T10:20:06.143Z\",\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"id\":10,\"name\":\"Dastan Sheikh\",\"account_type\":\"customer\"},\"isAuthenticated\":true}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `ID` (`ID`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID` (`ID`);

--
-- Indexes for table `dev`
--
ALTER TABLE `dev`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `dev_approve`
--
ALTER TABLE `dev_approve`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`tracking_number`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `ID` (`seller_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `seller`
--
ALTER TABLE `seller`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID` (`ID`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=280;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `ID` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `dev`
--
ALTER TABLE `dev`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dev_approve`
--
ALTER TABLE `dev_approve`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `tracking_number` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `seller`
--
ALTER TABLE `seller`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
