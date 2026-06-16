-- MySQL dump 10.13  Distrib 8.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: dbphongkham8
-- ------------------------------------------------------
-- Server version	8.2.0

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
-- Table structure for table `bang_phan_cong_ca_lam`
--

DROP TABLE IF EXISTS `bang_phan_cong_ca_lam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bang_phan_cong_ca_lam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_nhan_vien` int NOT NULL,
  `phong` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gio_lam` time DEFAULT NULL,
  `gio_ket_thuc` time DEFAULT NULL,
  `thu` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_phancong_nhanvien` (`ma_nhan_vien`),
  CONSTRAINT `fk_phancong_nhanvien` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bang_phan_cong_ca_lam`
--

LOCK TABLES `bang_phan_cong_ca_lam` WRITE;
/*!40000 ALTER TABLE `bang_phan_cong_ca_lam` DISABLE KEYS */;
INSERT INTO `bang_phan_cong_ca_lam` VALUES (1,214,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 6'),(2,214,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 4'),(3,214,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 2'),(5,215,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 5'),(6,215,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 3'),(7,216,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 6'),(8,216,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 4'),(9,216,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 2'),(11,217,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 5'),(12,217,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 3'),(13,218,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 6'),(14,218,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 4'),(15,218,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 2'),(17,219,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 5'),(18,219,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 3'),(22,240,'Quầy thu ngân','08:00:00','17:00:00','Thứ 6'),(23,240,'Quầy thu ngân','08:00:00','17:00:00','Thứ 4'),(24,240,'Quầy thu ngân','08:00:00','17:00:00','Thứ 2'),(27,241,'Quầy thu ngân','08:00:00','17:00:00','Thứ 5'),(28,241,'Quầy thu ngân','08:00:00','17:00:00','Thứ 3'),(29,228,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 6'),(30,228,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 4'),(31,228,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 2'),(37,229,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 5'),(38,229,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 3'),(39,238,'Quầy Tiếp Đón & Lễ Tân','07:30:00','16:30:00','Thứ 6'),(40,238,'Quầy Tiếp Đón & Lễ Tân','07:30:00','16:30:00','Thứ 4'),(41,238,'Quầy Tiếp Đón & Lễ Tân','07:30:00','16:30:00','Thứ 2'),(43,239,'Quầy Tiếp Đón & Lễ Tân','07:30:00','16:30:00','Thứ 5'),(44,239,'Quầy Tiếp Đón & Lễ Tân','07:30:00','16:30:00','Thứ 3'),(45,242,'Quầy Thuốc','08:00:00','17:00:00','Thứ 6'),(46,242,'Quầy Thuốc','08:00:00','17:00:00','Thứ 4'),(47,242,'Quầy Thuốc','08:00:00','17:00:00','Thứ 2'),(49,243,'Quầy Thuốc','08:00:00','17:00:00','Thứ 5'),(50,243,'Quầy Thuốc','08:00:00','17:00:00','Thứ 3'),(55,247,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 5'),(57,226,'P. Chẩn Đoán Hình ảnh','08:00:00','18:00:00','Thứ 2'),(58,227,'P. Chẩn Đoán Hình ảnh','08:00:00','16:00:00','Thứ 3'),(59,226,'P. Chẩn Đoán Hình ảnh','07:00:00','16:00:00','Thứ 4'),(60,227,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 5'),(61,226,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 6'),(63,220,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 2'),(64,221,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 3'),(65,220,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 4'),(66,221,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 5'),(67,220,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 6'),(69,224,'P. Tim mạch','08:00:00','17:00:00','Thứ 2'),(70,225,'P. Tim mạch','08:00:00','17:00:00','Thứ 3'),(71,224,'P. Tim mạch','08:00:00','17:00:00','Thứ 4'),(72,225,'P. Tim mạch','07:00:00','17:00:00','Thứ 5'),(73,224,'P. Tim mạch','08:00:00','17:00:00','Thứ 6'),(75,222,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 2'),(76,223,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 3'),(77,222,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 4'),(78,223,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 5'),(79,222,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 6'),(81,248,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 2'),(82,249,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 3'),(83,248,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 4'),(85,248,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 6'),(87,251,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 2'),(88,247,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 3'),(89,251,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 4'),(90,251,'P. Xét nghiệm','08:00:00','17:00:00','Thứ 6'),(91,232,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 2'),(92,233,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 3'),(93,232,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 4'),(95,233,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 5'),(96,232,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Thứ 6'),(98,230,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 2'),(99,231,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 3'),(100,230,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 4'),(101,231,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 5'),(102,230,'P.Tai - Mũi - Họng','08:00:00','17:00:00','Thứ 6'),(104,234,'P. Tim mạch','08:00:00','17:00:00','Thứ 2'),(105,235,'P. Tim mạch','08:00:00','17:00:00','Thứ 3'),(106,234,'P. Tim mạch','08:00:00','17:00:00','Thứ 4'),(107,235,'P. Tim mạch','08:00:00','17:00:00','Thứ 5'),(108,234,'P. Tim mạch','08:00:00','17:00:00','Thứ 6'),(110,236,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 2'),(111,237,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 3'),(112,236,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 4'),(113,237,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 5'),(114,236,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 6'),(116,244,'Kho Dược Chính','08:00:00','17:00:00','Thứ 2'),(117,245,'Kho Dược Chính','08:00:00','17:00:00','Thứ 3'),(118,244,'Kho Dược Chính','08:00:00','17:00:00','Thứ 4'),(119,245,'Kho Dược Chính','08:00:00','17:00:00','Thứ 5'),(120,244,'Kho Dược Chính','08:00:00','17:00:00','Thứ 6'),(121,215,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Thứ 7'),(122,220,'P. Răng - Hàm - Mặt','08:00:00','17:00:00','Chủ Nhật'),(123,214,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Chủ Nhật'),(124,234,'P. Tim mạch','08:00:00','17:00:00','Thứ 7'),(125,227,'P. Chẩn Đoán Hình ảnh','08:00:00','17:00:00','Thứ 7'),(126,216,'P. Khám Nhi Khoa','08:00:00','17:00:00','Thứ 7'),(127,223,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Chủ Nhật'),(128,226,'P. Khám Nội Tổng Quát','08:00:00','17:00:00','Chủ Nhật');
/*!40000 ALTER TABLE `bang_phan_cong_ca_lam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `benh_nhan`
--

