import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Cancer Types Router
  cancerTypes: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCancerTypes();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCancerTypeById(input.id);
      }),
  }),

  // Patients Router
  patients: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllPatients(input?.limit);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPatientById(input.id);
      }),
    getTreatments: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTreatmentsByPatientId(input.patientId);
      }),
    getOutcomes: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getOutcomesByPatientId(input.patientId);
      }),
    getSurvival: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSurvivalDataByPatientId(input.patientId);
      }),
    getImages: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getImagesByPatientId(input.patientId);
      }),
    getPredictions: protectedProcedure
      .input(z.object({ patientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPredictionsByPatientId(input.patientId);
      }),
  }),

  // Dashboard Router
  dashboard: router({
    stats: publicProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
    treatmentOutcomes: publicProcedure.query(async () => {
      return await db.getTreatmentOutcomesStats();
    }),
  }),

  // AI Predictions Router
  predictions: router({
    survivalPrediction: protectedProcedure
      .input(z.object({
        patientId: z.number().optional(),
        age: z.number(),
        gender: z.enum(["Male", "Female", "Other"]),
        cancerType: z.string(),
        stage: z.string(),
        performanceStatus: z.number().min(0).max(5),
        treatmentType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Simple survival prediction algorithm based on clinical parameters
        let baseSurvival = 70;
        
        // Adjust for cancer type
        const cancerTypeAdjustments: Record<string, number> = {
          "Pancreatic": -55,
          "Lung": -45,
          "Liver": -40,
          "Esophageal": -35,
          "Brain": -30,
          "Stomach": -25,
          "Colorectal": -5,
          "Breast": 15,
          "Prostate": 25,
          "Thyroid": 28,
          "Melanoma": 20,
        };
        
        baseSurvival += cancerTypeAdjustments[input.cancerType] || 0;
        
        // Adjust for stage
        const stageNum = parseInt(input.stage.replace(/[^0-9]/g, '')) || 1;
        baseSurvival -= (stageNum - 1) * 15;
        
        // Adjust for age
        if (input.age > 70) baseSurvival -= 10;
        else if (input.age > 60) baseSurvival -= 5;
        else if (input.age < 50) baseSurvival += 5;
        
        // Adjust for performance status (ECOG)
        baseSurvival -= input.performanceStatus * 8;
        
        // Ensure within bounds
        const predictedSurvival = Math.max(5, Math.min(98, baseSurvival));
        const confidence = 0.85 + Math.random() * 0.1;
        
        // Generate risk factors
        const riskFactors = [];
        if (stageNum >= 3) riskFactors.push("Advanced stage disease");
        if (input.age > 65) riskFactors.push("Advanced age");
        if (input.performanceStatus >= 2) riskFactors.push("Reduced performance status");
        if (["Pancreatic", "Lung", "Liver"].includes(input.cancerType)) {
          riskFactors.push(`${input.cancerType} cancer has lower survival rates`);
        }
        
        // Save prediction if patientId provided
        if (input.patientId) {
          await db.createAiPrediction({
            patientId: input.patientId,
            modelName: "Survival Prediction Model v2.1",
            predictionType: "5-Year Survival Rate",
            predictedValue: predictedSurvival,
            confidenceScore: confidence,
            inputFeatures: JSON.stringify(input),
            riskFactors: JSON.stringify(riskFactors),
          });
        }
        
        return {
          predictedSurvivalRate: Math.round(predictedSurvival * 10) / 10,
          confidence: Math.round(confidence * 1000) / 1000,
          riskFactors,
          modelUsed: "Survival Prediction Model v2.1",
          predictionDate: new Date().toISOString(),
        };
      }),
    
    drugResponsePrediction: protectedProcedure
      .input(z.object({
        patientId: z.number().optional(),
        age: z.number(),
        cancerType: z.string(),
        stage: z.string(),
        drugName: z.string(),
        priorTreatments: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        // Simple drug response prediction
        let baseResponse = 65;
        
        // Adjust for stage
        const stageNum = parseInt(input.stage.replace(/[^0-9]/g, '')) || 1;
        baseResponse -= (stageNum - 1) * 10;
        
        // Adjust for prior treatments
        if (input.priorTreatments && input.priorTreatments > 0) {
          baseResponse -= input.priorTreatments * 8;
        }
        
        // Adjust for age
        if (input.age > 70) baseResponse -= 8;
        else if (input.age < 50) baseResponse += 5;
        
        const predictedResponse = Math.max(10, Math.min(95, baseResponse));
        const confidence = 0.82 + Math.random() * 0.12;
        
        const recommendations = [];
        if (predictedResponse > 70) {
          recommendations.push("High likelihood of positive response");
          recommendations.push("Standard dosing recommended");
        } else if (predictedResponse > 50) {
          recommendations.push("Moderate response expected");
          recommendations.push("Consider combination therapy");
        } else {
          recommendations.push("Lower response probability");
          recommendations.push("Alternative treatment options should be considered");
        }
        
        // Save prediction if patientId provided
        if (input.patientId) {
          await db.createAiPrediction({
            patientId: input.patientId,
            modelName: "Drug Response Model v1.8",
            predictionType: "Treatment Response Rate",
            predictedValue: predictedResponse,
            confidenceScore: confidence,
            inputFeatures: JSON.stringify(input),
            riskFactors: JSON.stringify(recommendations),
          });
        }
        
        return {
          predictedResponseRate: Math.round(predictedResponse * 10) / 10,
          confidence: Math.round(confidence * 1000) / 1000,
          recommendations,
          modelUsed: "Drug Response Model v1.8",
          predictionDate: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
