import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Cancer types table - stores different types of cancer with their characteristics
 */
export const cancerTypes = mysqlTable("cancer_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  description: text("description"),
  averageSurvivalRate: float("average_survival_rate"),
  totalCases: int("total_cases").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CancerType = typeof cancerTypes.$inferSelect;
export type InsertCancerType = typeof cancerTypes.$inferInsert;

/**
 * Patients table - stores patient demographic and diagnosis information
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  patientCode: varchar("patient_code", { length: 50 }).notNull().unique(),
  age: int("age"),
  gender: mysqlEnum("gender", ["Male", "Female", "Other"]),
  ethnicity: varchar("ethnicity", { length: 50 }),
  diagnosisDate: timestamp("diagnosis_date"),
  cancerTypeId: int("cancer_type_id").references(() => cancerTypes.id),
  stage: varchar("stage", { length: 10 }),
  performanceStatus: int("performance_status"), // ECOG score 0-5
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * Treatment records table - stores treatment history for each patient
 */
export const treatmentRecords = mysqlTable("treatment_records", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  treatmentType: varchar("treatment_type", { length: 100 }).notNull(),
  drugName: varchar("drug_name", { length: 200 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  dosage: varchar("dosage", { length: 100 }),
  protocol: text("protocol"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TreatmentRecord = typeof treatmentRecords.$inferSelect;
export type InsertTreatmentRecord = typeof treatmentRecords.$inferInsert;

/**
 * Treatment outcomes table - stores the results and responses to treatments
 */
export const treatmentOutcomes = mysqlTable("treatment_outcomes", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  treatmentId: int("treatment_id").notNull().references(() => treatmentRecords.id),
  outcomeType: mysqlEnum("outcome_type", [
    "Complete Response",
    "Partial Response",
    "Stable Disease",
    "Progressive Disease"
  ]).notNull(),
  responseRate: float("response_rate"),
  sideEffects: text("side_effects"),
  evaluationDate: timestamp("evaluation_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TreatmentOutcome = typeof treatmentOutcomes.$inferSelect;
export type InsertTreatmentOutcome = typeof treatmentOutcomes.$inferInsert;

/**
 * Survival data table - tracks patient survival and follow-up information
 */
export const survivalData = mysqlTable("survival_data", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id).unique(),
  survivalMonths: int("survival_months"),
  status: mysqlEnum("status", ["Alive", "Deceased"]).notNull(),
  lastFollowupDate: timestamp("last_followup_date"),
  causeOfDeath: varchar("cause_of_death", { length: 100 }),
  qualityOfLife: int("quality_of_life"), // Score 1-10
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SurvivalData = typeof survivalData.$inferSelect;
export type InsertSurvivalData = typeof survivalData.$inferInsert;

/**
 * Medical images table - stores metadata for medical imaging studies
 */
export const medicalImages = mysqlTable("medical_images", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  imageType: mysqlEnum("image_type", ["CT", "MRI", "PET", "X-Ray", "Ultrasound"]).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  acquisitionDate: timestamp("acquisition_date"),
  bodyPart: varchar("body_part", { length: 100 }),
  findings: text("findings"),
  aiClassification: varchar("ai_classification", { length: 100 }),
  confidenceScore: float("confidence_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MedicalImage = typeof medicalImages.$inferSelect;
export type InsertMedicalImage = typeof medicalImages.$inferInsert;

/**
 * AI predictions table - stores predictions made by AI models
 */
export const aiPredictions = mysqlTable("ai_predictions", {
  id: int("id").autoincrement().primaryKey(),
  patientId: int("patient_id").notNull().references(() => patients.id),
  modelName: varchar("model_name", { length: 100 }).notNull(),
  predictionType: varchar("prediction_type", { length: 50 }).notNull(),
  predictedValue: float("predicted_value"),
  confidenceScore: float("confidence_score"),
  inputFeatures: text("input_features"), // JSON format
  riskFactors: text("risk_factors"), // JSON format
  predictionDate: timestamp("prediction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = typeof aiPredictions.$inferInsert;

/**
 * Statistics table - stores aggregated statistical data
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  statType: varchar("stat_type", { length: 100 }).notNull(),
  cancerTypeId: int("cancer_type_id").references(() => cancerTypes.id),
  year: int("year"),
  month: int("month"),
  value: float("value").notNull(),
  metadata: text("metadata"), // JSON format for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;
