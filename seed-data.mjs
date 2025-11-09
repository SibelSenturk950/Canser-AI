import { drizzle } from "drizzle-orm/mysql2";
import { cancerTypes, patients, treatmentRecords, treatmentOutcomes, survivalData, statistics } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Cancer Types
  const cancerTypesData = [
    { name: "Breast Cancer", category: "Carcinoma", description: "Most common cancer in women", averageSurvivalRate: 89.7, totalCases: 2300 },
    { name: "Lung Cancer", category: "Carcinoma", description: "Leading cause of cancer death", averageSurvivalRate: 18.6, totalCases: 2100 },
    { name: "Prostate Cancer", category: "Carcinoma", description: "Most common cancer in men", averageSurvivalRate: 98.2, totalCases: 1900 },
    { name: "Colorectal Cancer", category: "Carcinoma", description: "Cancer of colon or rectum", averageSurvivalRate: 64.6, totalCases: 1500 },
    { name: "Melanoma", category: "Skin Cancer", description: "Most serious type of skin cancer", averageSurvivalRate: 92.7, totalCases: 900 },
    { name: "Pancreatic Cancer", category: "Carcinoma", description: "Highly aggressive cancer", averageSurvivalRate: 9.3, totalCases: 600 },
    { name: "Leukemia", category: "Blood Cancer", description: "Cancer of blood-forming tissues", averageSurvivalRate: 63.7, totalCases: 800 },
    { name: "Lymphoma", category: "Blood Cancer", description: "Cancer of lymphatic system", averageSurvivalRate: 73.2, totalCases: 750 },
  ];

  for (const ct of cancerTypesData) {
    await db.insert(cancerTypes).values(ct);
  }
  console.log("✓ Cancer types seeded");

  // Get cancer type IDs
  const allCancerTypes = await db.select().from(cancerTypes);
  
  // Patients
  const patientsData = [];
  const genders = ["Male", "Female"];
  const ethnicities = ["Caucasian", "African American", "Hispanic", "Asian", "Other"];
  const stages = ["I", "II", "III", "IV"];
  
  for (let i = 0; i < 50; i++) {
    const randomCancerType = allCancerTypes[Math.floor(Math.random() * allCancerTypes.length)];
    const age = 35 + Math.floor(Math.random() * 50);
    const diagnosisDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28));
    
    patientsData.push({
      patientCode: `PT${String(i + 1).padStart(5, '0')}`,
      age,
      gender: genders[Math.floor(Math.random() * genders.length)],
      ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
      diagnosisDate,
      cancerTypeId: randomCancerType.id,
      stage: stages[Math.floor(Math.random() * stages.length)],
      performanceStatus: Math.floor(Math.random() * 3),
    });
  }

  for (const p of patientsData) {
    await db.insert(patients).values(p);
  }
  console.log("✓ Patients seeded");

  // Get all patients
  const allPatients = await db.select().from(patients);
  
  // Treatment Records and Outcomes
  const treatmentTypes = ["Chemotherapy", "Radiation", "Immunotherapy", "Targeted Therapy", "Hormone Therapy", "Surgery"];
  const drugNames = ["Cisplatin", "Paclitaxel", "Doxorubicin", "Pembrolizumab", "Trastuzumab", "Tamoxifen"];
  const outcomeTypes = ["Complete Response", "Partial Response", "Stable Disease", "Progressive Disease"];
  
  for (const patient of allPatients) {
    const numTreatments = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numTreatments; i++) {
      const startDate = new Date(patient.diagnosisDate);
      startDate.setMonth(startDate.getMonth() + i * 3);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 2);
      
      const treatmentResult = await db.insert(treatmentRecords).values({
        patientId: patient.id,
        treatmentType: treatmentTypes[Math.floor(Math.random() * treatmentTypes.length)],
        drugName: drugNames[Math.floor(Math.random() * drugNames.length)],
        startDate,
        endDate,
        dosage: `${50 + Math.floor(Math.random() * 150)}mg`,
        protocol: "Standard protocol",
      });
      
      // Get the treatment ID
      const treatmentId = Number(treatmentResult.insertId);
      
      // Treatment Outcome
      const weights = [0.3, 0.35, 0.25, 0.1];
      let random = Math.random();
      let outcomeType = outcomeTypes[0];
      for (let j = 0; j < weights.length; j++) {
        random -= weights[j];
        if (random <= 0) {
          outcomeType = outcomeTypes[j];
          break;
        }
      }
      
      await db.insert(treatmentOutcomes).values({
        patientId: patient.id,
        treatmentId: treatmentId,
        outcomeType,
        responseRate: 20 + Math.random() * 70,
        sideEffects: "Mild fatigue, nausea",
        evaluationDate: endDate,
        notes: "Patient tolerated treatment well",
      });
    }
  }
  console.log("✓ Treatment records and outcomes seeded");

  // Survival Data
  for (const patient of allPatients) {
    const isAlive = Math.random() > 0.3;
    const survivalMonths = isAlive ? 12 + Math.floor(Math.random() * 48) : 6 + Math.floor(Math.random() * 36);
    
    await db.insert(survivalData).values({
      patientId: patient.id,
      survivalMonths,
      status: isAlive ? "Alive" : "Deceased",
      lastFollowupDate: new Date(),
      causeOfDeath: isAlive ? null : "Cancer progression",
      qualityOfLife: isAlive ? 6 + Math.floor(Math.random() * 4) : null,
    });
  }
  console.log("✓ Survival data seeded");

  // Statistics
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 0; i < 12; i++) {
    await db.insert(statistics).values({
      statType: "treatment_success_rate",
      year: 2024,
      month: i + 1,
      value: 75 + Math.random() * 20,
      metadata: JSON.stringify({ monthName: months[i] }),
    });
  }
  console.log("✓ Statistics seeded");

  console.log("✅ Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