DROP TABLE IF EXISTS `benh_nhan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `benh_nhan` (
  `ma_benh_nhan` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `so_dien_thoai` varchar(20) DEFAULT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nghe_nghiep` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nhom_mau` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `di_ung_thuoc` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `nguoi_giam_ho` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `so_dien_thoai_nguoi_giam_ho` varchar(20) DEFAULT NULL,
  `ghi_chu` text,
  `cccd` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gioi_tinh` bit(2) NOT NULL,
  PRIMARY KEY (`ma_benh_nhan`),
  UNIQUE KEY `UNQ_cccd` (`cccd`),
  UNIQUE KEY `UNQ_sdt` (`so_dien_thoai`),
  UNIQUE KEY `UNQ_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `benh_nhan`
--

LOCK TABLES `benh_nhan` WRITE;
/*!40000 ALTER TABLE `benh_nhan` DISABLE KEYS */;
INSERT INTO `benh_nhan` VALUES (1,'khánh vy','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0909883211','duongvanminhtam30@gmail.com','Giáo viên','B','123123','','123456789','','123456781123',_binary ''),(2,'Nguyễn Thị Hồng','1988-07-20','78 Cách Mạng Tháng 8, TP.HCM','0909555666','hongnt@gmail.com','Giáo viên','A','Penicillin',NULL,NULL,NULL,'123213213',_binary '\0'),(3,'Lê Gia Bảo','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0909888777',NULL,'Học sinh','B','123123','21312','0','23123','909888889',_binary '\0'),(12,'hao hao','2000-05-06','45 Lê Lợi, Q1, TP.HCM','0909881257',NULL,'Giáo viên','B','123123','','123456789','','123456784789',_binary ''),(22,'thảo vy','2000-05-06','45 Lê Lợi, Q1, TP.HCM','0909881236',NULL,'Giáo viên','B','123123','','123456789','','123456781234',_binary ''),(26,'khánh nhi','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0909881121','tamduonge7@gmail.com','Giáo viên','B','123123','','123456789','','123456782341',_binary ''),(30,'hoàng lan','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0909883366',NULL,'Giáo viên','B','123123','','0','','123456789876',_binary '\0'),(31,'Phạm nhật minh','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0909888876',NULL,'Giáo viên','B','123123','','0','','123456780012',_binary '\0'),(37,'Phạm nhật minh thư','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0123456789',NULL,'Giáo viên','B','','','0','','123456780013',_binary '\0'),(40,'Phạm nhật Ánh','2000-05-02','45 Lê Lợi, Q1, TP.HCM','0123456781','tamduonge71@gmail.com','Giáo viên','B','','','0','','123456780017',_binary '\0');
/*!40000 ALTER TABLE `benh_nhan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_so_kham_tong_hop`
--

DROP TABLE IF EXISTS `chi_so_kham_tong_hop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_so_kham_tong_hop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ma_nhan_vien_nhap` int DEFAULT NULL,
  `nhiet_do` float DEFAULT NULL,
  `nhip_tim` int DEFAULT NULL,
  `nhip_tho` int DEFAULT NULL,
  `huyet_ap_tam_thu` int DEFAULT NULL,
  `huyet_ap_tam_truong` int DEFAULT NULL,
  `can_nang` float DEFAULT NULL,
  `chieu_cao` float DEFAULT NULL,
  `spo2` float DEFAULT NULL,
  `vong_dau` float DEFAULT NULL,
  `tinh_trang_dinh_duong` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tam_ly_hanh_vi` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kham_tai_mui_hong_nhi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `kham_ho_hap_nhi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `kham_da_niem_mac_nhi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `co_quan_khac_nhi` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tinh_trang_rang` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sau_rang` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cao_rang` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viem_nuou` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `khop_can` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niem_mac_mieng` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `do_lung_lay` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phu_hinh_cu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `benh_ly_khac_rhm` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thinh_luc_tai_trai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thinh_luc_tai_phai` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tinh_trang_mui` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tinh_trang_hong` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `soi_tai_mui_hong` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ong_tai` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `mang_nhi_phai` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mang_nhi_trai` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vach_ngan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuon_mui` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `khe_mui` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amidan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thanh_quan` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cholesterol` float DEFAULT NULL,
  `hdl_cholesterol` float DEFAULT NULL,
  `ldl_cholesterol` float DEFAULT NULL,
  `triglyceride` float DEFAULT NULL,
  `duong_huyet` float DEFAULT NULL,
  `ecg_ket_qua` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sieu_am_tim` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ghi_chu` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `kham_du_niem_mac_nhi` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_phieukham_tonghop` (`ma_phieu_kham`),
  KEY `FK_MaNVnhap` (`ma_nhan_vien_nhap`),
  CONSTRAINT `FK_MaNVnhap` FOREIGN KEY (`ma_nhan_vien_nhap`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_maphieukham` FOREIGN KEY (`ma_phieu_kham`) REFERENCES `phieu_kham` (`ma_phieu_kham`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_so_kham_tong_hop`
--

LOCK TABLES `chi_so_kham_tong_hop` WRITE;
/*!40000 ALTER TABLE `chi_so_kham_tong_hop` DISABLE KEYS */;
INSERT INTO `chi_so_kham_tong_hop` VALUES (101,705,224,2,2,2,2,2,2,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,3,3,3,3,3,'3','3','',NULL,NULL),(102,706,247,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(103,707,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(104,708,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(105,709,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(106,710,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(107,711,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(108,712,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(109,713,214,2,2,2,2,2,2,2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(110,714,236,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(111,715,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(112,716,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(113,717,214,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(114,718,236,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(115,719,230,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL),(116,720,230,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'[Dịch vụ ID: 3] ',NULL,NULL),(117,721,236,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(118,722,236,1,1,1,1,1,1,1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `chi_so_kham_tong_hop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chi_tiet_chi_dinh`
--

DROP TABLE IF EXISTS `chi_tiet_chi_dinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_tiet_chi_dinh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_chi_dinh` int NOT NULL,
  `ma_dich_vu` int NOT NULL,
  `so_luong` int DEFAULT '1',
  `don_gia` double DEFAULT NULL,
  `trang_thai_dv` varchar(255) DEFAULT NULL,
  `ma_nhan_vien_thuc_hien` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk-maphieuchidinh` (`ma_phieu_chi_dinh`),
  KEY `fk-madv` (`ma_dich_vu`),
  CONSTRAINT `Fk_MaDV` FOREIGN KEY (`ma_dich_vu`) REFERENCES `dich_vu` (`ma_dich_vu`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `Fk_maphieuchidinh` FOREIGN KEY (`ma_phieu_chi_dinh`) REFERENCES `phieu_chi_dinh` (`ma_phieu_chi_dinh`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chi_tiet_chi_dinh`
--

LOCK TABLES `chi_tiet_chi_dinh` WRITE;
/*!40000 ALTER TABLE `chi_tiet_chi_dinh` DISABLE KEYS */;
INSERT INTO `chi_tiet_chi_dinh` VALUES (71,189,13,1,60000,'DA_THUC_HIEN',247),(72,190,7,1,80000,'CHUA_THUC_HIEN',NULL);
/*!40000 ALTER TABLE `chi_tiet_chi_dinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuc_vu`
--

DROP TABLE IF EXISTS `chuc_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuc_vu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_chuc_vu` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_chuc_vu` (`ten_chuc_vu`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuc_vu`
--

LOCK TABLES `chuc_vu` WRITE;
/*!40000 ALTER TABLE `chuc_vu` DISABLE KEYS */;
INSERT INTO `chuc_vu` VALUES (16,'Bác sĩ'),(5,'Dược sĩ'),(15,'Kỹ thuật viên Chẩn đoán hình ảnh'),(13,'Kỹ thuật viên Xét nghiệm'),(3,'Lễ tân'),(6,'Nhân viên kho'),(9,'Quản trị viên'),(4,'Thu ngân'),(7,'Trợ lý bác sĩ chuyên khoa'),(8,'Trợ lý bác sĩ tổng quát');
/*!40000 ALTER TABLE `chuc_vu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chuyen_khoa`
--

DROP TABLE IF EXISTS `chuyen_khoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chuyen_khoa` (
  `ma_chuyen_khoa` int NOT NULL AUTO_INCREMENT,
  `ten_chuyen_khoa` varchar(30) DEFAULT NULL,
  `mo_ta` varchar(255) DEFAULT NULL,
  `so_luong_toi_da` int DEFAULT NULL,
  PRIMARY KEY (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chuyen_khoa`
--

LOCK TABLES `chuyen_khoa` WRITE;
/*!40000 ALTER TABLE `chuyen_khoa` DISABLE KEYS */;
INSERT INTO `chuyen_khoa` VALUES (1,'Nội tổng quát','Khám và điều trị các bệnh nội khoa thông thường',40),(3,'Nhi khoa','Khám và điều trị bệnh cho trẻ em',40),(4,'Tai - Mũi - Họng','Khám và điều trị bệnh lý tai, mũi, họng',40),(5,'Răng - Hàm - Mặt','Khám, nhổ, trám và phục hình răng',40),(7,'Xét nghiệm','Thực hiện các xét nghiệm máu, nước tiểu, sinh hóa...',40),(11,'Tim mạch','kiểm tra về tim',40),(12,'Chẩn đoán hình ảnh',NULL,40);
/*!40000 ALTER TABLE `chuyen_khoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ct_hoa_don`
--

DROP TABLE IF EXISTS `ct_hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ct_hoa_don` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_hoa_don` int NOT NULL,
  `noi_dung` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `loai_muc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `id_goc` int DEFAULT NULL,
  `so_luong` int DEFAULT '1',
  `don_gia` decimal(15,2) DEFAULT '0.00',
  `thanh_tien` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `FK_mahoadoan` (`ma_hoa_don`),
  CONSTRAINT `fk_cthoadon` FOREIGN KEY (`ma_hoa_don`) REFERENCES `hoa_don` (`ma_hoa_don`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ct_hoa_don`
--

LOCK TABLES `ct_hoa_don` WRITE;
/*!40000 ALTER TABLE `ct_hoa_don` DISABLE KEYS */;
INSERT INTO `ct_hoa_don` VALUES (141,138,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(142,139,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(143,140,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(144,140,'Paracetamol 500mg','THUOC',69,1,12000.00,12000.00),(145,141,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(146,141,'Nước muối sinh lý 0.9%','THUOC',72,1,12000.00,12000.00),(147,142,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(148,142,'Paracetamol 500mg','THUOC',90,1,12000.00,12000.00),(149,142,'Vitamin C 1000mg11','THUOC',91,1,24000.00,24000.00),(150,143,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(151,143,'Paracetamol 500mg','THUOC',100,1,12000.00,12000.00),(152,143,'Vitamin C 1000mg11','THUOC',101,1,24000.00,24000.00),(153,144,'Khám Nội tổng quát (Khám)','DICH_VU',1,1,100000.00,100000.00),(154,144,'Vitamin C 1000mg11','THUOC',104,1,24000.00,24000.00);
/*!40000 ALTER TABLE `ct_hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ct_phieu_chi_dinh`
--

DROP TABLE IF EXISTS `ct_phieu_chi_dinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ct_phieu_chi_dinh` (
  `ma_ct_phieu_chi_dinh` int NOT NULL AUTO_INCREMENT,
  `don_gia` double DEFAULT NULL,
  `ma_dich_vu` int DEFAULT NULL,
  `ma_phieu_chi_dinh` int DEFAULT NULL,
  `so_luong` int DEFAULT NULL,
  `thanh_tien` double DEFAULT NULL,
  `trang_thai` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ma_ct_phieu_chi_dinh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ct_phieu_chi_dinh`
--

LOCK TABLES `ct_phieu_chi_dinh` WRITE;
/*!40000 ALTER TABLE `ct_phieu_chi_dinh` DISABLE KEYS */;
/*!40000 ALTER TABLE `ct_phieu_chi_dinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ct_phieu_nhap_thuoc`
--

DROP TABLE IF EXISTS `ct_phieu_nhap_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ct_phieu_nhap_thuoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_nhap_thuoc` int NOT NULL,
  `ma_thuoc` int NOT NULL,
  `ma_ncc` int NOT NULL,
  `so_luong_nhap` int NOT NULL,
  `don_gia_nhap` decimal(10,2) DEFAULT NULL,
  `thanh_tien` decimal(15,7) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ma_phieu_nhap_thuoc` (`ma_phieu_nhap_thuoc`),
  KEY `ma_thuoc` (`ma_thuoc`),
  CONSTRAINT `fk-maphieunhapthuoc` FOREIGN KEY (`ma_phieu_nhap_thuoc`) REFERENCES `phieu_nhap_thuoc` (`ma_phieu_nhap_thuoc`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ct_phieu_nhap_thuoc`
--

LOCK TABLES `ct_phieu_nhap_thuoc` WRITE;
/*!40000 ALTER TABLE `ct_phieu_nhap_thuoc` DISABLE KEYS */;
INSERT INTO `ct_phieu_nhap_thuoc` VALUES (6,6,1,1,5,10000.00,50000.0000000),(7,7,1,1,1000,50000.00,50000000.0000000),(8,7,1,1,1000,10000.00,10000000.0000000),(9,8,3,1,5,5000.00,25000.0000000),(10,9,2,1,5,1000.00,5000.0000000),(12,11,3,1,5,1000.00,5000.0000000),(13,12,1,1,500,1000.00,500000.0000000),(14,13,1,1,10,5000.00,50000.0000000),(15,14,1,1,10,5000.00,50000.0000000),(16,15,3,1,100,20000.00,2000000.0000000),(17,16,3,1,1,200.00,200.0000000),(18,17,1,1,10,100.00,1000.0000000),(21,19,2,1,12,1.00,12.0000000),(24,20,5,1,50,20000.00,1000000.0000000),(25,20,6,1,20,40000.00,800000.0000000),(26,20,7,1,200,3000.00,600000.0000000),(27,20,8,1,10,65000.00,650000.0000000),(28,20,9,1,500,4500.00,2250000.0000000),(29,20,10,1,100,6000.00,600000.0000000),(30,20,11,1,5,300000.00,1500000.0000000),(31,20,12,1,60,10000.00,600000.0000000),(32,20,13,1,10,70000.00,700000.0000000),(33,22,2,1,11,11000.00,121000.0000000),(34,24,1,1,10,1500.00,15000.0000000);
/*!40000 ALTER TABLE `ct_phieu_nhap_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ct_toa_thuoc`
--

DROP TABLE IF EXISTS `ct_toa_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ct_toa_thuoc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_toa_thuoc` int NOT NULL,
  `ma_thuoc` int NOT NULL,
  `lieu_dung` varchar(100) DEFAULT NULL COMMENT 'VD: 3 lần/ngày',
  `sang` varchar(50) DEFAULT NULL COMMENT 'Sáng',
  `trua` varchar(50) DEFAULT NULL COMMENT 'Trưa',
  `chieu` varchar(50) DEFAULT NULL COMMENT 'Chiều',
  `toi` varchar(50) DEFAULT NULL COMMENT 'Tối',
  `so_ngay` int NOT NULL,
  `cach_dung` text COMMENT 'Ghi chú/Lời dặn chi tiết của bác sĩ',
  `thoi_diem_dung` varchar(100) DEFAULT NULL COMMENT 'VD: Sau ăn, Trước ngủ',
  PRIMARY KEY (`id`),
  KEY `FK_ToaThuoc_CTToaThuoc` (`ma_toa_thuoc`),
  KEY `FK_CTToaThuoc_MaThuoc` (`ma_thuoc`)
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ct_toa_thuoc`
--

LOCK TABLES `ct_toa_thuoc` WRITE;
/*!40000 ALTER TABLE `ct_toa_thuoc` DISABLE KEYS */;
INSERT INTO `ct_toa_thuoc` VALUES (40,82,1,NULL,'1','1','1','1',5,'c','Sau khi ăn'),(41,83,1,NULL,'1','1','1','1',5,'c','Sau khi ăn'),(42,84,1,NULL,'1','1','1','1',5,'ĂN UỐNG ĐIỀU ĐỘ','Sau khi ăn'),(43,85,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(44,86,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(51,92,1,'Ngày uống 2 lần','1','1','1','1',3,'Uống sau ăn','Sáng, Tối'),(52,92,2,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(53,93,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(57,97,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(60,100,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(63,103,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(66,106,2,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(69,109,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(72,112,3,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(90,122,1,'5','1','0','0','1',3,'5','5'),(91,122,2,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(92,123,3,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(100,129,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(101,129,2,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(104,132,2,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối'),(105,133,1,'Ngày uống 2 lần','1','0','0','1',3,'Uống sau ăn','Sáng, Tối');
/*!40000 ALTER TABLE `ct_toa_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dang_ky_kham_benh`
--

DROP TABLE IF EXISTS `dang_ky_kham_benh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dang_ky_kham_benh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_benh_nhan` int NOT NULL,
  `ma_nhan_vien` int DEFAULT NULL,
  `ma_chuyen_khoa` int NOT NULL,
  `so_thu_tu` int NOT NULL,
  `thoi_gian_dang_ky` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` varchar(50) DEFAULT NULL,
  `ghi_chu` varchar(255) DEFAULT NULL,
  `ma_phieu_kham` int DEFAULT NULL,
  `ma_chi_tiet_chi_dinh` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dkbn_benhnhan` (`ma_benh_nhan`),
  KEY `fk_dkbn_nhanvien` (`ma_nhan_vien`),
  KEY `fk_dkbn_chuyenkhoa` (`ma_chuyen_khoa`),
  KEY `fk_dk_phieukham` (`ma_phieu_kham`),
  KEY `fk_dk_mactcd` (`ma_chi_tiet_chi_dinh`),
  CONSTRAINT `fk-mabn` FOREIGN KEY (`ma_benh_nhan`) REFERENCES `benh_nhan` (`ma_benh_nhan`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk-machuyenkhoa` FOREIGN KEY (`ma_chuyen_khoa`) REFERENCES `chuyen_khoa` (`ma_chuyen_khoa`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk-maphieukham` FOREIGN KEY (`ma_phieu_kham`) REFERENCES `phieu_kham` (`ma_phieu_kham`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_mactchidinh` FOREIGN KEY (`ma_chi_tiet_chi_dinh`) REFERENCES `chi_tiet_chi_dinh` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_manhanvien` FOREIGN KEY (`ma_nhan_vien`) REFERENCES `nhan_vien` (`ma_nhan_vien`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=233 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dang_ky_kham_benh`
--

LOCK TABLES `dang_ky_kham_benh` WRITE;
/*!40000 ALTER TABLE `dang_ky_kham_benh` DISABLE KEYS */;
INSERT INTO `dang_ky_kham_benh` VALUES (205,2,238,11,1,'2026-06-06 18:51:37','HOAN_THANH','[Dịch vụ ID: 5] ',705,NULL),(206,1,238,1,1,'2026-06-07 00:17:01','HOAN_THANH','[Dịch vụ ID: 1] ',706,NULL),(207,1,238,1,1,'2026-06-09 15:35:11','HOAN_THANH','[Dịch vụ ID: 1] ',707,NULL),(208,2,238,1,2,'2026-06-09 21:24:21','HOAN_THANH','[Dịch vụ ID: 1] ',708,NULL),(209,3,238,1,3,'2026-06-09 21:53:41','HOAN_THANH','[Dịch vụ ID: 1] ',709,NULL),(210,26,238,1,4,'2026-06-09 21:56:07','HOAN_THANH','[Dịch vụ ID: 1] ',710,NULL),(211,37,238,1,5,'2026-06-09 22:06:45','HOAN_THANH','[Dịch vụ ID: 1] ',711,NULL),(212,22,238,1,6,'2026-06-09 22:55:06','HOAN_THANH','[Dịch vụ ID: 1] ',712,NULL),(213,1,238,1,1,'2026-06-10 00:00:35','HOAN_THANH','[Dịch vụ ID: 1] ',713,NULL),(214,2,238,1,2,'2026-06-10 00:10:02','CHO_BAC_SI','[Dịch vụ ID: 1] ',714,NULL),(215,3,238,1,3,'2026-06-10 02:32:11','HOAN_THANH','[Dịch vụ ID: 1] ',715,NULL),(216,1,238,1,1,'2026-06-11 18:33:34','HOAN_THANH','[Dịch vụ ID: 1] ',716,NULL),(217,3,238,1,2,'2026-06-11 18:42:38','HOAN_THANH','[Dịch vụ ID: 1] ',717,NULL),(218,12,238,1,3,'2026-06-11 18:54:56','CHO_BAC_SI','[Dịch vụ ID: 1] ',718,NULL),(219,1,238,1,1,'2026-06-12 19:06:21','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(220,3,238,4,2,'2026-06-12 22:01:28','DANG_KHAM','[Dịch vụ ID: 3] ',719,NULL),(221,12,238,4,3,'2026-06-12 22:17:03','DANG_KHAM','[Dịch vụ ID: 3] ',720,NULL),(222,12,238,1,4,'2026-06-12 23:16:38','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(223,12,238,1,5,'2026-06-12 23:21:38','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(224,12,238,1,6,'2026-06-12 23:22:03','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(225,12,238,1,7,'2026-06-12 23:25:19','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(226,12,238,1,8,'2026-06-12 23:25:40','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(227,12,238,1,9,'2026-06-12 23:28:02','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(228,12,238,1,10,'2026-06-12 23:34:16','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(229,12,238,1,11,'2026-06-12 23:39:08','CHO_KHAM','[Dịch vụ ID: 1] ',NULL,NULL),(230,1,238,1,1,'2026-06-14 14:34:40','HOAN_THANH','[Dịch vụ ID: 1] ',721,NULL),(231,1,238,1,2,'2026-06-14 15:53:14','CHO_BAC_SI','[Dịch vụ ID: 1] ',722,NULL),(232,3,238,7,3,'2026-06-14 15:55:42','CHO_KHAM','[Dịch vụ ID: 7] ',723,NULL);
/*!40000 ALTER TABLE `dang_ky_kham_benh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `danh_muc_benh_ly`
--

DROP TABLE IF EXISTS `danh_muc_benh_ly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `danh_muc_benh_ly` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_icd` varchar(20) NOT NULL,
  `ten_benh` varchar(255) NOT NULL,
  `trieu_chung_goi_y` text,
  `chuyen_khoa_lien_quan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_icd` (`ma_icd`),
  UNIQUE KEY `ten_benh` (`ten_benh`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `danh_muc_benh_ly`
--

LOCK TABLES `danh_muc_benh_ly` WRITE;
/*!40000 ALTER TABLE `danh_muc_benh_ly` DISABLE KEYS */;
INSERT INTO `danh_muc_benh_ly` VALUES (1,'J00','Viêm mũi họng cấp (Cảm lạnh)','Sổ mũi, hắt hơi, đau họng, sốt nhẹ','Tai - Mũi - Họng'),(2,'J02','Viêm họng cấp','Đau họng, nuốt đau, sốt, sưng hạch','Tai - Mũi - Họng'),(3,'J03','Viêm amidan cấp','Amidan sưng đỏ, có mủ, sốt cao, hơi thở hôi','Tai - Mũi - Họng'),(4,'J20','Viêm phế quản cấp','Ho khan hoặc có đờm, khò khè, khó thở nhẹ','Nội tổng quát'),(5,'J30','Viêm mũi vận mạch (Dị ứng)','Hắt hơi liên tục, ngứa mũi, chảy nước mũi trong','Tai - Mũi - Họng'),(6,'H66','Viêm tai giữa mủ','Đau tai, chảy mủ tai, giảm thính lực','Tai - Mũi - Họng'),(7,'K29','Viêm dạ dày và tá tràng','Đau thượng vị, buồn nôn, ợ chua','Nội tổng quát'),(8,'K21','Bệnh trào ngược dạ dày thực quản (GERD)','Ợ nóng, nóng rát sau xương ức, trào ngược','Nội tổng quát'),(9,'A09','Viêm dạ dày ruột nhiễm trùng (Tiêu chảy)','Tiêu chảy, nôn mửa, đau bụng, sốt','Nội tổng quát'),(10,'K59.0','Táo bón','Đại tiện khó, ít, phân cứng','Nội tổng quát'),(11,'I10','Tăng huyết áp vô căn','Đau đầu, chóng mặt, hồi hộp, huyết áp > 140/90','Tim mạch'),(12,'E11','Đái tháo đường type 2','Khát nước, tiểu nhiều, sụt cân, mệt mỏi','Nội tổng quát'),(13,'E78','Rối loạn chuyển hóa Lipoprotein (Mỡ máu)','Thường không triệu chứng, phát hiện qua xét nghiệm','Nội tổng quát'),(14,'I20','Cơn đau thắt ngực','Đau thắt ngực trái, lan ra tay trái, khó thở','Tim mạch'),(15,'M54.5','Đau lưng vùng thắt lưng','Đau ê ẩm hoặc nhói vùng thắt lưng, hạn chế vận động','Nội tổng quát'),(16,'M17','Thoái hóa khớp gối','Đau đầu gối khi đi lại, lục cục khớp, cứng khớp sáng sớm','Nội tổng quát'),(17,'M79.1','Đau cơ (Myalgia)','Đau nhức cơ bắp toàn thân hoặc khu trú','Nội tổng quát'),(18,'K02','Sâu răng','Đau nhức răng, lỗ sâu trên mặt răng, ê buốt','Răng - Hàm - Mặt'),(19,'K05','Viêm nướu (Lợi)','Lợi sưng đỏ, chảy máu khi đánh răng','Răng - Hàm - Mặt'),(20,'K04','Viêm tủy răng','Đau dữ dội từng cơn, đau lan lên đầu','Răng - Hàm - Mặt'),(21,'K08.8','Đau răng (chưa rõ nguyên nhân)','Đau vùng răng hàm','Răng - Hàm - Mặt'),(22,'B08.4','Bệnh tay chân miệng','Loét miệng, phỏng nước lòng bàn tay chân, sốt','Nhi khoa'),(23,'A90','Sốt xuất huyết Dengue','Sốt cao đột ngột, đau đầu, đau hốc mắt, phát ban','Nhi khoa'),(24,'L20','Viêm da cơ địa (Chàm)','Ngứa, da đỏ, khô, bong tróc','Nhi khoa');
/*!40000 ALTER TABLE `danh_muc_benh_ly` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dich_vu`
--

DROP TABLE IF EXISTS `dich_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dich_vu` (
  `ma_dich_vu` int NOT NULL AUTO_INCREMENT,
  `ten_dich_vu` varchar(50) NOT NULL,
  `don_gia` decimal(10,2) NOT NULL,
  `loai_dich_vu` varchar(50) DEFAULT NULL,
  `phong` int NOT NULL,
  `ma_chuyen_khoa` int DEFAULT NULL,
  PRIMARY KEY (`ma_dich_vu`),
  KEY `FK_PHONG_DV` (`phong`),
  KEY `FK_CK_CK` (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dich_vu`
--

LOCK TABLES `dich_vu` WRITE;
/*!40000 ALTER TABLE `dich_vu` DISABLE KEYS */;
INSERT INTO `dich_vu` VALUES (1,'Khám Nội tổng quát',100000.00,'KHAM_BENH',1,1),(2,'Khám Nhi khoa',100000.00,'KHAM_BENH',5,3),(3,'Khám Tai Mũi Họng',120000.00,'KHAM_BENH',6,4),(4,'Khám Răng Hàm Mặt',120000.00,'KHAM_BENH',7,5),(5,'Khám Tim mạch',150000.00,'KHAM_BENH',8,11),(7,'Tổng phân tích tế bào máu (CBC)',80000.00,'CLS_XET_NGHIEM',4,7),(8,'Định lượng Glucose (Đường huyết)',40000.00,'CLS_XET_NGHIEM',4,7),(9,'Bộ mỡ máu (Cholesterol, Triglyceride...)',150000.00,'CLS_XET_NGHIEM',4,7),(10,'Chức năng Gan (AST, ALT, GGT)',120000.00,'CLS_XET_NGHIEM',4,7),(11,'Chức năng Thận (Ure, Creatinine)',80000.00,'CLS_XET_NGHIEM',4,7),(12,'Tổng phân tích nước tiểu',50000.00,'CLS_XET_NGHIEM',4,7),(13,'Xét nghiệm Nhóm máu (ABO, Rh)',60000.00,'CLS_XET_NGHIEM',4,7),(14,'Xét nghiệm Viêm gan B (HBsAg test nhanh)',100000.00,'CLS_XET_NGHIEM',4,7),(15,'Siêu âm ổ bụng tổng quát',150000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(16,'Siêu âm Tuyến giáp',150000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(17,'Siêu âm Tim',300000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(18,'Chụp X-Quang Phổi thẳng',120000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(19,'Chụp X-Quang Xương khớp (1 vị trí)',120000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(20,'Đo Điện tim (ECG)',100000.00,'CLS_CHAN_DOAN_HINH_ANH',3,12),(31,'Chụp X-quang răng (tại ghế)',50000.00,'CLS_CHAN_DOAN_HINH_ANH',7,12);
/*!40000 ALTER TABLE `dich_vu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `giao_dich_thanh_toan`
--

DROP TABLE IF EXISTS `giao_dich_thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `giao_dich_thanh_toan` (
  `ma_giao_dich` int NOT NULL AUTO_INCREMENT,
  `ma_hoa_don` int NOT NULL,
  `provider` varchar(20) DEFAULT NULL,
  `order_id` varchar(100) DEFAULT NULL,
  `request_id` varchar(100) DEFAULT NULL,
  `trans_id` varchar(100) DEFAULT NULL,
  `so_tien` decimal(15,2) DEFAULT NULL,
  `trang_thai` varchar(30) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ma_giao_dich`),
  KEY `ma_hoa_don` (`ma_hoa_don`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `giao_dich_thanh_toan`
--

LOCK TABLES `giao_dich_thanh_toan` WRITE;
/*!40000 ALTER TABLE `giao_dich_thanh_toan` DISABLE KEYS */;
INSERT INTO `giao_dich_thanh_toan` VALUES (1,124,'VNPAY','124_1780766449672','20260607001955','15572378',184000.00,'da thanh toan','2026-06-07 00:21:16'),(2,125,'VNPAY','125_1780994159412','20260609153711','15576045',100000.00,'da thanh toan','2026-06-09 15:38:33'),(3,126,'VNPAY','126_1780994547402','20260609154131','15576053',100000.00,'da thanh toan','2026-06-09 15:42:53'),(4,130,'VNPAY','130_1780994961102','20260609154834','15576067',100000.00,'da thanh toan','2026-06-09 15:49:57'),(5,134,'CHUYEN_KHOAN','INVOICE_134',NULL,'CK_1781011340012',100000.00,'da thanh toan','2026-06-09 20:22:20'),(6,135,'VNPAY','135_1781014287427','20260609211038','15576527',100000.00,'da thanh toan','2026-06-09 21:12:01'),(7,136,'VNPAY','136_1781014650133','20260609211630','15576536',100000.00,'da thanh toan','2026-06-09 21:17:52'),(8,137,'VNPAY','137_1781014733322','20260609211753','15576539',100000.00,'da thanh toan','2026-06-09 21:19:15'),(9,138,'VNPAY','138_1781014989604','20260609212214','15576543',100000.00,'da thanh toan','2026-06-09 21:23:37'),(10,139,'VNPAY','139_1781020390884','20260609225217','15576654',100000.00,'da thanh toan','2026-06-09 22:54:26'),(11,140,'VNPAY','140_1781020548340','20260609225449','15576658',112000.00,'da thanh toan','2026-06-09 22:56:12'),(12,141,'TIEN_MAT','INVOICE_141',NULL,'TM_1781024535337',112000.00,'da thanh toan','2026-06-10 00:02:15'),(13,142,'TIEN_MAT','INVOICE_142',NULL,'TM_1781028495708',136000.00,'da thanh toan','2026-06-10 01:08:16'),(14,143,'TIEN_MAT','INVOICE_143',NULL,'TM_1781177798141',136000.00,'da thanh toan','2026-06-11 18:36:38'),(15,144,'TIEN_MAT','INVOICE_144',NULL,'TM_1781178202933',124000.00,'da thanh toan','2026-06-11 18:43:23');
/*!40000 ALTER TABLE `giao_dich_thanh_toan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `ma_hoa_don` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `tong_tien` decimal(15,2) DEFAULT NULL,
  `ngay_thanh_toan` datetime DEFAULT CURRENT_TIMESTAMP,
  `ghi_chu` text,
  `trang_thai` varchar(30) DEFAULT NULL,
  `ma_giao_dich` varchar(100) DEFAULT NULL,
  `phuong_thuc_thanh_toan` varchar(20) NOT NULL,
  PRIMARY KEY (`ma_hoa_don`),
  KEY `ma_phieu_kham` (`ma_phieu_kham`),
  KEY `ma_thu_ngan` (`ma_nhan_vien`)
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hoa_don`
--

LOCK TABLES `hoa_don` WRITE;
/*!40000 ALTER TABLE `hoa_don` DISABLE KEYS */;
INSERT INTO `hoa_don` VALUES (138,707,240,100000.00,'2026-06-09 21:23:37',NULL,'da thanh toan','15576543','VNPAY'),(139,711,214,100000.00,'2026-06-09 22:54:26',NULL,'da thanh toan','15576654','VNPAY'),(140,712,240,112000.00,'2026-06-09 22:56:12',NULL,'da thanh toan','15576658','VNPAY'),(141,713,240,112000.00,'2026-06-10 00:02:15',NULL,'da thanh toan','TM_1781024535337','tien_mat'),(142,714,240,136000.00,'2026-06-10 01:08:16',NULL,'da thanh toan','TM_1781028495708','tien_mat'),(143,716,240,136000.00,'2026-06-11 18:36:38',NULL,'da thanh toan','TM_1781177798141','tien_mat'),(144,717,240,124000.00,'2026-06-11 18:43:23',NULL,'da thanh toan','TM_1781178202933','tien_mat');
/*!40000 ALTER TABLE `hoa_don` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ket_qua_cdha`
--

DROP TABLE IF EXISTS `ket_qua_cdha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ket_qua_cdha` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_chi_tiet_chi_dinh` int NOT NULL,
  `mo_ta_hinh_anh` text,
  `ket_luan` text,
  `de_nghi` text,
  `duong_dan_anh_1` text,
  `duong_dan_anh_2` varchar(255) DEFAULT NULL,
  `ngay_thuc_hien` datetime DEFAULT CURRENT_TIMESTAMP,
  `ma_bac_si_thuc_hien` int DEFAULT NULL,
  `ma_nhan_vien_thuc_hien` int DEFAULT NULL,
  `trang_thai` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_MACT` (`id_chi_tiet_chi_dinh`),
  KEY `fk_mabs` (`ma_bac_si_thuc_hien`),
  KEY `FK_MANVTHUCHIEN` (`ma_nhan_vien_thuc_hien`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ket_qua_cdha`
--

LOCK TABLES `ket_qua_cdha` WRITE;
/*!40000 ALTER TABLE `ket_qua_cdha` DISABLE KEYS */;
INSERT INTO `ket_qua_cdha` VALUES (53,71,'=== PHIẾU BÁO CÁO XÉT NGHIỆM LÂM SÀNG ===\n\nDịch vụ thực hiện: XÉT NGHIỆM SINH HÓA MÁU\n--------------------------------------------------------\n+ Glucose: 5.2 mmol/L\n+ Ure: 4.8 mmol/L\n+ Creatinin: 76 µmol/L\n','=== PHIẾU BÁO CÁO XÉT NGHIỆM LÂM SÀNG ===\n\nDịch vụ thực hiện: XÉT NGHIỆM SINH HÓA MÁU\n--------------------------------------------------------\n+ Glucose: 5.2 mmol/L\n+ Ure: 4.8 mmol/L\n+ Creatinin: 76 µmol/L\n',NULL,'','','2026-06-07 00:18:21',NULL,247,'CHO_DUYET');
/*!40000 ALTER TABLE `ket_qua_cdha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ket_qua_xet_nghiem`
--

DROP TABLE IF EXISTS `ket_qua_xet_nghiem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ket_qua_xet_nghiem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_chi_tiet_chi_dinh` int NOT NULL,
  `ngay_thuc_hien` datetime DEFAULT CURRENT_TIMESTAMP,
  `nguoi_thuc_hien` int DEFAULT NULL,
  `ma_bs_ket_luan` int DEFAULT NULL,
  `ket_luan` text,
  `nhom_mau` varchar(10) DEFAULT NULL,
  `dong_mau_co_ban` text,
  `ghi_chu_them` text,
  `trang_thai` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_TK_NV12` (`nguoi_thuc_hien`),
  KEY `Fk_mactchidinh` (`ma_chi_tiet_chi_dinh`),
  KEY `FK_TK_NV13` (`ma_bs_ket_luan`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ket_qua_xet_nghiem`
--

LOCK TABLES `ket_qua_xet_nghiem` WRITE;
/*!40000 ALTER TABLE `ket_qua_xet_nghiem` DISABLE KEYS */;
INSERT INTO `ket_qua_xet_nghiem` VALUES (16,71,'2026-06-07 00:18:21',247,222,'=== PHIẾU BÁO CÁO XÉT NGHIỆM LÂM SÀNG ===\n\nDịch vụ thực hiện: XÉT NGHIỆM SINH HÓA MÁU\n--------------------------------------------------------\n+ Glucose: 5.2 mmol/L\n+ Ure: 4.8 mmol/L\n+ Creatinin: 76 µmol/L\n','','','','DA_DUYET');
/*!40000 ALTER TABLE `ket_qua_xet_nghiem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ket_qua_xn_chi_so`
--

DROP TABLE IF EXISTS `ket_qua_xn_chi_so`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ket_qua_xn_chi_so` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ket_qua_xet_nghiem_id` int NOT NULL,
  `ma_chi_so` varchar(50) NOT NULL,
  `ten_chi_so` varchar(255) NOT NULL,
  `gia_tri` varchar(100) DEFAULT NULL,
  `don_vi` varchar(50) DEFAULT NULL,
  `chi_so_tham_chieu` varchar(100) DEFAULT NULL,
  `bat_thuong` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kqxn_chiso_kqxn` (`ket_qua_xet_nghiem_id`),
  KEY `idx_kqxn_chiso_ma` (`ma_chi_so`),
  CONSTRAINT `fk_kqxn_chiso_kqxn` FOREIGN KEY (`ket_qua_xet_nghiem_id`) REFERENCES `ket_qua_xet_nghiem` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ket_qua_xn_chi_so`
--

LOCK TABLES `ket_qua_xn_chi_so` WRITE;
/*!40000 ALTER TABLE `ket_qua_xn_chi_so` DISABLE KEYS */;
INSERT INTO `ket_qua_xn_chi_so` VALUES (38,16,'glucose','Glucose (Đường huyết)','5.2','mmol/L','3.9 - 6.4',0,'2026-06-07 00:18:21'),(39,16,'ure','Ure','4.8','mmol/L','2.5 - 7.5',0,'2026-06-07 00:18:21'),(40,16,'creatinin','Creatinin','76','µmol/L','44 - 106',0,'2026-06-07 00:18:21');
/*!40000 ALTER TABLE `ket_qua_xn_chi_so` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kham_lam_sang`
--

DROP TABLE IF EXISTS `kham_lam_sang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kham_lam_sang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ly_do_kham` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tien_su_ban_than` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `benh_su` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `chan_doan_so_bo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loi_dan_bac_si` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ket_qua_kham_can_lam_sang` text COLLATE utf8mb4_unicode_ci,
  `kham_lam_sang` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ma_phieu_kham` (`ma_phieu_kham`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kham_lam_sang`
--

LOCK TABLES `kham_lam_sang` WRITE;
/*!40000 ALTER TABLE `kham_lam_sang` DISABLE KEYS */;
INSERT INTO `kham_lam_sang` VALUES (112,705,'[Dịch vụ ID: 5] ','4','4','4','4','','4'),(113,706,'[Dịch vụ ID: 1] ','1','1','1','1','1\n- Xét nghiệm (Xét nghiệm Nhóm máu (ABO, Rh)): === PHIẾU BÁO CÁO XÉT NGHIỆM LÂM SÀNG ===\n\nDịch vụ thực hiện: XÉT NGHIỆM SINH HÓA MÁU\n--------------------------------------------------------\n+ Glucose: 5.2 mmol/L\n+ Ure: 4.8 mmol/L\n+ Creatinin: 76 µmol/L\n','1'),(114,707,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(115,708,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(116,709,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(117,710,'[Dịch vụ ID: 1] 1','1','1','1','1','','1'),(118,711,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(119,712,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(120,713,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(121,714,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(122,715,'[Dịch vụ ID: 1] ','c','c','c','c','c','c'),(123,716,'[Dịch vụ ID: 1] ','1','1','1','1','1','1'),(124,717,'[Dịch vụ ID: 1] ','1','1','1','1','1','1');
/*!40000 ALTER TABLE `kham_lam_sang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kho_thuoc`
--

DROP TABLE IF EXISTS `kho_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kho_thuoc` (
  `id_kho` int NOT NULL AUTO_INCREMENT,
  `ma_thuoc` int NOT NULL,
  `so_luong_ton` int NOT NULL DEFAULT '0',
  `ngay_cap_nhat_cuoi` datetime NOT NULL,
  PRIMARY KEY (`id_kho`),
  UNIQUE KEY `ma_thuoc` (`ma_thuoc`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kho_thuoc`
--

LOCK TABLES `kho_thuoc` WRITE;
/*!40000 ALTER TABLE `kho_thuoc` DISABLE KEYS */;
INSERT INTO `kho_thuoc` VALUES (1,1,5393,'2026-06-10 03:18:22'),(2,3,1110,'2025-11-24 23:17:55'),(3,2,0,'2025-12-25 22:04:25'),(5,5,292,'2025-12-19 17:04:29'),(6,6,40,'2025-12-19 17:04:29'),(7,7,380,'2025-12-19 17:04:29'),(8,8,16,'2025-12-19 17:04:29'),(9,9,4340,'2025-12-19 17:04:29'),(10,10,200,'2025-12-19 17:04:29'),(11,11,6,'2025-12-19 17:04:29'),(12,12,120,'2025-12-19 17:04:29'),(13,13,20,'2025-12-19 17:04:29');
/*!40000 ALTER TABLE `kho_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lich_tai_kham`
--

DROP TABLE IF EXISTS `lich_tai_kham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lich_tai_kham` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ma_benh_nhan` int NOT NULL,
  `ma_chuyen_khoa` int NOT NULL,
  `ma_phieu_kham` int DEFAULT NULL,
  `ma_nhan_vien` int NOT NULL,
  `ngay_tai_kham` date NOT NULL,
  `ghi_chu` text,
  `trang_thai` varchar(255) DEFAULT NULL,
  `da_gui_thong_bao` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `ma_benh_nhan` (`ma_benh_nhan`),
  KEY `ma_phieu_kham` (`ma_phieu_kham`),
  KEY `fk_lichtaikhamnhanvien` (`ma_nhan_vien`),
  KEY `fk_idck` (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lich_tai_kham`
--

LOCK TABLES `lich_tai_kham` WRITE;
/*!40000 ALTER TABLE `lich_tai_kham` DISABLE KEYS */;
INSERT INTO `lich_tai_kham` VALUES (12,12,1,NULL,214,'2026-07-11','','CHUA_DEN',NULL);
/*!40000 ALTER TABLE `lich_tai_kham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nha_cung_cap`
--

DROP TABLE IF EXISTS `nha_cung_cap`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nha_cung_cap` (
  `ma_nha_cung_cap` int NOT NULL AUTO_INCREMENT,
  `ten_nha_cung_cap` varchar(100) NOT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `email` varchar(20) NOT NULL,
  `ghi_chu` text,
  `so_dien_thoai` varchar(20) NOT NULL,
  PRIMARY KEY (`ma_nha_cung_cap`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `so_dien_thoai` (`so_dien_thoai`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nha_cung_cap`
--

LOCK TABLES `nha_cung_cap` WRITE;
/*!40000 ALTER TABLE `nha_cung_cap` DISABLE KEYS */;
INSERT INTO `nha_cung_cap` VALUES (1,'Công ty Dược phẩm Thành Công1','200 Lạc Long Quân, Hà Nội','thanhcong@gmail.com','','2438889999'),(3,'cc','','cc_supplier@gmail.co','','01123213211'),(4,'Công ty CP Dược Hậu Giang','288 Bis Nguyễn Văn Cừ, Cần Thơ','dhg@dhgpharma.com.vn',NULL,'02923891433'),(5,'Công ty CP Traphaco','75 Yên Ninh, Ba Đình, Hà Nội','info@traphaco.com.vn',NULL,'02437666612'),(6,'Công ty TNHH MTV Dược Sài Gòn','18-20 Nguyễn Trường Tộ, Q.4, TP.HCM','contact@sapharco.com',NULL,'02839400388'),(7,'Công ty CP Dược phẩm Imexpharm','Số 4, đường 30/4, Cao Lãnh, Đồng Tháp','imexpharm@imexpharm.',NULL,'02773851941'),(8,'Công ty CP Dược phẩm Trung ương CPC1','87 Nguyễn Huy Tưởng, Thanh Xuân, Hà Nội','cpc1@cpc1.com.vn',NULL,'02438583543'),(20,'Công ty Dược phẩm Thành Công','200 Lạc Long Quân, Hà Nội','thanhcong1@gmail.com','','02438889998');
/*!40000 ALTER TABLE `nha_cung_cap` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `ma_nhan_vien` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `gioi_tinh` int DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL,
  `dia_chi` varchar(255) DEFAULT NULL,
  `so_dien_thoai` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `chuyen_khoa` int DEFAULT NULL,
  `bang_cap` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `chuc_vu` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `ngay_vao_lam` date DEFAULT NULL,
  `cccd` varchar(20) NOT NULL,
  PRIMARY KEY (`ma_nhan_vien`),
  UNIQUE KEY `unique_cccd` (`cccd`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_sdt` (`so_dien_thoai`),
  KEY `FK_CV_NV` (`chuc_vu`)
) ENGINE=InnoDB AUTO_INCREMENT=262 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES (214,'thanh tháo',1,'2000-11-28','HCM','0123456782','bstq@gmail.com',1,'đại học bách khoa','Bác sĩ','2025-11-29','123456789124'),(215,'Lê Văn Lộc',1,'1990-05-12','HCM','0901000101','bstq2@gmail.com',1,'Thạc sĩ Y','Bác sĩ','2026-01-14','12345678912401'),(216,'trúc minh',1,'2000-11-28','HCM','0123456783','nhikhoa@gmail.com',3,'đại học bách khoa','Bác sĩ','2025-11-29','123456789125'),(217,'Phạm Minh Anh',0,'1993-08-20','HCM','0901000102','nhikhoa2@gmail.com',3,'Đại học Y Dược','Bác sĩ','2026-01-14','12345678912501'),(218,'minh tâm',1,'2000-11-28','HCM','0123456784','taimuihong@gmail.com',4,'đại học bách khoa','Bác sĩ','2025-11-29','123456789126'),(219,'Ngô Quốc Huy',1,'1989-12-01','HCM','0901000103','tmh2@gmail.com',4,'Bác sĩ CKI','Bác sĩ','2026-01-14','12345678912601'),(220,'thành phát',1,'2000-11-28','HCM','0123456785','ranghammat@gmail.com',5,'đại học bách khoa','Bác sĩ','2025-11-29','123456789111'),(221,'Trần Mỹ Dung',0,'1994-06-15','HCM','0901000104','rhm2@gmail.com',5,'Đại học Y','Bác sĩ','2026-01-14','12345678911101'),(222,'trọng phúc',1,'2000-11-28','HCM','0123456786','xetnghiem@gmail.com',7,'đại học bách khoa','Bác sĩ','2025-11-29','123456789321'),(223,'Hoàng Thu Trang',0,'1995-11-11','HCM','0901000105','bsxn2@gmail.com',7,'Thạc sĩ Y','Bác sĩ','2026-01-14','12345678932101'),(224,'hồng hà',1,'2000-11-28','HCM','0223456789','timmach@gmail.com',11,'đại học bách khoa','Bác sĩ','2025-11-29','123456789129'),(225,'Đặng Tiến Dũng',1,'1987-03-30','HCM','0901000106','timmach2@gmail.com',11,'Bác sĩ CKII','Bác sĩ','2026-01-14','12345678912901'),(226,'thái hồ',1,'2000-12-14','HCM','0123451234','cdha@gmail.com',12,'ĐẠI HỌC SÀI GÒN','Bác sĩ','2025-12-03','123456781234'),(227,'Bùi Thanh Sơn',1,'1991-09-09','HCM','0901000107','cdha2@gmail.com',12,'Đại học Y','Bác sĩ','2026-01-14','12345678123401'),(228,'thanh minh',1,'2000-11-28','HCM','0123456789','trolynhikhoa@gmail.com',3,'đại học bách khoa','Trợ lý bác sĩ chuyên khoa','2025-11-29','523456789123'),(229,'Nguyễn Phương Thảo',0,'2002-05-05','HCM','0902000101','tl_nhi2@gmail.com',3,'Cao đẳng Y','Trợ lý bác sĩ chuyên khoa','2026-01-14','52345678912301'),(230,'thịnh phát',1,'2000-11-28','HCM','0987654309','trolytaimuihong@gmail.com',4,'đại học bách khoa','Trợ lý bác sĩ chuyên khoa','2025-11-29','113456789123'),(231,'Lý Hải Đăng',1,'2001-02-12','HCM','0902000102','tl_tmh2@gmail.com',4,'Trung cấp Y','Trợ lý bác sĩ chuyên khoa','2026-01-14','11345678912301'),(232,'kiều duyên',1,'2000-11-28','HCM','0989898998','trolyranghammat@gmail.com',5,'đại học bách khoa','Trợ lý bác sĩ chuyên khoa','2025-11-29','123456789345'),(233,'Vũ Minh Nguyệt',0,'2001-10-20','HCM','0902000103','tl_rhm2@gmail.com',5,'Cao đẳng Y','Trợ lý bác sĩ chuyên khoa','2026-01-14','12345678934501'),(234,'thảo nguyên',1,'2000-11-28','HCM','0939768936','trolytimmach@gmail.com',11,'đại học bách khoa','Trợ lý bác sĩ chuyên khoa','2025-11-29','123456789000'),(235,'Trần Văn Tám',1,'1998-03-03','HCM','0902000104','tl_tmach2@gmail.com',11,'Trung cấp Y','Trợ lý bác sĩ chuyên khoa','2026-01-14','12345678900001'),(236,'minh thúy',0,'2000-11-28','HCM','0123456733','trolytq@gmail.com',1,'đại học bách khoa','Trợ lý bác sĩ tổng quát','2025-11-29','123456789888'),(237,'Lê Kiều Oanh',0,'1999-12-12','HCM','0902000105','tl_tq2@gmail.com',1,'Cao đẳng Điều dưỡng','Trợ lý bác sĩ tổng quát','2026-01-14','12345678988801'),(238,'thanh hà',1,'2000-11-28','HCM','0233456789','letan@gmail.com',0,'đại học bách khoa','Lễ tân','2025-11-29','1763456789123'),(239,'manh vũ',1,'2000-12-14','HCM','0123451298','letan1@gmail.com',0,'ĐẠI HỌC SÀI GÒN','Lễ tân','2025-12-03','123456787689'),(240,'thành minh',1,'2000-11-28','HCM','0876456789','thungan@gmail.com',0,'đại học bách khoa','Thu ngân','2025-11-29','123456789112'),(241,'Bùi Bích Phương',0,'1997-04-14','HCM','0903000101','thungan2@gmail.com',0,'Đại học Tài chính','Thu ngân','2026-01-14','12345678911201'),(242,'khánh minh',1,'2000-11-28','HCM','0113456789','duocsi@gmail.com',0,'đại học bách khoa','Dược sĩ','2025-11-29','223456789123'),(243,'Trần Anh Tuấn',1,'1995-01-01','HCM','0903000102','duocsi2@gmail.com',0,'Đại học Y Dược','Dược sĩ','2026-01-14','22345678912301'),(244,'minh tân',1,'2000-11-28','HCM','0123312321','kho@gmail.com',0,'đại học bách khoa','Nhân viên kho','2025-11-29','987654321123'),(245,'Lý Gia Thành',1,'1992-06-06','HCM','0903000103','kho2@gmail.com',0,'Đại học GTVT','Nhân viên kho','2026-01-14','98765432112301'),(247,'Nguyễn Văn Nam',1,'1998-07-07','HCM','0903000104','ktv_xn2@gmail.com',7,'Đại học Y','Kỹ thuật viên Xét nghiệm','2026-01-14','12345678876501'),(248,'Phúc lộc thọ',1,'2000-12-14','HCM','00123451212','ktvcdha@gmail.com',12,'ĐẠI HỌC SÀI GÒN','Kỹ thuật viên Chẩn đoán hình ảnh','2025-12-03','123456781212'),(249,'Hà Quang Hải',1,'1996-04-04','HCM','0903000105','ktv_ha2@gmail.com',12,'Đại học Bách Khoa','Kỹ thuật viên Chẩn đoán hình ảnh','2026-01-14','12345678121201'),(250,'admin',1,'2000-12-14','HCM','0123456943','tamduonge7@gmail.com',0,'ĐẠI HỌC SÀI GÒN','Quản trị viên','2025-12-03','123456789011'),(251,'Thu Hà',1,'1998-07-07','HCM','00903000123','ktv_xn1@gmail.com',7,'Đại học Y','Kỹ thuật viên Xét nghiệm','2026-01-14','12345678876561'),(261,'a',1,'2026-05-22','HCM','1223005678','tamduongcc9@gmail.com',1,'Thạc sĩ','Dược sĩ','2026-05-26','089653781123');
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_chi_dinh`
--

DROP TABLE IF EXISTS `phieu_chi_dinh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_chi_dinh` (
  `ma_phieu_chi_dinh` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ma_nhan_vien_chi_dinh` int NOT NULL,
  `ngay_chi_dinh` datetime DEFAULT CURRENT_TIMESTAMP,
  `tong_tien` double DEFAULT NULL,
  PRIMARY KEY (`ma_phieu_chi_dinh`),
  KEY `fk-manvv` (`ma_nhan_vien_chi_dinh`),
  KEY `fk-maphieukham` (`ma_phieu_kham`)
) ENGINE=InnoDB AUTO_INCREMENT=191 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_chi_dinh`
--

LOCK TABLES `phieu_chi_dinh` WRITE;
/*!40000 ALTER TABLE `phieu_chi_dinh` DISABLE KEYS */;
INSERT INTO `phieu_chi_dinh` VALUES (189,706,214,'2026-06-07 00:18:10',60000),(190,723,223,'2026-06-14 15:55:42',80000);
/*!40000 ALTER TABLE `phieu_chi_dinh` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_chuyen_khoa`
--

DROP TABLE IF EXISTS `phieu_chuyen_khoa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_chuyen_khoa` (
  `ma_phieu_chuyen` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ma_benh_nhan` int NOT NULL,
  `ma_nhan_vien` int NOT NULL COMMENT 'Bác sĩ chỉ định chuyển',
  `ma_ck_tu` int NOT NULL,
  `ma_ck_den` int NOT NULL,
  `tom_tat_lam_sang` text,
  `ly_do_chuyen` text,
  `ngay_chuyen` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_dang_ky_moi` int DEFAULT NULL,
  PRIMARY KEY (`ma_phieu_chuyen`),
  KEY `fk_phieuchuyenkhoa_maphieukham` (`ma_phieu_kham`),
  KEY `fk_phieuchuyenkhoa_manv` (`ma_nhan_vien`),
  KEY `fk_phieuchuyenkhoa_mackchuyentu` (`ma_ck_tu`),
  KEY `fk_phieuchuyenkhoa_machuyenkhoaden` (`ma_ck_den`),
  KEY `fk_phieuchuyenkhoa_iddangkymoi` (`id_dang_ky_moi`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_chuyen_khoa`
--

LOCK TABLES `phieu_chuyen_khoa` WRITE;
/*!40000 ALTER TABLE `phieu_chuyen_khoa` DISABLE KEYS */;
/*!40000 ALTER TABLE `phieu_chuyen_khoa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_kham`
--

DROP TABLE IF EXISTS `phieu_kham`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_kham` (
  `ma_phieu_kham` int NOT NULL AUTO_INCREMENT,
  `ma_benh_nhan` int NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `ma_chuyen_khoa` int DEFAULT NULL,
  `ngay_kham` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` varchar(50) DEFAULT NULL,
  `ghi_chu` text,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ma_dich_vu` int DEFAULT NULL,
  PRIMARY KEY (`ma_phieu_kham`),
  KEY `ma_benh_nhan` (`ma_benh_nhan`),
  KEY `ma_nhan_vien` (`ma_nhan_vien`),
  KEY `ma_chuyen_khoa` (`ma_chuyen_khoa`)
) ENGINE=InnoDB AUTO_INCREMENT=724 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_kham`
--

LOCK TABLES `phieu_kham` WRITE;
/*!40000 ALTER TABLE `phieu_kham` DISABLE KEYS */;
INSERT INTO `phieu_kham` VALUES (705,2,224,11,'2026-06-06 18:51:59','HOAN_THANH',NULL,'2026-06-06 18:51:59',NULL),(706,1,214,1,'2026-06-07 00:17:11','HOAN_THANH',NULL,'2026-06-07 00:17:11',NULL),(707,1,214,1,'2026-06-09 15:35:19','HOAN_THANH',NULL,'2026-06-09 15:35:19',NULL),(708,2,214,1,'2026-06-09 21:24:36','HOAN_THANH',NULL,'2026-06-09 21:24:36',NULL),(709,3,214,1,'2026-06-09 21:54:00','HOAN_THANH',NULL,'2026-06-09 21:54:00',NULL),(710,26,214,1,'2026-06-09 21:56:15','HOAN_THANH',NULL,'2026-06-09 21:56:15',NULL),(711,37,214,1,'2026-06-09 22:06:51','HOAN_THANH',NULL,'2026-06-09 22:06:51',NULL),(712,22,214,1,'2026-06-09 22:55:16','HOAN_THANH',NULL,'2026-06-09 22:55:16',NULL),(713,1,214,1,'2026-06-10 00:00:41','HOAN_THANH',NULL,'2026-06-10 00:00:41',NULL),(714,2,214,1,'2026-06-10 00:10:11','CHO_BAC_SI',NULL,'2026-06-10 00:10:11',NULL),(715,3,214,1,'2026-06-10 02:32:22','HOAN_THANH',NULL,'2026-06-10 02:32:22',NULL),(716,1,214,1,'2026-06-11 18:33:41','HOAN_THANH',NULL,'2026-06-11 18:33:41',NULL),(717,3,214,1,'2026-06-11 18:42:45','HOAN_THANH',NULL,'2026-06-11 18:42:45',NULL),(718,12,236,1,'2026-06-11 18:55:06','CHO_BAC_SI',NULL,'2026-06-11 18:55:06',NULL),(719,3,230,4,'2026-06-12 22:02:20','CHO_BAC_SI',NULL,'2026-06-12 22:02:20',NULL),(720,12,230,4,'2026-06-12 22:17:18','CHO_BAC_SI',NULL,'2026-06-12 22:17:18',NULL),(721,1,236,1,'2026-06-14 14:35:33','HOAN_THANH',NULL,'2026-06-14 14:35:33',NULL),(722,1,236,1,'2026-06-14 15:53:22','CHO_BAC_SI',NULL,'2026-06-14 15:53:22',NULL),(723,3,223,7,'2026-06-14 15:55:42','CHO','','2026-06-14 15:55:42',7);
/*!40000 ALTER TABLE `phieu_kham` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phieu_nhap_thuoc`
--

DROP TABLE IF EXISTS `phieu_nhap_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_nhap_thuoc` (
  `ma_phieu_nhap_thuoc` int NOT NULL AUTO_INCREMENT,
  `ngay_nhap` datetime NOT NULL,
  `ma_nhan_vien_nhap` int NOT NULL,
  `ma_nha_cung_cap` int DEFAULT NULL,
  `tong_tien_nhap` decimal(10,2) DEFAULT NULL,
  `trang_thai` varchar(50) NOT NULL DEFAULT 'Hoàn thành',
  `ghi_chu` text,
  PRIMARY KEY (`ma_phieu_nhap_thuoc`),
  KEY `ma_nhan_vien_nhap` (`ma_nhan_vien_nhap`),
  KEY `ma_nha_cung_cap` (`ma_nha_cung_cap`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phieu_nhap_thuoc`
--

LOCK TABLES `phieu_nhap_thuoc` WRITE;
/*!40000 ALTER TABLE `phieu_nhap_thuoc` DISABLE KEYS */;
INSERT INTO `phieu_nhap_thuoc` VALUES (6,'2025-11-20 20:13:51',245,1,50000.00,'Hoàn thành',NULL),(7,'2025-11-20 20:21:38',245,1,0.00,'Đang tạo',NULL),(8,'2025-11-20 20:22:28',245,1,25000.00,'Hoàn thành',NULL),(9,'2025-11-20 20:39:30',245,1,5000.00,'Hoàn thành',NULL),(10,'2025-11-20 21:01:02',245,1,0.00,'Đang tạo',NULL),(11,'2025-11-20 21:08:01',245,1,5000.00,'Hoàn thành',NULL),(12,'2025-11-20 23:36:44',245,1,500000.00,'Hoàn thành',NULL),(13,'2025-11-24 22:12:10',245,3,0.00,'Đang tạo',NULL),(14,'2025-11-24 22:13:23',245,1,50000.00,'Hoàn thành',NULL),(15,'2025-11-24 22:17:27',245,3,2000000.00,'Hoàn thành',NULL),(16,'2025-11-24 22:19:23',245,3,0.00,'Đang tạo',NULL),(17,'2025-11-24 22:44:04',245,3,0.00,'Đang tạo',NULL),(18,'2025-11-24 22:45:23',245,1,0.00,'Đang tạo',NULL),(19,'2025-11-24 22:50:52',245,1,0.00,'Đang tạo',NULL),(20,'2025-11-24 23:07:17',245,1,8700000.00,'Hoàn thành',NULL),(22,'2025-12-25 22:03:49',245,1,121000.00,'Hoàn thành',NULL),(23,'2026-01-14 15:54:06',244,1,0.00,'Đang tạo',NULL),(24,'2026-06-10 03:18:22',244,1,15000.00,'Hoan thanh','');
/*!40000 ALTER TABLE `phieu_nhap_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phong_chuc_nang`
--

DROP TABLE IF EXISTS `phong_chuc_nang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phong_chuc_nang` (
  `ma_phong` int NOT NULL AUTO_INCREMENT,
  `ten_phong` varchar(100) DEFAULT NULL,
  `loai_phong` varchar(50) NOT NULL,
  `ma_chuyen_khoa` int DEFAULT NULL,
  `ma_chuc_vu` int DEFAULT NULL,
  PRIMARY KEY (`ma_phong`),
  UNIQUE KEY `ten_phong` (`ten_phong`),
  KEY `fk_phong_chuyenkhoa` (`ma_chuyen_khoa`),
  KEY `fk_phong_chucvu` (`ma_chuc_vu`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phong_chuc_nang`
--

LOCK TABLES `phong_chuc_nang` WRITE;
/*!40000 ALTER TABLE `phong_chuc_nang` DISABLE KEYS */;
INSERT INTO `phong_chuc_nang` VALUES (1,'P. Khám Nội Tổng Quát','KHOA_NOI',1,16),(3,'P. Chẩn Đoán Hình ảnh','CLS_CHAN_DOAN_HINH_ANH',12,16),(4,'P. Xét nghiệm','CLS_XET_NGHIEM',7,16),(5,'P. Khám Nhi Khoa','KHAM_CHUYEN_KHOA',3,16),(6,'P.Tai - Mũi - Họng','KHAM_CHUYEN_KHOA',4,16),(7,'P. Răng - Hàm - Mặt','KHAM_CHUYEN_KHOA',5,16),(8,'P. Tim mạch','KHAM_CHUYEN_KHOA',11,16),(13,'Quầy Tiếp Đón & Lễ Tân','LE_TAN',NULL,3),(14,'Quầy Thuốc (Cấp phát)','NHA_THUOC',NULL,5),(15,'Kho Dược Chính','KHO_DUOC',NULL,6),(16,'Quầy thu ngân','thu tiền',NULL,4),(23,'c1','c1',1,16);
/*!40000 ALTER TABLE `phong_chuc_nang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tai_khoan`
--

DROP TABLE IF EXISTS `tai_khoan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tai_khoan` (
  `ma_tai_khoan` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) NOT NULL,
  `mat_khau` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ma_nhan_vien` int NOT NULL,
  `vai_tro` varchar(50) DEFAULT NULL,
  `lan_dau_dang_nhap` bit(1) DEFAULT b'1',
  PRIMARY KEY (`ma_tai_khoan`),
  KEY `FK_TK_NV` (`ma_nhan_vien`),
  KEY `FK_TaiKhoan_VaiTro` (`vai_tro`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tai_khoan`
--

LOCK TABLES `tai_khoan` WRITE;
/*!40000 ALTER TABLE `tai_khoan` DISABLE KEYS */;
INSERT INTO `tai_khoan` VALUES (30,'thanhtrúc','bstq@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',214,'BAC_SI',_binary '\0'),(31,'vanloc','bstq2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',215,'BAC_SI',_binary ''),(32,'thanhtrúc','nhikhoa@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',216,'BAC_SI',_binary '\0'),(33,'minhanh','nhikhoa2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',217,'BAC_SI',_binary ''),(34,'thanh trúc','taimuihong@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',218,'BAC_SI',_binary '\0'),(35,'quochuy','tmh2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',219,'BAC_SI',_binary ''),(36,'thanh trúc','ranghammat@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',220,'BAC_SI',_binary '\0'),(37,'mydung','rhm2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',221,'BAC_SI',_binary ''),(38,'thanh trúc','xetnghiem@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',222,'BAC_SI',_binary '\0'),(39,'thutrang','bsxn2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',223,'BAC_SI',_binary ''),(40,'thanh trúc','timmach@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',224,'BAC_SI',_binary '\0'),(41,'tiendung','timmach2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',225,'BAC_SI',_binary ''),(42,'thu hà','cdha@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',226,'BAC_SI',_binary '\0'),(43,'thanhson','cdha2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',227,'BAC_SI',_binary ''),(44,'hồng hà','trolynhikhoa@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',228,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary '\0'),(45,'phuongthao','tl_nhi2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',229,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary ''),(46,'hồng hà','trolytaimuihong@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',230,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary '\0'),(47,'haidang','tl_tmh2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',231,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary ''),(48,'hồng hà','trolyranghammat@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',232,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary '\0'),(49,'minhnguyet','tl_rhm2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',233,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary ''),(50,'hồng hà','trolytimmach@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',234,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary '\0'),(51,'vantam','tl_tmach2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',235,'TRO_LY_BAC_SI_CHUYEN_KHOA',_binary ''),(52,'minh thúy','trolytq@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',236,'TRO_LY_BAC_SI_TONG_QUAT',_binary '\0'),(53,'kieuoanh','tl_tq2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',237,'TRO_LY_BAC_SI_TONG_QUAT',_binary ''),(54,'thanh hà','letan@gmail.com','$2a$10$qvqliB5bTqN3cF6xoit9iejLBT6jBiJdkBk0tTP7BvR.Cxay2VPi.',238,'LE_TAN',_binary '\0'),(55,'manh vũ','letan1@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',239,'LE_TAN',_binary ''),(56,'thành minh','thungan@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',240,'THU_NGAN',_binary '\0'),(57,'bichphuong','thungan2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',241,'THU_NGAN',_binary ''),(58,'khánh minh','duocsi@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',242,'DUOC_SI',_binary '\0'),(59,'anhtuan','duocsi2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',243,'DUOC_SI',_binary ''),(60,'minh tân','kho@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',244,'NHAN_VIEN_KHO',_binary '\0'),(61,'giathanh','kho2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',245,'NHAN_VIEN_KHO',_binary ''),(63,'vannam','ktv_xn2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',247,'KY_THUAT_VIEN_XET_NGHIEM',_binary ''),(64,'Phúc lộc thọ','ktvcdha@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',248,'KY_THUAT_VIEN_CHAN_DOAN_HINH_ANH',_binary '\0'),(65,'quanghai','ktv_ha2@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',249,'KY_THUAT_VIEN_CHAN_DOAN_HINH_ANH',_binary ''),(66,'admin','tamduonge7@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',250,'QUAN_TRI_VIEN',_binary '\0'),(67,'Thu Hà','ktv_xn1@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',251,'KY_THUAT_VIEN_XET_NGHIEM',_binary '\0'),(71,'tam110','tamduongcc9@gmail.com','$2a$10$Y2VxNSvB8OOCfWAGLzRBAeTO5JtsDTHij7ecm2NzGM2Ek4Oc0JJbO',261,'BAC_SI',_binary '');
/*!40000 ALTER TABLE `tai_khoan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `thuoc`
--

DROP TABLE IF EXISTS `thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thuoc` (
  `ma_thuoc` int NOT NULL AUTO_INCREMENT,
  `ten_thuoc` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `hoat_chat` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `ham_luong` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `dang_thuoc` varchar(50) DEFAULT NULL,
  `loai_thuoc` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `don_vi_tinh` varchar(20) DEFAULT NULL,
  `don_gia_nhap` decimal(15,2) DEFAULT '0.00',
  `don_gia_ban` decimal(15,2) DEFAULT '0.00',
  `ngay_san_xuat` date DEFAULT NULL,
  `han_su_dung` date DEFAULT NULL,
  `nha_san_xuat` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `nuoc_san_xuat` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `ghi_chu` text,
  PRIMARY KEY (`ma_thuoc`),
  UNIQUE KEY `ten_thuoc` (`ten_thuoc`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `thuoc`
--

LOCK TABLES `thuoc` WRITE;
/*!40000 ALTER TABLE `thuoc` DISABLE KEYS */;
INSERT INTO `thuoc` VALUES (1,'Paracetamol 500mg','Paracetamol','500mg','Viên nén','Uống','viên',10000.00,12000.00,'2025-01-10','2027-01-10','DHG Pharma','Việt Nam',''),(2,'Vitamin C 1000mg11','Ascorbic Acid22','1000mg2','Viên sủi3','Uống3','viên3',20000.00,24000.00,'2024-12-01','2026-12-01','OPC Pharma1','Việt Nam1',''),(3,'Nước muối sinh lý 0.9%','NaCl 0.9%',NULL,'Dung dịch','Nhỏ','chai',0.00,12000.00,'2025-02-15','2027-02-15','Bidiphar','Việt Nam',NULL),(5,'Panadol Extra','Paracetamol, Caffeine','500mg, 65mg','Viên nén','Giảm đau','Vỉ',0.00,15000.00,'2024-01-10','2027-01-10','GSK','Việt Nam','Hộp đỏ'),(6,'Augmentin 1g','Amoxicillin, Clavulanic','1000mg','Viên nén','Kháng sinh','Viên',0.00,25000.00,'2023-12-01','2025-12-01','GSK','Anh','Kê đơn'),(7,'Berberin Mộc Hương','Berberin','100mg','Viên nén','Tiêu hóa','Lọ',0.00,50000.00,'2024-05-05','2027-05-05','Dược TW3','Việt Nam','Đau bụng'),(8,'Smecta','Diosmectite','3g','Bột pha','Tiêu hóa','Gói',0.00,4000.00,'2024-02-20','2026-02-20','Ipsen','Pháp','Tiêu chảy'),(9,'Eugica Fort','Eucalyptol, Ginger, Menthol','N/A','Viên nang','Hô hấp','Hộp',0.00,80000.00,'2024-03-15','2026-03-15','Mega We Care','Thái Lan','Trị ho'),(10,'Efferalgan 500mg','Paracetamol','500mg','Viên sủi','Hạ sốt','Viên',0.00,6000.00,'2024-06-01','2026-06-01','UPSA','Pháp','Hòa tan'),(11,'Gaviscon Dual Action','Sodium alginate','10ml','Hỗn dịch','Dạ dày','Gói',0.00,7500.00,'2023-11-11','2025-11-11','Reckitt Benckiser','Anh','Trào ngược'),(12,'Insulin Lantus','Insulin glargine','100 U/ml','Dung dịch','Tiểu đường','Bút tiêm',0.00,350000.00,'2024-01-01','2025-06-01','Sanofi','Đức','Bảo quản lạnh'),(13,'Neurontin','Gabapentin','300mg','Viên nang','Thần kinh','Viên',0.00,12000.00,'2023-10-20','2026-10-20','Pfizer','Mỹ','Kê đơn'),(14,'Zyrtec','Cetirizine','10mg','Viên nén','Dị ứng','Vỉ',0.00,85000.00,'2024-04-01','2027-04-01','GSK','Thụy Sĩ','Viêm mũi'),(16,'Zyrtec123','Cetirizine','10mg','Viên nén','Dị ứng','Vỉ',70000.00,84000.00,'2024-04-01','2027-04-01','GSK','Thụy Sĩ','Viêm mũi');
/*!40000 ALTER TABLE `thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `toa_thuoc`
--

DROP TABLE IF EXISTS `toa_thuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `toa_thuoc` (
  `ma_toa_thuoc` int NOT NULL AUTO_INCREMENT,
  `ma_phieu_kham` int NOT NULL,
  `ghi_chu` text,
  `ngay_tao` datetime DEFAULT CURRENT_TIMESTAMP,
  `trang_thai` varchar(30) DEFAULT 'CHO_THANH_TOAN',
  PRIMARY KEY (`ma_toa_thuoc`),
  KEY `ma_phieu_kham` (`ma_phieu_kham`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `toa_thuoc`
--

LOCK TABLES `toa_thuoc` WRITE;
/*!40000 ALTER TABLE `toa_thuoc` DISABLE KEYS */;
INSERT INTO `toa_thuoc` VALUES (103,705,'','2026-06-06 18:52:48','CHO_THANH_TOAN'),(106,706,'','2026-06-07 00:18:50','CHO_THANH_TOAN'),(109,712,'','2026-06-09 22:55:39','DA_CAP_THUOC'),(112,713,'','2026-06-10 00:01:59','DA_CAP_THUOC'),(122,714,'','2026-06-10 00:59:33','DA_CAP_THUOC'),(123,713,'','2026-06-10 02:40:56','CHO_THANH_TOAN'),(129,716,'','2026-06-11 18:36:13','CHO_THANH_TOAN'),(132,717,'','2026-06-11 18:43:14','DA_CAP_THUOC'),(133,718,'','2026-06-11 20:06:20','CHO_THANH_TOAN');
/*!40000 ALTER TABLE `toa_thuoc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vai_tro`
--

DROP TABLE IF EXISTS `vai_tro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vai_tro` (
  `ma_vai_tro` varchar(100) NOT NULL,
  `ten_hien_thi` varchar(50) NOT NULL,
  `ten_bien_the` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ma_vai_tro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vai_tro`
--

LOCK TABLES `vai_tro` WRITE;
/*!40000 ALTER TABLE `vai_tro` DISABLE KEYS */;
INSERT INTO `vai_tro` VALUES ('BAC_SI','Bác sĩ',NULL),('DUOC_SI','Dược sĩ',NULL),('KY_THUAT_VIEN_CHAN_DOAN_HINH_ANH','Kỹ thuật viên chẩn đoán hình ảnh',NULL),('KY_THUAT_VIEN_XET_NGHIEM','Kỹ thuật viên Xét nghiệm',NULL),('LE_TAN','Lễ tân',NULL),('NHAN_VIEN_KHO','Nhân viên kho',NULL),('QUAN_TRI_VIEN','Quản trị viên',NULL),('THU_NGAN','Thu ngân',NULL),('TRO_LY_BAC_SI_CHUYEN_KHOA','Trợ lý bác sĩ chuyên khoa',NULL),('TRO_LY_BAC_SI_TONG_QUAT','Trợ lý bác sĩ tổng quát',NULL);
/*!40000 ALTER TABLE `vai_tro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'dbphongkham8'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_ThemNhanVienVaTaiKhoan` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ThemNhanVienVaTaiKhoan`(IN `p_HoTen` VARCHAR(100), IN `p_GioiTinh` BIT(2), IN `p_NgaySinh` DATE, IN `p_CCCD` VARCHAR(20), IN `p_DiaChi` VARCHAR(100), IN `p_SDT` VARCHAR(20), IN `p_Email` VARCHAR(100), IN `p_BangCap` VARCHAR(100), IN `p_ChucVu` VARCHAR(50), IN `p_ChuyenKhoa` VARCHAR(50), IN `p_NgayVaoLam` DATE, IN `p_Username` VARCHAR(100), IN `p_Password` VARCHAR(100), IN `p_Role` VARCHAR(50))
BEGIN

    DECLARE v_MaNV INT;

   
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

  
    START TRANSACTION;

   
    INSERT INTO nhan_vien (ho_ten, gioi_tinh, ngay_sinh, cccd, dia_chi, so_dien_thoai, email, bang_cap, chuc_vu, chuyen_khoa, ngay_vao_lam)
    VALUES (p_HoTen, p_GioiTinh, p_NgaySinh, p_CCCD, p_DiaChi, p_SDT, p_Email, p_BangCap, p_ChucVu, p_ChuyenKhoa, p_NgayVaoLam);

  
    SET v_MaNV = LAST_INSERT_ID();


    INSERT INTO tai_khoan (username, email, mat_khau, vai_tro, ma_nhan_vien, lan_dau_dang_nhap)
    VALUES (p_Username, p_Email, p_Password, p_Role, v_MaNV, 1);


    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-14 16:29:58
