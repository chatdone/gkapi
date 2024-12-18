USE `sbiz-test`;
-- MySQL dump 10.13  Distrib 8.0.25, for macos11 (x86_64)
--
-- Host: staging-test-v2.cfzuryazza4h.ap-southeast-1.rds.amazonaws.com    Database: sbiz-staging
-- ------------------------------------------------------
-- Server version	5.7.33-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


--
-- GTID state at the beginning of the backup 
--


--
-- Table structure for table `activity_tracker_daily_mv`
--

DROP TABLE IF EXISTS `activity_tracker_daily_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_tracker_daily_mv` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `task_id` int(10) unsigned NOT NULL,
  `day` int(10) DEFAULT '0',
  `month` int(10) DEFAULT '0',
  `year` int(10) DEFAULT '0',
  `total` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `activity_tracker_daily_mv_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_tracker_daily_mv_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_tracker_monthly_mv`
--

DROP TABLE IF EXISTS `activity_tracker_monthly_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_tracker_monthly_mv` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `task_id` int(10) unsigned NOT NULL,
  `week_number` int(10) DEFAULT '0',
  `year` int(10) DEFAULT NULL,
  `week_total` int(11) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `activity_tracker_monthly_mv_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_tracker_monthly_mv_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `activity_tracker_weekly_mv`
--

DROP TABLE IF EXISTS `activity_tracker_weekly_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_tracker_weekly_mv` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `task_id` int(10) unsigned NOT NULL,
  `week_number` int(10) DEFAULT NULL,
  `year` int(10) DEFAULT NULL,
  `monday` int(11) DEFAULT '0',
  `tuesday` int(11) DEFAULT '0',
  `wednesday` int(11) DEFAULT '0',
  `thursday` int(11) DEFAULT '0',
  `friday` int(11) DEFAULT '0',
  `saturday` int(11) DEFAULT '0',
  `sunday` int(11) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_weekly` int(11) GENERATED ALWAYS AS (((((((`monday` + `tuesday`) + `wednesday`) + `thursday`) + `friday`) + `saturday`) + `sunday`)) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `activity_tracker_weekly_mv_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_tracker_weekly_mv_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `refresh_token` text,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER admins_uuid_before_insert
		BEFORE INSERT ON admins FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `attendance_daily_summary_mv`
--

DROP TABLE IF EXISTS `attendance_daily_summary_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_daily_summary_mv` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `first_in` datetime DEFAULT NULL,
  `first_attendance_id` int(10) unsigned DEFAULT NULL,
  `last_attendance_id` int(10) unsigned DEFAULT NULL,
  `day` int(2) unsigned DEFAULT NULL,
  `month` int(2) unsigned DEFAULT NULL,
  `year` int(4) unsigned DEFAULT NULL,
  `tracked` int(10) unsigned NOT NULL DEFAULT '0',
  `worked` int(10) unsigned NOT NULL DEFAULT '0',
  `regular` int(10) unsigned NOT NULL DEFAULT '0',
  `overtime` int(10) unsigned NOT NULL DEFAULT '0',
  `generated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  CONSTRAINT `attendance_daily_summary_mv_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=302 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_labels`
--

DROP TABLE IF EXISTS `attendance_labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_labels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `attendance_labels_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER attendance_labels_uuid_before_insert
		BEFORE INSERT ON attendance_labels FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `attendance_settings`
--

DROP TABLE IF EXISTS `attendance_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_settings` (
  `company_id` int(10) unsigned NOT NULL,
  `allow_mobile` tinyint(1) NOT NULL DEFAULT '1',
  `allow_web` tinyint(1) NOT NULL DEFAULT '1',
  `require_verification` tinyint(1) NOT NULL DEFAULT '0',
  `require_location` tinyint(1) NOT NULL DEFAULT '0',
  `enable_2d` tinyint(1) NOT NULL DEFAULT '1',
  `enable_biometric` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`company_id`),
  CONSTRAINT `attendance_settings_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_tags`
--

