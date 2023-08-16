-- MySQL dump 10.13  Distrib 5.7.33, for Linux (x86_64)
--
-- Host: localhost    Database: volumeaudio
-- ------------------------------------------------------
-- Server version	5.7.33-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `unitsmeasurements`
--

DROP TABLE IF EXISTS `unitsmeasurements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unitsmeasurements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unitsmeasurements`
--

LOCK TABLES `unitsmeasurements` WRITE;
/*!40000 ALTER TABLE `unitsmeasurements` DISABLE KEYS */;
INSERT INTO `unitsmeasurements` VALUES (1,'LOT','Batch Lot',NULL,NULL),(2,'BOX','Box',NULL,NULL),(3,'CG','Centigrams',NULL,NULL),(4,'CL','Centiliters',NULL,NULL),(5,'CM','Centimeters',NULL,NULL),(6,'CHN','Chain',NULL,NULL),(7,'CRT','CRATE',NULL,NULL),(8,'CMM','Cubic Millimeters',NULL,NULL),(9,'DAY','Days',NULL,NULL),(10,'DG','Decigrams',NULL,NULL),(11,'DL','Deciliters',NULL,NULL),(12,'DM','Decimeters',NULL,NULL),(13,'DOZ','Dozen',NULL,NULL),(14,'DRA','Dram',NULL,NULL),(15,'DRM','DRUM',NULL,NULL),(16,'EA','Each',NULL,NULL),(17,'FT','Feet',NULL,NULL),(18,'G','Grams',NULL,NULL),(19,'GRS','Gross',NULL,NULL),(20,'HUN','Hundreds',NULL,NULL),(21,'IN','Inches',NULL,NULL),(22,'KG','Kilograms',NULL,NULL),(23,'KL','Kiloliters',NULL,NULL),(24,'KM','Kilometers',NULL,NULL),(25,'KWH','Kilowatt Hours',NULL,NULL),(26,'LNK','Link',NULL,NULL),(27,'L','Liters',NULL,NULL),(28,'LT','Long Tons',NULL,NULL),(29,'M','Meters',NULL,NULL),(30,'MIL','Miles',NULL,NULL),(31,'MG','Milligrams',NULL,NULL),(32,'ML','Milliliters',NULL,NULL),(33,'MM','Millimeters',NULL,NULL),(34,'MDY','Person Day',NULL,NULL),(35,'LBS','Pounds',NULL,NULL),(36,'LBT','Pounds - Troy',NULL,NULL),(37,'SHW','Short Hundred Weight',NULL,NULL),(38,'SHT','Short Ton',NULL,NULL),(39,'ST','Short Tons',NULL,NULL),(40,'SCM','Square Centimeters',NULL,NULL),(41,'SDM','Square Decimeters',NULL,NULL),(42,'SF','Square Feet',NULL,NULL),(43,'SQF','Square Feet',NULL,NULL),(44,'SQI','Square Inches',NULL,NULL),(45,'SM','Square Meters',NULL,NULL),(46,'SQM','Square Miles',NULL,NULL),(47,'SMM','Square Millimeters',NULL,NULL),(48,'SQY','Square Yards',NULL,NULL),(49,'TON','Tons',NULL,NULL),(50,'TUB','TUB',NULL,NULL),(51,'UNT','Units (generic)',NULL,NULL),(52,'MHR','Work Hour',NULL,NULL),(53,'YD','Yard',NULL,NULL);
/*!40000 ALTER TABLE `unitsmeasurements` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-08-14 18:53:52
