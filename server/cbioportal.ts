/**
 * cBioPortal API Integration
 * 
 * This module provides integration with cBioPortal's public API
 * for accessing clinical cancer research data (NO GENOMIC DATA).
 * 
 * API Documentation: https://www.cbioportal.org/api/swagger-ui/index.html
 * 
 * We only use CLINICAL endpoints, avoiding all genomic/mutation endpoints.
 */

const CBIOPORTAL_BASE_URL = 'https://www.cbioportal.org/api';

interface CancerType {
  cancerTypeId: string;
  name: string;
  dedicatedColor: string;
  shortName: string;
  parent?: string;
}

interface Study {
  studyId: string;
  name: string;
  description: string;
  cancerTypeId: string;
  allSampleCount: number;
  citation?: string;
  pmid?: string;
  publicStudy: boolean;
}

interface ClinicalData {
  clinicalAttributeId: string;
  value: string;
  patientId: string;
  sampleId?: string;
  studyId: string;
}

interface Patient {
  patientId: string;
  studyId: string;
  uniquePatientKey: string;
  uniqueSampleKey?: string;
}

/**
 * Fetch all cancer types from cBioPortal
 */
export async function getCancerTypes(): Promise<CancerType[]> {
  try {
    const response = await fetch(`${CBIOPORTAL_BASE_URL}/cancer-types`);
    if (!response.ok) {
      throw new Error(`cBioPortal API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[cBioPortal] Error fetching cancer types:', error);
    return [];
  }
}

/**
 * Fetch all public studies from cBioPortal
 */
export async function getStudies(pageSize: number = 100): Promise<Study[]> {
  try {
    const response = await fetch(`${CBIOPORTAL_BASE_URL}/studies?pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error(`cBioPortal API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[cBioPortal] Error fetching studies:', error);
    return [];
  }
}

/**
 * Fetch clinical data for a specific study
 * NOTE: This only fetches CLINICAL data, not genomic data
 */
export async function getClinicalDataByStudy(
  studyId: string,
  clinicalDataType: 'SAMPLE' | 'PATIENT' = 'PATIENT'
): Promise<ClinicalData[]> {
  try {
    const response = await fetch(
      `${CBIOPORTAL_BASE_URL}/studies/${studyId}/clinical-data?clinicalDataType=${clinicalDataType}`
    );
    if (!response.ok) {
      throw new Error(`cBioPortal API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[cBioPortal] Error fetching clinical data for study ${studyId}:`, error);
    return [];
  }
}

/**
 * Fetch patients from a specific study
 */
export async function getPatientsByStudy(studyId: string): Promise<Patient[]> {
  try {
    const response = await fetch(`${CBIOPORTAL_BASE_URL}/studies/${studyId}/patients`);
    if (!response.ok) {
      throw new Error(`cBioPortal API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[cBioPortal] Error fetching patients for study ${studyId}:`, error);
    return [];
  }
}

/**
 * Get aggregated statistics from cBioPortal
 */
export async function getAggregatedStats() {
  try {
    const [cancerTypes, studies] = await Promise.all([
      getCancerTypes(),
      getStudies(1000) // Get more studies for better statistics
    ]);

    // Calculate total samples across all studies
    const totalSamples = studies.reduce((sum, study) => sum + (study.allSampleCount || 0), 0);

    // Group studies by cancer type
    const studiesByCancerType = studies.reduce((acc, study) => {
      if (!acc[study.cancerTypeId]) {
        acc[study.cancerTypeId] = [];
      }
      acc[study.cancerTypeId].push(study);
      return acc;
    }, {} as Record<string, Study[]>);

    // Calculate samples per cancer type
    const samplesByCancerType = Object.entries(studiesByCancerType).map(([cancerTypeId, studyList]) => {
      const cancerType = cancerTypes.find(ct => ct.cancerTypeId === cancerTypeId);
      const totalSamplesForType = studyList.reduce((sum, study) => sum + (study.allSampleCount || 0), 0);
      
      return {
        cancerTypeId,
        name: cancerType?.name || cancerTypeId,
        shortName: cancerType?.shortName || cancerTypeId,
        totalSamples: totalSamplesForType,
        studyCount: studyList.length
      };
    });

    // Sort by total samples descending
    samplesByCancerType.sort((a, b) => b.totalSamples - a.totalSamples);

    return {
      totalSamples,
      totalStudies: studies.length,
      totalCancerTypes: cancerTypes.length,
      samplesByCancerType: samplesByCancerType.slice(0, 30), // Top 30 cancer types
      recentStudies: studies
        .filter(s => s.publicStudy)
        .slice(0, 10)
        .map(s => ({
          name: s.name,
          cancerType: s.cancerTypeId,
          samples: s.allSampleCount,
          citation: s.citation
        }))
    };
  } catch (error) {
    console.error('[cBioPortal] Error getting aggregated stats:', error);
    return {
      totalSamples: 0,
      totalStudies: 0,
      totalCancerTypes: 0,
      samplesByCancerType: [],
      recentStudies: []
    };
  }
}

/**
 * Get specific cancer type details with associated studies
 */
export async function getCancerTypeDetails(cancerTypeId: string) {
  try {
    const [cancerTypes, studies] = await Promise.all([
      getCancerTypes(),
      getStudies(1000)
    ]);

    const cancerType = cancerTypes.find(ct => ct.cancerTypeId === cancerTypeId);
    const relatedStudies = studies.filter(s => s.cancerTypeId === cancerTypeId);
    const totalSamples = relatedStudies.reduce((sum, study) => sum + (study.allSampleCount || 0), 0);

    return {
      cancerType,
      studies: relatedStudies,
      totalSamples,
      studyCount: relatedStudies.length
    };
  } catch (error) {
    console.error(`[cBioPortal] Error getting cancer type details for ${cancerTypeId}:`, error);
    return null;
  }
}
