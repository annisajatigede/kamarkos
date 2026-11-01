-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: kamarkos_db
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('UTILITY','MAINTENANCE','SALARY','INTERNET','TAX','SUPPLIES','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHER',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `receipt` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `expenses_propertyId_fkey` (`propertyId`),
  CONSTRAINT `expenses_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES ('cmvy259v2001hfm6kgu5dihre','cmvy259re0008fm6kbm2d4mws','UTILITY','Token Listrik Prabayar Induk & Koridor',1250000,'2026-11-02 17:00:00.000',NULL,'Pengisian token PLN prabayar 1.250.000','2026-11-01 16:41:57.806','2026-11-01 16:41:57.806'),('cmvy259v2001ifm6kqrov03py','cmvy259re0008fm6kbm2d4mws','INTERNET','Tagihan WiFi Indihome Fiber 100 Mbps',650000,'2026-11-04 17:00:00.000',NULL,'Paket internet dedicated kost','2026-11-01 16:41:57.806','2026-11-01 16:41:57.806'),('cmvy259v2001jfm6k3oxt2koc','cmvy259re0008fm6kbm2d4mws','UTILITY','Tagihan Air PDAM Tirta Medal',320000,'2026-11-05 17:00:00.000',NULL,'Air PDAM lancar','2026-11-01 16:41:57.806','2026-11-01 16:41:57.806'),('cmvy259v2001kfm6k9escs151','cmvy259re0008fm6kbm2d4mws','MAINTENANCE','Servis Berkala & Cuci AC 4 Unit',450000,'2026-11-07 17:00:00.000',NULL,'Cuci AC kamar 101, 102, 104, dan 201 oleh teknisi langganan','2026-11-01 16:41:57.806','2026-11-01 16:41:57.806'),('cmvy259v2001lfm6ksmnwrzkk','cmvy259re0008fm6kbm2d4mws','SALARY','Gaji Petugas Kebersihan & Jaga Malam',1800000,'2026-10-31 17:00:00.000',NULL,'Honor bulanan Mas Supri','2026-11-01 16:41:57.806','2026-11-01 16:41:57.806');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `leaseId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `paidDate` datetime(3) DEFAULT NULL,
  `status` enum('UNPAID','PAID','OVERDUE','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UNPAID',
  `items` text COLLATE utf8mb4_unicode_ci,
  `snapToken` text COLLATE utf8mb4_unicode_ci,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentProof` text COLLATE utf8mb4_unicode_ci,
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoices_invoiceNumber_key` (`invoiceNumber`),
  KEY `invoices_leaseId_fkey` (`leaseId`),
  KEY `invoices_tenantId_fkey` (`tenantId`),
  CONSTRAINT `invoices_leaseId_fkey` FOREIGN KEY (`leaseId`) REFERENCES `leases` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoices_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES ('cmvy259ud001afm6kkmmow18p','INV-202410-0001','cmvy259tx0014fm6kfnud0chk','cmvy259qv0002fm6kgxxl7fto',1800000,'2026-10-04 17:00:00.000','2026-10-04 17:00:00.000','PAID','[{\"title\":\"Sewa Kamar 101 (Deluxe Queen AC)\",\"amount\":1800000}]',NULL,'MIDTRANS',NULL,'Lunas otomatis via Midtrans BCA VA','2026-11-01 16:41:57.782','2026-11-01 16:41:57.782'),('cmvy259uk001cfm6kvtzkkkzx','INV-202411-0002','cmvy259tx0014fm6kfnud0chk','cmvy259qv0002fm6kgxxl7fto',1800000,'2026-11-04 17:00:00.000','2026-11-01 17:03:51.469','PAID','[{\"title\":\"Sewa Kamar 101 (Deluxe Queen AC) - Bulan Berjalan\",\"amount\":1800000}]','MOCK-SNAP-TOKEN-INV-202411-0002-1356-1793552631356','MIDTRANS_BCA',NULL,'Diverifikasi dan dilunasi oleh H. Hendra Wijaya (Owner) pada 02 November 2026','2026-11-01 16:41:57.789','2026-11-01 17:03:51.473'),('cmvy259uq001efm6kzv5iqa5o','INV-202411-0003','cmvy259u30016fm6kwkyqcrzi','cmvy259r20004fm6k8nk92k2r',1400000,'2026-11-14 17:00:00.000','2026-11-11 17:00:00.000','PAID','[{\"title\":\"Sewa Kamar 102 (Standard Single AC)\",\"amount\":1400000}]',NULL,'MANUAL_TRANSFER','https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80','Bukti transfer BCA telah diverifikasi staff','2026-11-01 16:41:57.794','2026-11-01 16:41:57.794'),('cmvy259uw001gfm6k1dmmk9mf','INV-202411-0004','cmvy259u80018fm6kll098pid','cmvy259r80006fm6k7va1jhkp',900000,'2026-10-26 17:00:00.000',NULL,'OVERDUE','[{\"title\":\"Sewa Kamar 106 (Economy Cozy Fan)\",\"amount\":900000}]',NULL,NULL,NULL,'Sudah terlambat 5 hari, telah dikirimi pengingat WA','2026-11-01 16:41:57.801','2026-11-01 16:41:57.801');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leases`
--

DROP TABLE IF EXISTS `leases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leases` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `billingCycle` enum('MONTHLY','QUARTERLY','ANNUALLY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTHLY',
  `rentAmount` double NOT NULL,
  `depositAmount` double NOT NULL DEFAULT '0',
  `status` enum('PENDING','ACTIVE','EXPIRED','TERMINATED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leases_tenantId_fkey` (`tenantId`),
  KEY `leases_roomId_fkey` (`roomId`),
  CONSTRAINT `leases_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `leases_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leases`
--

LOCK TABLES `leases` WRITE;
/*!40000 ALTER TABLE `leases` DISABLE KEYS */;
INSERT INTO `leases` VALUES ('cmvy259tx0014fm6kfnud0chk','cmvy259qv0002fm6kgxxl7fto','cmvy259s5000gfm6kgpdi9v56','2026-08-31 17:00:00.000','2027-08-31 17:00:00.000','MONTHLY',1800000,500000,'ACTIVE','Kontrak 1 tahun, bayar per bulan setiap tgl 1','2026-11-01 16:41:57.765','2026-11-01 16:41:57.765'),('cmvy259u30016fm6kwkyqcrzi','cmvy259r20004fm6k8nk92k2r','cmvy259sb000ifm6kz3mrmk7k','2026-10-14 17:00:00.000','2027-04-14 17:00:00.000','MONTHLY',1400000,300000,'ACTIVE','Kontrak 6 bulan','2026-11-01 16:41:57.771','2026-11-01 16:41:57.771'),('cmvy259u80018fm6kll098pid','cmvy259r80006fm6k7va1jhkp','cmvy259sw000qfm6kkk1qce1j','2026-08-09 17:00:00.000','2027-02-09 17:00:00.000','MONTHLY',900000,200000,'ACTIVE','Kontrak 6 bulan','2026-11-01 16:41:57.776','2026-11-01 16:41:57.776');
/*!40000 ALTER TABLE `leases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_requests`
--

DROP TABLE IF EXISTS `maintenance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_requests` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('PLUMBING','ELECTRICAL','FURNITURE','AIR_CONDITIONER','CLEANING','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTHER',
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('LOW','MEDIUM','HIGH','URGENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` enum('REPORTED','IN_PROGRESS','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REPORTED',
  `photo` text COLLATE utf8mb4_unicode_ci,
  `cost` double DEFAULT '0',
  `repairNotes` text COLLATE utf8mb4_unicode_ci,
  `resolvedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `maintenance_requests_tenantId_fkey` (`tenantId`),
  KEY `maintenance_requests_roomId_fkey` (`roomId`),
  CONSTRAINT `maintenance_requests_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `maintenance_requests_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES ('cmvy259v9001nfm6km15vm43o','cmvy259r20004fm6k8nk92k2r','cmvy259sb000ifm6kz3mrmk7k','PLUMBING','Keran wastafel kamar mandi rembes air','Halo mas admin, keran wastafel di kamar mandi bawah agak rembes dan netes terus walau sudah diputar kencang. Mohon dicek seal karetnya ya.','MEDIUM','IN_PROGRESS','https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&auto=format&fit=crop&q=80',0,'Sudah dicek oleh Pak Joko, besok diganti seal karet baru.',NULL,'2026-11-01 16:41:57.813','2026-11-01 16:41:57.813'),('cmvy259vf001pfm6kjmo3spur','cmvy259qv0002fm6kgxxl7fto','cmvy259s5000gfm6kgpdi9v56','AIR_CONDITIONER','AC mengeluarkan suara getar saat menyala','Unit indoor AC sesekali bergetar agak bising waktu malam hari, mohon dibantu pembersihan filternya.','HIGH','REPORTED',NULL,0,NULL,NULL,'2026-11-01 16:41:57.819','2026-11-01 16:41:57.819'),('cmvy259vl001rfm6kg9cn50wq','cmvy259r80006fm6k7va1jhkp','cmvy259sw000qfm6kkk1qce1j','ELECTRICAL','Lampu kamar mandi mati','Lampu LED kamar mandi putus tiba-tiba tadi pagi.','LOW','COMPLETED',NULL,45000,'Sudah diganti dengan lampu Philips LED 9W oleh staff pada hari yang sama.','2026-10-29 17:00:00.000','2026-11-01 16:41:57.825','2026-11-01 16:41:57.825');
/*!40000 ALTER TABLE `maintenance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_userId_fkey` (`userId`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoiceId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transactionNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gatewayTransactionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` double NOT NULL,
  `paymentType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','SUCCESS','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `rawResponse` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_transactions_transactionNumber_key` (`transactionNumber`),
  KEY `payment_transactions_invoiceId_fkey` (`invoiceId`),
  CONSTRAINT `payment_transactions_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
INSERT INTO `payment_transactions` VALUES ('cmvy2xfer0001hs1als9bgyen','cmvy259uk001cfm6kvtzkkkzx','TX-1793552631362',NULL,1800000,'midtrans_snap','PENDING','{\"token\":\"MOCK-SNAP-TOKEN-INV-202411-0002-1356-1793552631356\",\"redirectUrl\":\"https://app.sandbox.midtrans.com/snap/v2/vtweb/MOCK-SNAP-TOKEN-INV-202411-0002-1356-1793552631356\",\"isMock\":true}','2026-11-01 17:03:51.364'),('cmvy2xfhu0004hs1a421x5x61','cmvy259uk001cfm6kvtzkkkzx','TX-VERIFIED-1793552631473',NULL,1800000,'MIDTRANS_BCA','SUCCESS','{\"verifiedBy\":\"H. Hendra Wijaya (Owner)\",\"verifiedAt\":\"2026-11-01T17:03:51.469Z\"}','2026-11-01 17:03:51.475');
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `rules` text COLLATE utf8mb4_unicode_ci,
  `images` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `properties_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES ('cmvy259re0008fm6kbm2d4mws','KamarKos Residence Jatinangor','kamarkos-residence-jatinangor','Jl. Raya Jatinangor No. 88, Hegarmanah, Dekat Gerbang Lama UNPAD','Sumedang','Jatinangor','Hunian kost modern, bersih, dan representatif dengan fasilitas lengkap seperti hotel. Sangat strategis hanya 3 menit ke kampus UNPAD & ITB Jatinangor. Dilengkapi keamanan 24 jam dengan CCTV, akses kartu digital, WiFi 100 Mbps fiber optic, dapur bersama lengkap, dan area rooftop santai.','[\"Tamu lawan jenis dilarang masuk ke dalam kamar tidur.\",\"Jam tenang lingkungan berlaku pukul 22.00 - 06.00 WIB demi kenyamanan bersama.\",\"Dilarang merokok dan membawa hewan peliharaan di dalam area kamar AC.\",\"Wajib menjaga kebersihan dapur bersama dan buang sampah pada tempatnya.\",\"Pembayaran sewa dilakukan paling lambat tanggal jatuh tempo setiap bulan.\"]','[\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80\"]','2026-11-01 16:41:57.675','2026-11-01 16:41:57.675');
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenantId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_propertyId_fkey` (`propertyId`),
  KEY `reviews_roomId_fkey` (`roomId`),
  KEY `reviews_tenantId_fkey` (`tenantId`),
  CONSTRAINT `reviews_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reviews_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('cmvy259vr001sfm6k01jd4t0l','cmvy259re0008fm6kbm2d4mws','cmvy259s5000gfm6kgpdi9v56','cmvy259qv0002fm6kgxxl7fto',5,'Kamar sangat nyaman dan bersih, fasilitas sesuai deskripsi, WiFi ngebut banget buat nugas dan streaming kuliah online. Pengelolanya juga ramah dan responsif!',1,'2026-11-01 16:41:57.832','2026-11-01 16:41:57.832'),('cmvy259vr001tfm6kdc2c4liz','cmvy259re0008fm6kbm2d4mws','cmvy259sb000ifm6kz3mrmk7k','cmvy259r20004fm6k8nk92k2r',5,'Lingkungan sangat tenang dan aman, CCTV ada di setiap sudut. Dapur bersama selalu bersih. Sangat direkomendasikan untuk mahasiswa/pekerja di Jatinangor.',1,'2026-11-01 16:41:57.832','2026-11-01 16:41:57.832'),('cmvy259vr001ufm6ka9n26aav','cmvy259re0008fm6kbm2d4mws','cmvy259sw000qfm6kkk1qce1j','cmvy259r80006fm6k7va1jhkp',4,'Kost strategis dekat tempat makan dan minimarket. Kamar ekonomi tetap nyaman walau kamar mandi luar karena selalu dijaga kebersihannya tiap hari.',1,'2026-11-01 16:41:57.832','2026-11-01 16:41:57.832');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_types` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `basePrice` double NOT NULL,
  `deposit` double NOT NULL DEFAULT '0',
  `size` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facilities` text COLLATE utf8mb4_unicode_ci,
  `images` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `room_types_propertyId_fkey` (`propertyId`),
  CONSTRAINT `room_types_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES ('cmvy259rl000afm6k9ajsnaa7','cmvy259re0008fm6kbm2d4mws','Deluxe Queen AC','Kamar paling luas dan nyaman dengan ranjang Queen Size, Smart TV, kamar mandi dalam dengan water heater, dan meja kerja luas.',1800000,500000,'4 x 4 meter','[\"AC 1 PK Daikin Hemat Energi\",\"Kamar Mandi Dalam + Water Heater\",\"Kasur Queen Size 160x200 (Springbed)\",\"Smart TV 32 Inch (YouTube & Netflix)\",\"Lemari Pakaian 2 Pintu + Cermin Full Body\",\"Meja Belajar / Kerja Ergonomis + Kursi Busa\",\"Koneksi WiFi Fiber Optik Dedicated\",\"Kulkas Mini Portable\",\"Jendela Menghadap Taman Luar\"]','[\"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80\"]','2026-11-01 16:41:57.682','2026-11-01 16:41:57.682'),('cmvy259rs000cfm6kvr7b5alh','cmvy259re0008fm6kbm2d4mws','Standard Single AC','Pilihan favorit mahasiswa dan pekerja. Dilengkapi AC dingin, kamar mandi dalam, kasur single berkualitas, dan suasana tenang untuk istirahat.',1400000,300000,'3.5 x 3.5 meter','[\"AC 1/2 PK Dingin\",\"Kamar Mandi Dalam (Shower & Kloset Duduk)\",\"Kasur Single 120x200 Nyaman\",\"Lemari Pakaian Kayu Minimalis\",\"Meja Kerja & Kursi\",\"WiFi Gratis Kecepatan Tinggi\",\"Ventilasi & Sirkulasi Udara Baik\"]','[\"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&auto=format&fit=crop&q=80\"]','2026-11-01 16:41:57.688','2026-11-01 16:41:57.688'),('cmvy259ry000efm6kkxaoxs9y','cmvy259re0008fm6kbm2d4mws','Economy Cozy Fan','Hemat dan fungsional. Sangat cocok bagi mahasiswa yang mencari hunian nyaman terjangkau dengan sirkulasi udara sejuk.',900000,200000,'3 x 3 meter','[\"Exhaust Fan & Ceiling Fan Sejuk\",\"Kamar Mandi Luar Bersih (Rasio 1:2 Kamar)\",\"Kasur Single 100x200\",\"Meja Belajar Kompak\",\"Lemari Pakaian Minimalis\",\"WiFi Gratis Unlimited\"]','[\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80\",\"https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80\"]','2026-11-01 16:41:57.695','2026-11-01 16:41:57.695');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `propertyId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` int NOT NULL DEFAULT '1',
  `status` enum('AVAILABLE','OCCUPIED','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `customPrice` double DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rooms_propertyId_roomNumber_key` (`propertyId`,`roomNumber`),
  KEY `rooms_roomTypeId_fkey` (`roomTypeId`),
  CONSTRAINT `rooms_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rooms_roomTypeId_fkey` FOREIGN KEY (`roomTypeId`) REFERENCES `room_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES ('cmvy259s5000gfm6kgpdi9v56','cmvy259re0008fm6kbm2d4mws','cmvy259rl000afm6k9ajsnaa7','101',1,'OCCUPIED',NULL,'Dihuni oleh Ahmad Fauzi','2026-11-01 16:41:57.701','2026-11-01 16:41:57.701'),('cmvy259sb000ifm6kz3mrmk7k','cmvy259re0008fm6kbm2d4mws','cmvy259rs000cfm6kvr7b5alh','102',1,'OCCUPIED',NULL,'Dihuni oleh Siti Rahmawati','2026-11-01 16:41:57.708','2026-11-01 16:41:57.708'),('cmvy259sh000kfm6k6ljvkvb6','cmvy259re0008fm6kbm2d4mws','cmvy259rs000cfm6kvr7b5alh','103',1,'AVAILABLE',NULL,'Kamar bersih siap huni','2026-11-01 16:41:57.713','2026-11-01 16:41:57.713'),('cmvy259sm000mfm6kyc4dzef6','cmvy259re0008fm6kbm2d4mws','cmvy259rl000afm6k9ajsnaa7','104',1,'MAINTENANCE',NULL,'Dalam perbaikan servis rutin AC dan cat ulang','2026-11-01 16:41:57.718','2026-11-01 16:41:57.718'),('cmvy259sr000ofm6kid1hpss3','cmvy259re0008fm6kbm2d4mws','cmvy259ry000efm6kkxaoxs9y','105',1,'AVAILABLE',NULL,'Kamar siap huni lantai 1','2026-11-01 16:41:57.723','2026-11-01 16:41:57.723'),('cmvy259sw000qfm6kkk1qce1j','cmvy259re0008fm6kbm2d4mws','cmvy259ry000efm6kkxaoxs9y','106',1,'OCCUPIED',NULL,'Dihuni oleh Budi Pratama','2026-11-01 16:41:57.728','2026-11-01 16:41:57.728'),('cmvy259t1000sfm6ks92h59ra','cmvy259re0008fm6kbm2d4mws','cmvy259rl000afm6k9ajsnaa7','201',2,'AVAILABLE',NULL,'Kamar Deluxe lantai 2 dengan balkon menghadap barat','2026-11-01 16:41:57.733','2026-11-01 16:41:57.733'),('cmvy259t6000ufm6kxd891l6v','cmvy259re0008fm6kbm2d4mws','cmvy259rl000afm6k9ajsnaa7','202',2,'AVAILABLE',NULL,'Kamar Deluxe lantai 2 tenang','2026-11-01 16:41:57.738','2026-11-01 16:41:57.738'),('cmvy259tb000wfm6kvg4aq0q3','cmvy259re0008fm6kbm2d4mws','cmvy259rs000cfm6kvr7b5alh','203',2,'AVAILABLE',NULL,'Kamar Standard lantai 2 siap huni','2026-11-01 16:41:57.743','2026-11-01 16:41:57.743'),('cmvy259tg000yfm6kwunfcaic','cmvy259re0008fm6kbm2d4mws','cmvy259rs000cfm6kvr7b5alh','204',2,'AVAILABLE',NULL,'Kamar Standard lantai 2 dekat tangga','2026-11-01 16:41:57.748','2026-11-01 16:41:57.748'),('cmvy259tl0010fm6kmg4xguub','cmvy259re0008fm6kbm2d4mws','cmvy259ry000efm6kkxaoxs9y','205',2,'AVAILABLE',NULL,'Kamar Economy lantai 2','2026-11-01 16:41:57.753','2026-11-01 16:41:57.753'),('cmvy259tq0012fm6kjje63p2m','cmvy259re0008fm6kbm2d4mws','cmvy259ry000efm6kkxaoxs9y','206',2,'AVAILABLE',NULL,'Kamar Economy lantai 2 ujung','2026-11-01 16:41:57.758','2026-11-01 16:41:57.758');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('cmvy259vx001vfm6k4i9lz0s9','BANK_NAME','Bank Central Asia (BCA)','Nama bank untuk pembayaran transfer manual','2026-11-01 16:41:57.837'),('cmvy259vx001wfm6kic99x81d','BANK_ACCOUNT_NUMBER','8470198822','Nomor rekening tujuan pembayaran','2026-11-01 16:41:57.837'),('cmvy259vx001xfm6k0b0yhn8m','BANK_ACCOUNT_HOLDER','HENDRA WIJAYA','Nama pemilik rekening bank','2026-11-01 16:41:57.837'),('cmvy259vx001yfm6kxv2g9fez','WA_NOTIFICATION_ENABLED','true','Status pengiriman notifikasi otomatis via WhatsApp Fonnte','2026-11-01 16:41:57.837'),('cmvy259vx001zfm6kgptjl6bl','MIDTRANS_AUTO_VERIFY','true','Otomatis lunaskan invoice setelah webhook Midtrans berhasil','2026-11-01 16:41:57.837');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_profiles`
--

DROP TABLE IF EXISTS `tenant_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_profiles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nik` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactPhone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idCardImage` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_profiles_userId_key` (`userId`),
  CONSTRAINT `tenant_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_profiles`
--

LOCK TABLES `tenant_profiles` WRITE;
/*!40000 ALTER TABLE `tenant_profiles` DISABLE KEYS */;
INSERT INTO `tenant_profiles` VALUES ('cmvy259qv0003fm6khnxppln9','cmvy259qv0002fm6kgxxl7fto','3211012304990001','Mahasiswa S1','Universitas Padjadjaran (UNPAD)','Bpk. Bambang Fauzi (Ayah)','081211112222',NULL,'2026-11-01 16:41:57.656','2026-11-01 16:41:57.656'),('cmvy259r20005fm6ko702qcsg','cmvy259r20004fm6k8nk92k2r','3211015609010003','Karyawan Swasta','PT Telkom Digital','Ibu Nurhayati (Ibu)','081233334444',NULL,'2026-11-01 16:41:57.662','2026-11-01 16:41:57.662'),('cmvy259r80007fm6kouageun6','cmvy259r80006fm6k7va1jhkp','3211011112980005','Software Engineer','Startup Tech Bandung','Dedi Supriadi','081255556666',NULL,'2026-11-01 16:41:57.668','2026-11-01 16:41:57.668');
/*!40000 ALTER TABLE `tenant_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('OWNER','STAFF','TENANT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TENANT',
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmvy259qe0000fm6ktk720jnw','H. Hendra Wijaya (Owner)','owner@kamarkos.com','$2a$10$o8yPEYzVfXojAMKigYKuMOzhcGLI33mEGktNlEIY.Ps3hkVTGNCZu','081223344556','OWNER','https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80','2026-11-01 16:41:57.638','2026-11-01 16:41:57.638'),('cmvy259qp0001fm6kv2menlur','Rian Permana (Staff Pengelola)','staff@kamarkos.com','$2a$10$o8yPEYzVfXojAMKigYKuMOzhcGLI33mEGktNlEIY.Ps3hkVTGNCZu','081399887766','STAFF','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80','2026-11-01 16:41:57.650','2026-11-01 16:41:57.650'),('cmvy259qv0002fm6kgxxl7fto','Ahmad Fauzi','penyewa1@kamarkos.com','$2a$10$o8yPEYzVfXojAMKigYKuMOzhcGLI33mEGktNlEIY.Ps3hkVTGNCZu','081234567891','TENANT','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80','2026-11-01 16:41:57.656','2026-11-01 16:41:57.656'),('cmvy259r20004fm6k8nk92k2r','Siti Rahmawati','penyewa2@kamarkos.com','$2a$10$o8yPEYzVfXojAMKigYKuMOzhcGLI33mEGktNlEIY.Ps3hkVTGNCZu','081234567892','TENANT','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80','2026-11-01 16:41:57.662','2026-11-01 16:41:57.662'),('cmvy259r80006fm6k7va1jhkp','Budi Pratama','penyewa3@kamarkos.com','$2a$10$o8yPEYzVfXojAMKigYKuMOzhcGLI33mEGktNlEIY.Ps3hkVTGNCZu','081234567893','TENANT','https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80','2026-11-01 16:41:57.668','2026-11-01 16:41:57.668');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02  0:35:06