DROP TABLE IF EXISTS `attendance_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_tags` (
  `attendance_id` int(10) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`attendance_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `attendance_tags_ibfk_1` FOREIGN KEY (`attendance_id`) REFERENCES `attendances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendance_verifications`
--

DROP TABLE IF EXISTS `attendance_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_verifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `s3_bucket` varchar(255) DEFAULT NULL,
  `s3_key` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_member_id` (`company_member_id`),
  CONSTRAINT `attendance_verifications_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER timesheet_verifications_uuid_before_insert
		BEFORE INSERT ON `attendance_verifications` FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `attendance_weekly_summary_mv`
--

DROP TABLE IF EXISTS `attendance_weekly_summary_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_weekly_summary_mv` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `week` int(2) unsigned DEFAULT NULL,
  `month` int(2) unsigned DEFAULT NULL,
  `year` int(4) unsigned DEFAULT NULL,
  `monday` int(11) DEFAULT '0',
  `tuesday` int(11) DEFAULT '0',
  `wednesday` int(11) DEFAULT '0',
  `thursday` int(11) DEFAULT '0',
  `friday` int(11) DEFAULT '0',
  `saturday` int(11) DEFAULT '0',
  `sunday` int(11) DEFAULT '0',
  `tracked_total` int(10) unsigned NOT NULL DEFAULT '0',
  `worked_total` int(10) unsigned NOT NULL DEFAULT '0',
  `regular_total` int(10) unsigned NOT NULL DEFAULT '0',
  `overtime_total` int(10) unsigned NOT NULL DEFAULT '0',
  `generated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  CONSTRAINT `attendance_weekly_summary_mv_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attendances`
--

DROP TABLE IF EXISTS `attendances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendances` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '1',
  `submitted_date` datetime DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `comments_out` varchar(255) DEFAULT NULL,
  `location_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_total` int(11) GENERATED ALWAYS AS (timestampdiff(SECOND,`start_date`,`end_date`)) VIRTUAL,
  `overtime` int(11) DEFAULT '0',
  `worked` int(11) DEFAULT '0',
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `verification_id` int(10) unsigned DEFAULT NULL,
  `attendance_label_id` int(10) unsigned DEFAULT NULL,
  `location` point DEFAULT NULL,
  `s3_key` varchar(255) DEFAULT NULL,
  `s3_bucket` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `verification_type` tinyint(1) DEFAULT NULL,
  `is_last_out` tinyint(1) NOT NULL DEFAULT '0',
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_member_id` (`company_member_id`),
  KEY `location_id` (`location_id`),
  KEY `verification_id` (`verification_id`),
  KEY `attendance_label_id` (`attendance_label_id`),
  CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attendances_ibfk_3` FOREIGN KEY (`verification_id`) REFERENCES `attendance_verifications` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attendances_ibfk_4` FOREIGN KEY (`attendance_label_id`) REFERENCES `attendance_labels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=830 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER timesheet_attendances_uuid_before_insert
		BEFORE INSERT ON `attendances` FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(32) NOT NULL,
  `source_type` varchar(80) NOT NULL,
  `source_id` int(10) unsigned DEFAULT NULL,
  `table_name` varchar(255) NOT NULL,
  `table_row_id` int(10) unsigned DEFAULT NULL,
  `previous_values` json DEFAULT NULL,
  `current_values` json DEFAULT NULL,
  `changed_values` json DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6805 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `card_activities`
--

DROP TABLE IF EXISTS `card_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_activities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_id` int(10) unsigned NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `field_name` varchar(100) DEFAULT NULL,
  `from_value` text,
  `to_value` text,
  `from_date` datetime DEFAULT NULL,
  `to_date` datetime DEFAULT NULL,
  `from_start_date` datetime DEFAULT NULL,
  `from_end_date` datetime DEFAULT NULL,
  `to_start_date` datetime DEFAULT NULL,
  `to_end_date` datetime DEFAULT NULL,
  `from_label` text,
  `to_label` text,
  `target_pic_id` int(10) unsigned DEFAULT NULL,
  `target_member_id` int(10) unsigned DEFAULT NULL,
  `attachment_id` int(10) unsigned DEFAULT NULL,
  `from_card_status_id` int(10) unsigned DEFAULT NULL,
  `to_card_status_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  KEY `target_pic_id` (`target_pic_id`),
  KEY `target_member_id` (`target_member_id`),
  KEY `card_activities_attachment_id_foreign_idx` (`attachment_id`),
  KEY `card_activities_from_card_status_id_foreign_idx` (`from_card_status_id`),
  KEY `card_activities_to_card_status_id_foreign_idx` (`to_card_status_id`),
  CONSTRAINT `card_activities_attachment_id_foreign_idx` FOREIGN KEY (`attachment_id`) REFERENCES `card_attachments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_activities_from_card_status_id_foreign_idx` FOREIGN KEY (`from_card_status_id`) REFERENCES `card_statuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_activities_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `card_activities_ibfk_2` FOREIGN KEY (`target_pic_id`) REFERENCES `contacts_pic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_activities_ibfk_3` FOREIGN KEY (`target_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_activities_to_card_status_id_foreign_idx` FOREIGN KEY (`to_card_status_id`) REFERENCES `card_statuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3786 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_activities_uuid_before_insert
		BEFORE INSERT ON card_activities FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_attachments`
--

DROP TABLE IF EXISTS `card_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `file_size` int(10) unsigned DEFAULT NULL,
  `path` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `document_hash` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `card_attachments_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=609 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_attachments_uuid_before_insert
		BEFORE INSERT ON card_attachments FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_checklist`
--

DROP TABLE IF EXISTS `card_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_checklist` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_id` int(10) unsigned NOT NULL,
  `sequence` tinyint(4) NOT NULL DEFAULT '1',
  `title` varchar(255) DEFAULT NULL,
  `checked` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  CONSTRAINT `card_checklist_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=264 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_checklist_uuid_before_insert
		BEFORE INSERT ON card_checklist FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_comment_attachments`
--

DROP TABLE IF EXISTS `card_comment_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_comment_attachments` (
  `comment_id` int(10) unsigned NOT NULL,
  `attachment_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`comment_id`,`attachment_id`),
  KEY `attachment_id` (`attachment_id`),
  CONSTRAINT `card_comment_attachments_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `card_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `card_comment_attachments_ibfk_2` FOREIGN KEY (`attachment_id`) REFERENCES `card_attachments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `card_comments`
--

DROP TABLE IF EXISTS `card_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_comments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_id` int(10) unsigned NOT NULL,
  `pic_id` int(10) unsigned DEFAULT NULL,
  `member_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `mention_id` int(10) unsigned DEFAULT NULL,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `message` text,
  `message_content` json DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  KEY `user_id` (`user_id`),
  KEY `card_comments_pic_id_foreign_idx` (`pic_id`),
  KEY `card_comments_member_id_foreign_idx` (`member_id`),
  KEY `card_comments_mention_id_foreign_idx` (`mention_id`),
  CONSTRAINT `card_comments_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_comments_member_id_foreign_idx` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `card_comments_mention_id_foreign_idx` FOREIGN KEY (`mention_id`) REFERENCES `users` (`id`),
  CONSTRAINT `card_comments_pic_id_foreign_idx` FOREIGN KEY (`pic_id`) REFERENCES `contacts_pic` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=416 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_comments_uuid_before_insert
		BEFORE INSERT ON card_comments FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_members`
--

DROP TABLE IF EXISTS `card_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_members` (
  `card_id` int(10) unsigned NOT NULL,
  `member_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  KEY `member_id` (`member_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `card_members_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_members_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_members_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_members_uuid_before_insert
		BEFORE INSERT ON card_members FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_pics`
--

DROP TABLE IF EXISTS `card_pics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_pics` (
  `card_id` int(10) unsigned NOT NULL,
  `contact_id` int(10) unsigned NOT NULL,
  `pic_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  KEY `contact_id` (`contact_id`),
  KEY `pic_id` (`pic_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `card_pics_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_pics_ibfk_2` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_pics_ibfk_3` FOREIGN KEY (`pic_id`) REFERENCES `contacts_pic` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `card_pics_ibfk_4` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_pics_uuid_before_insert
		BEFORE INSERT ON card_pics FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `card_statuses`
--

DROP TABLE IF EXISTS `card_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_statuses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `team_id` int(10) unsigned DEFAULT NULL,
  `parent_status` tinyint(4) NOT NULL,
  `label` varchar(100) NOT NULL,
  `percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `sequence` int(10) DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `color` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `card_statuses_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER card_statuses_uuid_before_insert
		BEFORE INSERT ON card_statuses FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `team_id` int(10) unsigned DEFAULT NULL,
  `type` enum('Task','Document') NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `value` decimal(10,2) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `due_reminder` int(11) DEFAULT NULL,
  `last_remind_on` datetime DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `planned_effort` int(11) DEFAULT '0',
  `priority` tinyint(1) DEFAULT '2',
  `projected_cost` decimal(10,2) DEFAULT NULL,
  `actual_cost` decimal(10,2) DEFAULT NULL,
  `actual_end` datetime DEFAULT NULL,
  `actual_start` datetime DEFAULT NULL,
  `file_type` varchar(25) DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `sub_status_id` int(10) unsigned DEFAULT NULL,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `job_id` int(10) unsigned NOT NULL,
  `due_date_updated_at` datetime DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `sequence` int(10) unsigned NOT NULL DEFAULT '1',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `template_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `job_id` (`job_id`),
  KEY `cards_sub_status_id_foreign_idx` (`sub_status_id`),
  KEY `cards_team_id_foreign_idx` (`team_id`),
  CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cards_sub_status_id_foreign_idx` FOREIGN KEY (`sub_status_id`) REFERENCES `card_statuses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `cards_team_id_foreign_idx` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=880 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER cards_uuid_before_insert
		BEFORE INSERT ON cards FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `collection_message_logs`
--

DROP TABLE IF EXISTS `collection_message_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_message_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `collection_id` int(10) unsigned NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `email_address` varchar(500) DEFAULT NULL,
  `phone` varchar(500) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  `status` int(1) DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `collection_id` (`collection_id`),
  CONSTRAINT `collection_message_logs_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=490 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER collection_message_logs_uuid_before_insert
		BEFORE INSERT ON collection_message_logs FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `collection_payment_links`
--

DROP TABLE IF EXISTS `collection_payment_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_payment_links` (
  `collection_id` int(10) unsigned NOT NULL,
  `short_url_id` int(10) unsigned NOT NULL,
  KEY `collection_id` (`collection_id`),
  KEY `short_url_id` (`short_url_id`),
  CONSTRAINT `collection_payment_links_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `receivable_reminders` (`id`),
  CONSTRAINT `collection_payment_links_ibfk_2` FOREIGN KEY (`short_url_id`) REFERENCES `short_urls` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `collection_tags`
--

DROP TABLE IF EXISTS `collection_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collection_tags` (
  `collection_id` int(10) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`collection_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `collection_tags_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `collectors`
--

DROP TABLE IF EXISTS `collectors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collectors` (
  `id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `member_id` int(10) unsigned DEFAULT NULL,
  `team_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `member_id` (`member_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `collectors_ibfk_1` FOREIGN KEY (`id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collectors_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collectors_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `collectors_ibfk_4` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER collectors_uuid_before_insert
		BEFORE INSERT ON collectors FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `collectors_members`
--

DROP TABLE IF EXISTS `collectors_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collectors_members` (
  `collector_id` int(10) unsigned NOT NULL,
  `member_id` int(10) unsigned NOT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `collector_id` (`collector_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `collectors_members_ibfk_1` FOREIGN KEY (`collector_id`) REFERENCES `collectors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `collectors_members_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER collectors_members_uuid_before_insert
		BEFORE INSERT ON collectors_members FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` varchar(150) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `invitation_code` text,
  `invitation_validity` datetime DEFAULT NULL,
  `email_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `sms_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `whatsapp_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `phone_call_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `idle_timing` int(10) unsigned NOT NULL DEFAULT '10',
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `settings` json DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=274 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER companies_uuid_before_insert
		BEFORE INSERT ON companies FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `company_holidays`
--

DROP TABLE IF EXISTS `company_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_holidays` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `type` tinyint(1) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `public_holiday_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `company_id` (`company_id`),
  KEY `public_holiday_id` (`public_holiday_id`),
  CONSTRAINT `company_holidays_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `company_holidays_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `company_holidays_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_holidays_ibfk_4` FOREIGN KEY (`public_holiday_id`) REFERENCES `public_holidays` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER holidays_uuid_before_insert
		BEFORE INSERT ON `company_holidays` FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `company_member_reference_images`
--

DROP TABLE IF EXISTS `company_member_reference_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_member_reference_images` (
  `company_member_id` int(10) unsigned NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `action_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `s3_bucket` varchar(255) DEFAULT NULL,
  `s3_key` varchar(255) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`company_member_id`),
  UNIQUE KEY `company_member_id` (`company_member_id`),
  KEY `action_by` (`action_by`),
  CONSTRAINT `company_member_reference_images_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_member_reference_images_ibfk_2` FOREIGN KEY (`action_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_members`
--

DROP TABLE IF EXISTS `company_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_members` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `report_to` int(10) unsigned DEFAULT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '3',
  `position` varchar(100) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `invitation_code` text,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `setting` json DEFAULT NULL,
  `employee_type` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `companies_users_report_to_foreign_idx` (`report_to`),
  KEY `employee_type` (`employee_type`),
  CONSTRAINT `companies_users_report_to_foreign_idx` FOREIGN KEY (`report_to`) REFERENCES `company_members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `company_members_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_members_ibfk_3` FOREIGN KEY (`employee_type`) REFERENCES `employee_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=530 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER company_members_uuid_before_insert
		BEFORE INSERT ON company_members FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profiles` (
  `company_id` int(10) unsigned NOT NULL,
  `profile` json DEFAULT NULL,
  `default_timezone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  CONSTRAINT `company_profiles_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_quota_usage`
--

DROP TABLE IF EXISTS `company_quota_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_quota_usage` (
  `company_id` int(10) unsigned NOT NULL,
  `whatsapp_quota_usage` int(10) DEFAULT '0',
  `email_quota_usage` int(10) DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT NULL,
  `last_remind_exceeded` datetime DEFAULT NULL,
  PRIMARY KEY (`company_id`),
  CONSTRAINT `company_quota_usage_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_roles`
--

DROP TABLE IF EXISTS `company_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_roles` (
  `company_id` int(10) unsigned NOT NULL,
  `grants` json DEFAULT NULL,
  KEY `company_id` (`company_id`),
  CONSTRAINT `company_roles_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company_services_histories`
--

DROP TABLE IF EXISTS `company_services_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_services_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `type` enum('SMS','PhoneCall','Email','WhatsApp') NOT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `receivable_id` int(10) unsigned DEFAULT NULL,
  `count` int(10) unsigned NOT NULL DEFAULT '1',
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  `data` text,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `company_services_histories_receivable_id_foreign_idx` (`receivable_id`),
  CONSTRAINT `company_services_histories_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_services_histories_receivable_id_foreign_idx` FOREIGN KEY (`receivable_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3090 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER company_services_histories_uuid_before_insert
		BEFORE INSERT ON company_services_histories FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `company_subscriptions`
--

DROP TABLE IF EXISTS `company_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_subscriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `package_id` int(10) unsigned NOT NULL,
  `subscription_id` varchar(255) DEFAULT NULL,
  `product_id` varchar(255) DEFAULT NULL,
  `item_id` varchar(255) DEFAULT NULL,
  `price_id` varchar(255) DEFAULT NULL,
  `package_title` varchar(100) NOT NULL,
  `quantity` int(10) DEFAULT '1',
  `package_description` text,
  `sms_quota` int(10) unsigned NOT NULL,
  `phone_call_quota` int(10) unsigned NOT NULL,
  `email_quota` int(10) unsigned NOT NULL,
  `whatsApp_quota` int(10) unsigned NOT NULL,
  `signature_quota` int(10) unsigned DEFAULT '0',
  `price` decimal(10,2) NOT NULL,
  `interval` enum('day','week','month','year') NOT NULL,
  `interval_count` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `cancel_date` datetime DEFAULT NULL,
  `cancel_at_period_end` tinyint(1) DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `company_subscriptions_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_subscriptions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER company_subscriptions_uuid_before_insert
		BEFORE INSERT ON company_subscriptions FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `company_working_hours`
--

DROP TABLE IF EXISTS `company_working_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_working_hours` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `employee_type_id` int(10) unsigned DEFAULT NULL,
  `day` tinyint(4) NOT NULL,
  `open` tinyint(1) NOT NULL,
  `start_hour` time DEFAULT NULL,
  `end_hour` time DEFAULT NULL,
  `timezone` varchar(255) DEFAULT 'Asia/Kuala_Lumpur',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `employee_type_id` (`employee_type_id`),
  CONSTRAINT `company_working_hours_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `company_working_hours_ibfk_2` FOREIGN KEY (`employee_type_id`) REFERENCES `employee_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=281 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER company_working_hours_uuid_before_insert
		BEFORE INSERT ON company_working_hours FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contact_group_members`
--

DROP TABLE IF EXISTS `contact_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_group_members` (
  `contact_id` int(10) unsigned NOT NULL,
  `contact_group_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`contact_id`,`contact_group_id`),
  UNIQUE KEY `contact_id` (`contact_id`),
  KEY `contact_group_id` (`contact_group_id`),
  CONSTRAINT `contact_group_members_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contact_group_members_ibfk_2` FOREIGN KEY (`contact_group_id`) REFERENCES `contact_groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contact_groups`
--

DROP TABLE IF EXISTS `contact_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `name` varchar(150) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` tinyint(3) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `contact_groups_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER contact_groups_uuid_before_insert
	BEFORE INSERT ON contact_groups FOR EACH ROW 
		BEGIN 
				set NEW.id_bin = unhex(replace(uuid(),'-',''));
		END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contact_notes`
--

DROP TABLE IF EXISTS `contact_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_notes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `contact_id` int(10) unsigned NOT NULL,
  `content` longtext,
  `user_id` int(10) unsigned DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `contact_id` (`contact_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `contact_notes_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contact_notes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER contact_notes_uuid_before_insert
		BEFORE INSERT ON contact_notes FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contact_tags`
--

DROP TABLE IF EXISTS `contact_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_tags` (
  `contact_id` int(10) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`contact_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `contact_tags_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contact_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `deal_value` decimal(10,2) DEFAULT NULL,
  `deal_creator` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `type` tinyint(3) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `deal_creator` (`deal_creator`),
  CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`deal_creator`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER contacts_uuid_before_insert
		BEFORE INSERT ON contacts FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `contacts_pic`
--

DROP TABLE IF EXISTS `contacts_pic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts_pic` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `contact_no` varchar(30) DEFAULT NULL,
  `national_format` varchar(40) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `contact_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `contact_id` (`contact_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `contacts_pic_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contacts_pic_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=295 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER contacts_pic_uuid_before_insert
		BEFORE INSERT ON contacts_pic FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `document_history`
--

DROP TABLE IF EXISTS `document_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_history` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `card_attachment_id` int(10) unsigned DEFAULT NULL,
  `action_id` tinyint(3) unsigned DEFAULT NULL,
  `document_id` varchar(100) DEFAULT NULL,
  `document_data` json DEFAULT NULL,
  `signing_workflow_document_id` int(10) unsigned NOT NULL,
  `business_process_id` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(10) unsigned NOT NULL,
  `signer_id` varchar(150) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_attachment_id` (`card_attachment_id`),
  KEY `created_by` (`created_by`),
  KEY `signing_workflow_document_id` (`signing_workflow_document_id`),
  CONSTRAINT `document_history_ibfk_1` FOREIGN KEY (`card_attachment_id`) REFERENCES `card_attachments` (`id`),
  CONSTRAINT `document_history_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `document_history_ibfk_3` FOREIGN KEY (`signing_workflow_document_id`) REFERENCES `signing_workflow_documents` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER document_history_uuid_before_insert
		BEFORE INSERT ON document_history FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `employee_types`
--

DROP TABLE IF EXISTS `employee_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_types` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `has_overtime` tinyint(1) NOT NULL DEFAULT '0',
  `archived` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `employee_types_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER employee_types_uuid_before_insert
		BEFORE INSERT ON employee_types FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `job_members`
--

DROP TABLE IF EXISTS `job_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_members` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` int(10) unsigned NOT NULL,
  `job_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `job_id` (`job_id`),
  KEY `job_members_member_id_foreign_idx` (`member_id`),
  CONSTRAINT `job_members_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `job_members_member_id_foreign_idx` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER job_members_uuid_before_insert
		BEFORE INSERT ON job_members FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `job_owners`
--

DROP TABLE IF EXISTS `job_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_owners` (
  `job_id` int(10) unsigned NOT NULL,
  `company_member_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`job_id`,`company_member_id`),
  KEY `company_member_id` (`company_member_id`),
  CONSTRAINT `job_owners_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `job_owners_ibfk_2` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned DEFAULT NULL,
  `contact_id` int(10) unsigned DEFAULT NULL,
  `team_id` int(10) unsigned DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `category` tinyint(1) DEFAULT '0',
  `name` varchar(200) NOT NULL,
  `description` text,
  `comment` text,
  `color` varchar(100) DEFAULT NULL,
  `associate_by` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `slug` varchar(50) DEFAULT NULL,
  `archived` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `jobs_contact_id_foreign_idx` (`contact_id`),
  KEY `jobs_team_id_foreign_idx` (`team_id`),
  CONSTRAINT `jobs_contact_id_foreign_idx` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `jobs_team_id_foreign_idx` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=314 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER jobs_uuid_before_insert
		BEFORE INSERT ON jobs FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `jobs_teams`
--

DROP TABLE IF EXISTS `jobs_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs_teams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` int(10) unsigned DEFAULT NULL,
  `team_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `job_id` (`job_id`),
  KEY `jobs_teams_ibfk_2` (`team_id`),
  CONSTRAINT `jobs_teams_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  CONSTRAINT `jobs_teams_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=436 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER jobs_teams_uuid_before_insert
		BEFORE INSERT ON jobs_teams FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `knex_migrations`
--

DROP TABLE IF EXISTS `knex_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=360 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `knex_migrations_lock`
--

DROP TABLE IF EXISTS `knex_migrations_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knex_migrations_lock` (
  `index` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `is_locked` int(11) DEFAULT NULL,
  PRIMARY KEY (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `radius` decimal(10,2) DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `lat` double DEFAULT NULL,
  `archived` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `locations_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER locations_uuid_before_insert
		BEFORE INSERT ON locations FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `mail_logs`
--

DROP TABLE IF EXISTS `mail_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mail_logs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `request_data` text,
  `error` text,
  `response` text,
  `status` varchar(30) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(30) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `description` text,
  `data` text,
  `user_id` int(10) unsigned DEFAULT NULL,
  `member_id` int(10) unsigned DEFAULT NULL,
  `pic_id` int(10) unsigned DEFAULT NULL,
  `contact_id` int(10) unsigned DEFAULT NULL,
  `memberType` tinyint(1) DEFAULT NULL,
  `card_id` int(10) unsigned DEFAULT NULL,
  `comment_id` int(10) unsigned DEFAULT NULL,
  `job_id` int(10) unsigned DEFAULT NULL,
  `team_id` int(10) unsigned DEFAULT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `receivable_id` int(10) unsigned DEFAULT NULL,
  `receivable_period_id` int(10) unsigned DEFAULT NULL,
  `card_status` tinyint(1) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `user_id` (`user_id`),
  KEY `member_id` (`member_id`),
  KEY `pic_id` (`pic_id`),
  KEY `contact_id` (`contact_id`),
  KEY `card_id` (`card_id`),
  KEY `comment_id` (`comment_id`),
  KEY `job_id` (`job_id`),
  KEY `team_id` (`team_id`),
  KEY `company_id` (`company_id`),
  KEY `notifications_receivable_id_foreign_idx` (`receivable_id`),
  KEY `notifications_receivable_period_id_foreign_idx` (`receivable_period_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`pic_id`) REFERENCES `contacts_pic` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_5` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_6` FOREIGN KEY (`comment_id`) REFERENCES `card_comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_7` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_8` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_ibfk_9` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_receivable_id_foreign_idx` FOREIGN KEY (`receivable_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_receivable_period_id_foreign_idx` FOREIGN KEY (`receivable_period_id`) REFERENCES `receivable_periods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10542 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER notifications_uuid_before_insert
		BEFORE INSERT ON notifications FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `package_prices`
--

DROP TABLE IF EXISTS `package_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package_prices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `package_id` int(10) unsigned NOT NULL,
  `stripe_price_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `currency` varchar(5) DEFAULT 'MYR',
  `price` decimal(10,2) NOT NULL,
  `interval` enum('day','week','month','year') NOT NULL DEFAULT 'month',
  `interval_count` tinyint(1) unsigned NOT NULL DEFAULT '1',
  `coupon_id` varchar(255) DEFAULT NULL,
  `coupon_duration` varchar(20) DEFAULT NULL,
  `coupon_currency` varchar(5) DEFAULT NULL,
  `coupon_amount_off` int(11) DEFAULT NULL,
  `coupon_percent_off` decimal(10,2) DEFAULT NULL,
  `coupon_duration_in_months` int(11) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `package_prices_ibfk_1` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER package_prices_uuid_before_insert
		BEFORE INSERT ON package_prices FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `packages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `product_id` varchar(255) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `type` tinyint(2) DEFAULT '0',
  `description` text,
  `storage` decimal(5,2) DEFAULT '0.00',
  `sms_quota` int(10) unsigned NOT NULL,
  `phone_call_quota` int(10) unsigned NOT NULL,
  `email_quota` int(10) unsigned NOT NULL,
  `whatsapp_quota` int(10) unsigned NOT NULL,
  `signature_quota` int(10) unsigned DEFAULT '0',
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `slug` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER packages_uuid_before_insert
		BEFORE INSERT ON packages FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `payment_orders`
--

DROP TABLE IF EXISTS `payment_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_orders` (
  `id_text` varchar(36) NOT NULL,
  `status` tinyint(3) DEFAULT '0',
  `transaction_id` varchar(36) DEFAULT NULL,
  `collection_id` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id_text`),
  KEY `collection_id` (`collection_id`),
  CONSTRAINT `payment_orders_ibfk_1` FOREIGN KEY (`collection_id`) REFERENCES `receivable_reminders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `public_holidays`
--

DROP TABLE IF EXISTS `public_holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_holidays` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `date` datetime DEFAULT NULL,
  `year` int(4) DEFAULT NULL,
  `country_code` varchar(4) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER public_holidays_uuid_before_insert
		BEFORE INSERT ON public_holidays FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `receivable_payments`
--

DROP TABLE IF EXISTS `receivable_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receivable_payments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `receivable_id` int(10) unsigned NOT NULL,
  `receivable_period_id` int(10) unsigned NOT NULL,
  `contact_id` int(10) unsigned DEFAULT NULL,
  `pic_id` int(10) unsigned DEFAULT NULL,
  `member_id` int(10) unsigned DEFAULT NULL,
  `payment_proof` varchar(255) NOT NULL,
  `payment_proof_file_name` varchar(255) NOT NULL,
  `payment_proof_file_size` int(10) unsigned DEFAULT NULL,
  `receipt` varchar(255) DEFAULT NULL,
  `receipt_file_name` varchar(255) DEFAULT NULL,
  `receipt_file_size` int(10) unsigned DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `transaction_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `receivable_id` (`receivable_id`),
  KEY `receivable_period_id` (`receivable_period_id`),
  KEY `contact_id` (`contact_id`),
  KEY `pic_id` (`pic_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `receivable_payments_ibfk_1` FOREIGN KEY (`receivable_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `receivable_payments_ibfk_2` FOREIGN KEY (`receivable_period_id`) REFERENCES `receivable_periods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `receivable_payments_ibfk_3` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `receivable_payments_ibfk_4` FOREIGN KEY (`pic_id`) REFERENCES `contacts_pic` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `receivable_payments_ibfk_5` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=260 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER receivable_payments_uuid_before_insert
		BEFORE INSERT ON receivable_payments FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `receivable_periods`
--

DROP TABLE IF EXISTS `receivable_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receivable_periods` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `receivable_id` int(10) unsigned NOT NULL,
  `period` smallint(5) unsigned NOT NULL,
  `month` date NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `due_date` datetime NOT NULL,
  `last_remind_on` datetime DEFAULT NULL,
  `payment_accept_at` datetime DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `webhook_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `receivable_id` (`receivable_id`),
  CONSTRAINT `receivable_periods_ibfk_1` FOREIGN KEY (`receivable_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2006 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER receivable_periods_uuid_before_insert
		BEFORE INSERT ON receivable_periods FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `receivable_reminders`
--

DROP TABLE IF EXISTS `receivable_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receivable_reminders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ref_no` varchar(80) DEFAULT NULL,
  `contact_id` int(10) unsigned NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `payable_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `periods` smallint(5) unsigned DEFAULT NULL,
  `remind_type` tinyint(1) NOT NULL,
  `due_date` datetime NOT NULL,
  `invoice` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `invoice_file_size` int(10) unsigned DEFAULT NULL,
  `start_month` date DEFAULT NULL,
  `end_month` date DEFAULT NULL,
  `remind_interval` enum('Day','Week','Month','Year') DEFAULT NULL,
  `remind_on_date` tinyint(1) DEFAULT NULL,
  `remind_on_month` tinyint(1) DEFAULT NULL,
  `remind_end_on` date DEFAULT NULL,
  `last_remind_on` datetime DEFAULT NULL,
  `sms_notify` tinyint(1) NOT NULL DEFAULT '1',
  `whatsapp_notify` tinyint(1) NOT NULL DEFAULT '1',
  `voice_notify` tinyint(1) NOT NULL DEFAULT '1',
  `email_notify` tinyint(1) NOT NULL DEFAULT '1',
  `notify_pics` text,
  `status` tinyint(1) NOT NULL,
  `is_draft` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `archive` tinyint(1) NOT NULL DEFAULT '0',
  `archived_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `payment_type` int(11) DEFAULT NULL,
  `sp_recurring_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `receivable_reminders_contact_id_foreign_idx` (`contact_id`),
  CONSTRAINT `receivable_reminders_contact_id_foreign_idx` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=838 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER receivable_reminders_uuid_before_insert
		BEFORE INSERT ON receivable_reminders FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `remind_on_days`
--

DROP TABLE IF EXISTS `remind_on_days`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `remind_on_days` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `receivable_id` int(10) unsigned NOT NULL,
  `day` enum('1','2','3','4','5','6','7') NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `receivable_id` (`receivable_id`),
  CONSTRAINT `remind_on_days_ibfk_1` FOREIGN KEY (`receivable_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER remind_on_days_uuid_before_insert
		BEFORE INSERT ON remind_on_days FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reminder_read`
--

DROP TABLE IF EXISTS `reminder_read`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminder_read` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `reminder_id` int(10) unsigned NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `user_id` (`user_id`),
  KEY `reminder_id` (`reminder_id`),
  CONSTRAINT `reminder_read_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reminder_read_ibfk_2` FOREIGN KEY (`reminder_id`) REFERENCES `receivable_reminders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1147 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER reminder_read_uuid_before_insert
		BEFORE INSERT ON reminder_read FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `resource_permissions`
--

DROP TABLE IF EXISTS `resource_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_permissions` (
  `resource_id` varchar(100) NOT NULL,
  `company_member_ids` json DEFAULT NULL,
  `team_ids` json DEFAULT NULL,
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roles_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `short_urls`
--

DROP TABLE IF EXISTS `short_urls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `short_urls` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `url` varchar(500) DEFAULT NULL,
  `short_id` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `short_id` (`short_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5129 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `signing_workflow_documents`
--

DROP TABLE IF EXISTS `signing_workflow_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signing_workflow_documents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_attachment_id` int(10) unsigned NOT NULL,
  `signing_workflow_id` int(10) unsigned NOT NULL,
  `latest_path` varchar(255) DEFAULT NULL,
  `latest_document_data` json DEFAULT NULL,
  `document_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `card_attachment_id` (`card_attachment_id`),
  KEY `signing_workflow_id` (`signing_workflow_id`),
  CONSTRAINT `signing_workflow_documents_ibfk_1` FOREIGN KEY (`card_attachment_id`) REFERENCES `card_attachments` (`id`),
  CONSTRAINT `signing_workflow_documents_ibfk_2` FOREIGN KEY (`signing_workflow_id`) REFERENCES `signing_workflows` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=229 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `signing_workflows`
--

DROP TABLE IF EXISTS `signing_workflows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signing_workflows` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `card_id` int(10) unsigned NOT NULL,
  `job_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `card_id` (`card_id`),
  KEY `created_by` (`created_by`),
  KEY `company_id` (`company_id`),
  KEY `job_id` (`job_id`),
  CONSTRAINT `signing_workflows_ibfk_1` FOREIGN KEY (`card_id`) REFERENCES `cards` (`id`),
  CONSTRAINT `signing_workflows_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `signing_workflows_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `signing_workflows_ibfk_4` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER signing_workflows_uuid_before_insert
	BEFORE INSERT ON signing_workflows FOR EACH ROW 
		BEGIN 
				set NEW.id_bin = unhex(replace(uuid(),'-',''));
		END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sp_company_credentials`
--

DROP TABLE IF EXISTS `sp_company_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sp_company_credentials` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned DEFAULT NULL,
  `credentials` blob,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_id` (`company_id`),
  CONSTRAINT `sp_company_credentials_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_promo_codes`
--

DROP TABLE IF EXISTS `subscription_promo_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_promo_codes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` int(10) unsigned NOT NULL,
  `promo_code_id` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `percent_off` int(10) DEFAULT NULL,
  `amount_off` int(10) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `subscription_promo_codes_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `company_subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_quantity_assignments`
--

DROP TABLE IF EXISTS `subscription_quantity_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_quantity_assignments` (
  `subscription_id` int(10) unsigned NOT NULL,
  `company_member_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`subscription_id`,`company_member_id`),
  KEY `company_member_id` (`company_member_id`),
  CONSTRAINT `subscription_quantity_assignments_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `company_subscriptions` (`id`),
  CONSTRAINT `subscription_quantity_assignments_ibfk_2` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tag_groups`
--

DROP TABLE IF EXISTS `tag_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `name` varchar(150) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `created_by` (`created_by`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `tag_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tag_groups_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER tag_groups_uuid_before_insert
    BEFORE INSERT ON tag_groups FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `name` varchar(150) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `group_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `group_id` (`group_id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `tag_groups` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tags_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER tags_uuid_before_insert
    BEFORE INSERT ON tags FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `task_tags`
--

DROP TABLE IF EXISTS `task_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tags` (
  `task_id` int(10) unsigned NOT NULL,
  `tag_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`task_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `task_tags_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `task_timer_entries`
--

DROP TABLE IF EXISTS `task_timer_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_timer_entries` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `task_id` int(10) unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_total` int(11) GENERATED ALWAYS AS (timestampdiff(SECOND,`start_date`,`end_date`)) VIRTUAL,
  PRIMARY KEY (`id`),
  KEY `company_member_id` (`company_member_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `task_timer_entries_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_timer_entries_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `team_id` int(10) unsigned NOT NULL,
  `member_id` int(10) unsigned NOT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `team_id` (`team_id`),
  KEY `team_members_member_id_foreign_idx` (`member_id`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `team_members_member_id_foreign_idx` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER team_members_uuid_before_insert
		BEFORE INSERT ON team_members FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `teams_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER teams_uuid_before_insert
		BEFORE INSERT ON teams FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `template_attachments`
--

DROP TABLE IF EXISTS `template_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `filesize` int(10) unsigned DEFAULT '0',
  `bucket` varchar(255) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `template_attachments_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `template_options`
--

DROP TABLE IF EXISTS `template_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_options` (
  `template_id` int(10) unsigned NOT NULL,
  `copy_subtasks` tinyint(1) DEFAULT '0',
  `copy_attachments` tinyint(1) DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT NULL,
  `cron_string` text,
  `next_create` datetime DEFAULT NULL,
  `task_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`template_id`),
  CONSTRAINT `template_options_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `template_tasks`
--

DROP TABLE IF EXISTS `template_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `template_tasks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `template_id` int(10) unsigned DEFAULT NULL,
  `parent_id` int(10) unsigned DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sequence` int(5) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  CONSTRAINT `template_tasks_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `name` varchar(255) NOT NULL,
  `type` tinyint(1) DEFAULT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_id` (`company_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `templates_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `templates_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER templates_uuid_before_insert
    BEFORE INSERT ON templates FOR EACH ROW 
      BEGIN 
          set NEW.id_bin = unhex(replace(uuid(),'-',''));
      END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `timesheet_activities`
--

DROP TABLE IF EXISTS `timesheet_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timesheet_activities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` int(10) unsigned DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `timesheet_activities_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `cards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=130 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER timesheet_activities_uuid_before_insert
		BEFORE INSERT ON timesheet_activities FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `timesheets`
--

DROP TABLE IF EXISTS `timesheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `timesheets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_member_id` int(10) unsigned NOT NULL,
  `activity_id` int(10) unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `submitted_date` datetime DEFAULT NULL,
  `comments` varchar(255) DEFAULT NULL,
  `location_id` int(10) unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_total` int(11) GENERATED ALWAYS AS (timestampdiff(SECOND,`start_date`,`end_date`)) VIRTUAL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `company_member_id` (`company_member_id`),
  KEY `activity_id` (`activity_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `timesheets_ibfk_1` FOREIGN KEY (`company_member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheets_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `timesheet_activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `timesheets_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER timesheets_uuid_before_insert
		BEFORE INSERT ON timesheets FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `user_overtimes`
--

DROP TABLE IF EXISTS `user_overtimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_overtimes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `member_id` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `user_id` (`user_id`),
  KEY `member_id` (`member_id`),
  CONSTRAINT `user_overtimes_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_overtimes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_overtimes_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `company_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_settings`
--

DROP TABLE IF EXISTS `user_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_settings` (
  `user_id` int(10) unsigned NOT NULL,
  `default_company_id` int(10) unsigned DEFAULT NULL,
  `default_timezone` varchar(255) DEFAULT NULL,
  `expo_push_tokens` json DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `default_company_id` (`default_company_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_settings_ibfk_2` FOREIGN KEY (`default_company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `contact_no` varchar(25) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `refresh_token` text,
  `reset_token_validity` datetime DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verification_code` varchar(255) DEFAULT NULL,
  `email_auth` tinyint(1) NOT NULL DEFAULT '0',
  `registered` tinyint(1) NOT NULL DEFAULT '0',
  `view_notification_at` datetime DEFAULT NULL,
  `reset_token` text,
  `facebook_id` varchar(200) DEFAULT NULL,
  `google_id` varchar(200) DEFAULT NULL,
  `linkedin_id` varchar(200) DEFAULT NULL,
  `customer_id` varchar(255) DEFAULT NULL,
  `payment_method_id` varchar(255) DEFAULT NULL,
  `last_active_at` datetime DEFAULT NULL,
  `created_by` int(10) unsigned DEFAULT NULL,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  `signup_data` json DEFAULT NULL,
  `auth0_id` varchar(100) DEFAULT NULL,
  `tooltips_status` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_bin` (`id_bin`)
) ENGINE=InnoDB AUTO_INCREMENT=313 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER users_uuid_before_insert
		BEFORE INSERT ON users FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users_notifications`
--

DROP TABLE IF EXISTS `users_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_notifications` (
  `notification_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `user_type` varchar(30) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `id_bin` binary(16) DEFAULT NULL,
  `id_text` varchar(36) GENERATED ALWAYS AS (lower(insert(insert(insert(insert(hex(`id_bin`),9,0,'-'),14,0,'-'),19,0,'-'),24,0,'-'))) VIRTUAL,
  UNIQUE KEY `id_bin` (`id_bin`),
  KEY `notification_id` (`notification_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `users_notifications_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `users_notifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,NO_ENGINE_SUBSTITUTION' */ ;

CREATE TRIGGER users_notifications_uuid_before_insert
		BEFORE INSERT ON users_notifications FOR EACH ROW 
			BEGIN 
					set NEW.id_bin = unhex(replace(uuid(),'-',''));
			END ;

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

-- Dump completed on 2022-05-25 12:21:05
