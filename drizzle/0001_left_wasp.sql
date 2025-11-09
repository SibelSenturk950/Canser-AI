CREATE TABLE `ai_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`model_name` varchar(100) NOT NULL,
	`prediction_type` varchar(50) NOT NULL,
	`predicted_value` float,
	`confidence_score` float,
	`input_features` text,
	`risk_factors` text,
	`prediction_date` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cancer_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50),
	`description` text,
	`average_survival_rate` float,
	`total_cases` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cancer_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`image_type` enum('CT','MRI','PET','X-Ray','Ultrasound') NOT NULL,
	`image_url` varchar(500),
	`thumbnail_url` varchar(500),
	`acquisition_date` timestamp,
	`body_part` varchar(100),
	`findings` text,
	`ai_classification` varchar(100),
	`confidence_score` float,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_code` varchar(50) NOT NULL,
	`age` int,
	`gender` enum('Male','Female','Other'),
	`ethnicity` varchar(50),
	`diagnosis_date` timestamp,
	`cancer_type_id` int,
	`stage` varchar(10),
	`performance_status` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`),
	CONSTRAINT `patients_patient_code_unique` UNIQUE(`patient_code`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stat_type` varchar(100) NOT NULL,
	`cancer_type_id` int,
	`year` int,
	`month` int,
	`value` float NOT NULL,
	`metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `survival_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`survival_months` int,
	`status` enum('Alive','Deceased') NOT NULL,
	`last_followup_date` timestamp,
	`cause_of_death` varchar(100),
	`quality_of_life` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `survival_data_id` PRIMARY KEY(`id`),
	CONSTRAINT `survival_data_patient_id_unique` UNIQUE(`patient_id`)
);
--> statement-breakpoint
CREATE TABLE `treatment_outcomes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`treatment_id` int NOT NULL,
	`outcome_type` enum('Complete Response','Partial Response','Stable Disease','Progressive Disease') NOT NULL,
	`response_rate` float,
	`side_effects` text,
	`evaluation_date` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treatment_outcomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `treatment_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patient_id` int NOT NULL,
	`treatment_type` varchar(100) NOT NULL,
	`drug_name` varchar(200),
	`start_date` timestamp,
	`end_date` timestamp,
	`dosage` varchar(100),
	`protocol` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `treatment_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_predictions` ADD CONSTRAINT `ai_predictions_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medical_images` ADD CONSTRAINT `medical_images_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patients` ADD CONSTRAINT `patients_cancer_type_id_cancer_types_id_fk` FOREIGN KEY (`cancer_type_id`) REFERENCES `cancer_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `statistics` ADD CONSTRAINT `statistics_cancer_type_id_cancer_types_id_fk` FOREIGN KEY (`cancer_type_id`) REFERENCES `cancer_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `survival_data` ADD CONSTRAINT `survival_data_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `treatment_outcomes` ADD CONSTRAINT `treatment_outcomes_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `treatment_outcomes` ADD CONSTRAINT `treatment_outcomes_treatment_id_treatment_records_id_fk` FOREIGN KEY (`treatment_id`) REFERENCES `treatment_records`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `treatment_records` ADD CONSTRAINT `treatment_records_patient_id_patients_id_fk` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE no action ON UPDATE no action;