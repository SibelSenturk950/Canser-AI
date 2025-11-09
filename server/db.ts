import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  cancerTypes,
  patients,
  treatmentRecords,
  treatmentOutcomes,
  survivalData,
  medicalImages,
  aiPredictions,
  statistics,
  InsertCancerType,
  InsertPatient,
  InsertTreatmentRecord,
  InsertTreatmentOutcome,
  InsertSurvivalData,
  InsertMedicalImage,
  InsertAiPrediction,
  InsertStatistic
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Cancer Types
export async function getAllCancerTypes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(cancerTypes).orderBy(desc(cancerTypes.totalCases));
}

export async function getCancerTypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cancerTypes).where(eq(cancerTypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCancerType(data: InsertCancerType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cancerTypes).values(data);
  return result;
}

// Patients
export async function getAllPatients(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    patient: patients,
    cancerType: cancerTypes
  })
  .from(patients)
  .leftJoin(cancerTypes, eq(patients.cancerTypeId, cancerTypes.id))
  .orderBy(desc(patients.createdAt))
  .limit(limit);
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    patient: patients,
    cancerType: cancerTypes
  })
  .from(patients)
  .leftJoin(cancerTypes, eq(patients.cancerTypeId, cancerTypes.id))
  .where(eq(patients.id, id))
  .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPatient(data: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(patients).values(data);
  return result;
}

// Treatment Records
export async function getTreatmentsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(treatmentRecords)
    .where(eq(treatmentRecords.patientId, patientId))
    .orderBy(desc(treatmentRecords.startDate));
}

export async function createTreatmentRecord(data: InsertTreatmentRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(treatmentRecords).values(data);
  return result;
}

// Treatment Outcomes
export async function getOutcomesByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    outcome: treatmentOutcomes,
    treatment: treatmentRecords
  })
  .from(treatmentOutcomes)
  .leftJoin(treatmentRecords, eq(treatmentOutcomes.treatmentId, treatmentRecords.id))
  .where(eq(treatmentOutcomes.patientId, patientId))
  .orderBy(desc(treatmentOutcomes.evaluationDate));
}

export async function createTreatmentOutcome(data: InsertTreatmentOutcome) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(treatmentOutcomes).values(data);
  return result;
}

// Survival Data
export async function getSurvivalDataByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(survivalData)
    .where(eq(survivalData.patientId, patientId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSurvivalData(data: InsertSurvivalData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(survivalData).values(data);
  return result;
}

// Medical Images
export async function getImagesByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(medicalImages)
    .where(eq(medicalImages.patientId, patientId))
    .orderBy(desc(medicalImages.acquisitionDate));
}

export async function createMedicalImage(data: InsertMedicalImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medicalImages).values(data);
  return result;
}

// AI Predictions
export async function getPredictionsByPatientId(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(aiPredictions)
    .where(eq(aiPredictions.patientId, patientId))
    .orderBy(desc(aiPredictions.predictionDate));
}

export async function createAiPrediction(data: InsertAiPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiPredictions).values(data);
  return result;
}

// Statistics
export async function getStatisticsByType(statType: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(statistics)
    .where(eq(statistics.statType, statType))
    .orderBy(desc(statistics.year), desc(statistics.month));
}

export async function createStatistic(data: InsertStatistic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(statistics).values(data);
  return result;
}

// Dashboard Statistics
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    totalPatients: 0,
    totalCancerTypes: 0,
    activeModels: 3,
    averageAccuracy: 91.5
  };

  const [patientCount] = await db.select({ count: sql<number>`count(*)` }).from(patients);
  const [cancerTypeCount] = await db.select({ count: sql<number>`count(*)` }).from(cancerTypes);

  return {
    totalPatients: Number(patientCount?.count || 0),
    totalCancerTypes: Number(cancerTypeCount?.count || 0),
    activeModels: 3,
    averageAccuracy: 91.5
  };
}

// Treatment Outcomes Statistics
export async function getTreatmentOutcomesStats() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    outcomeType: treatmentOutcomes.outcomeType,
    count: sql<number>`count(*)`
  })
  .from(treatmentOutcomes)
  .groupBy(treatmentOutcomes.outcomeType);

  return result;
}
