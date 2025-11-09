# CancerCare AI - Clinical Cancer Analysis Platform

**by Sibel**

An AI-driven clinical cancer care platform focusing on treatment analysis, survival prediction, and medical data management. This platform removes genomic analysis complexity and focuses on practical clinical decision support using a unified database approach.

## 🎯 Project Overview

CancerCare AI is a streamlined version of cancer research platforms that emphasizes **clinical practicality** over genomic complexity. It provides:

- **Clinical Data Management**: Comprehensive patient records, treatment histories, and outcome tracking
- **AI Prediction Models**: Survival prediction and drug response forecasting based on clinical parameters
- **Treatment Analytics**: Analysis of treatment outcomes, response rates, and efficacy
- **Unified Database**: Single MySQL/TiDB database for all data management
- **No Genomic Analysis**: Focused on clinical parameters accessible to all healthcare providers

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express
- tRPC for type-safe API
- Drizzle ORM
- MySQL/TiDB database

**Frontend:**
- React 19
- Tailwind CSS 4
- Recharts for data visualization
- shadcn/ui components

### Database Schema

The platform uses a single unified database with the following tables:

- `users` - User authentication and roles
- `cancer_types` - Cancer type definitions and statistics
- `patients` - Patient demographic and diagnosis information
- `treatment_records` - Treatment history and protocols
- `treatment_outcomes` - Treatment response and results
- `survival_data` - Patient survival and follow-up information
- `medical_images` - Medical imaging metadata
- `ai_predictions` - AI model predictions and confidence scores
- `statistics` - Aggregated statistical data

## 🚀 Features

### 1. Dashboard & Statistics
- Real-time patient statistics
- Cancer type distribution charts
- Survival rate visualizations
- Treatment outcome trends

### 2. AI Prediction Models

**Survival Prediction Model**
- Input: Age, gender, cancer type, stage, performance status
- Output: 5-year survival rate prediction with confidence score
- Target Accuracy: 88-92%

**Drug Response Prediction Model**
- Input: Patient demographics, cancer type, stage, drug name, prior treatments
- Output: Treatment response rate prediction with recommendations
- Target Accuracy: 85-90%

### 3. Clinical Data Management
- Patient records management
- Treatment history tracking
- Outcome monitoring
- Survival data analysis

## 📊 Key Differences from Original Project

| Feature | Original CancerAI | CancerCare AI |
|---------|------------------|---------------|
| **Genomic Analysis** | ✅ Extensive | ❌ Removed |
| **Database** | Multiple (TCGA, CRDC, TCIA, CDC) | Single unified MySQL/TiDB |
| **Focus** | Research & Genomics | Clinical Decision Support |
| **Complexity** | High | Moderate |
| **Target Users** | Researchers & Geneticists | Clinicians & Healthcare Providers |
| **Data Sources** | Genomic + Clinical | Clinical Only |
| **Model Features** | Genomic + Clinical | Clinical Parameters Only |

## 🔧 Development

### Prerequisites
- Node.js 22+
- pnpm
- MySQL/TiDB database

### Setup

1. Clone and install dependencies:
```bash
cd cancercare-ai-sibel
pnpm install
```

2. Configure environment variables (automatically injected in Manus platform)

3. Push database schema:
```bash
pnpm db:push
```

4. Seed demo data (optional):
```bash
pnpm exec tsx seed-data.mjs
```

5. Start development server:
```bash
pnpm dev
```

### Database Management

**Update schema:**
```bash
# Edit drizzle/schema.ts
pnpm db:push
```

**View database:**
Use the Database panel in Manus Management UI

## 🎨 Design Philosophy

- **Medical Theme**: Professional blue and purple gradient color scheme
- **Clean Interface**: Card-based layout with clear visual hierarchy
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: WCAG-compliant color contrasts and keyboard navigation
- **Data Visualization**: Interactive charts using Recharts

## 📈 AI Models

### Survival Prediction Algorithm

```typescript
baseSurvival = 70
+ cancerTypeAdjustment (-55 to +28)
- (stage - 1) * 15
- performanceStatus * 8
+ ageAdjustment (-10 to +5)
= predictedSurvival (5-98%)
```

### Drug Response Algorithm

```typescript
baseResponse = 65
- (stage - 1) * 10
- priorTreatments * 8
+ ageAdjustment (-8 to +5)
= predictedResponse (10-95%)
```

## 🔐 Security & Compliance

- Role-based access control (admin/user)
- Manus OAuth authentication
- Encrypted data storage
- HIPAA-ready architecture
- Audit logging capabilities

## 📝 API Endpoints

### Cancer Types
- `cancerTypes.list` - Get all cancer types
- `cancerTypes.getById` - Get specific cancer type

### Patients
- `patients.list` - List all patients
- `patients.getById` - Get patient details
- `patients.getTreatments` - Get patient treatments
- `patients.getOutcomes` - Get treatment outcomes
- `patients.getSurvival` - Get survival data
- `patients.getImages` - Get medical images
- `patients.getPredictions` - Get AI predictions

### Dashboard
- `dashboard.stats` - Get overall statistics
- `dashboard.treatmentOutcomes` - Get outcome statistics

### Predictions
- `predictions.survivalPrediction` - Predict survival rate
- `predictions.drugResponsePrediction` - Predict drug response

## 📚 Documentation

- **Technical Report**: See original project documentation for methodology
- **API Documentation**: tRPC procedures in `server/routers.ts`
- **Database Schema**: Defined in `drizzle/schema.ts`
- **Frontend Components**: Located in `client/src/`

## 🎯 Future Enhancements

- [ ] Patient management interface
- [ ] Treatment planning module
- [ ] Advanced survival analysis (Kaplan-Meier curves)
- [ ] Medical image classification
- [ ] Clinical trial matching
- [ ] Report generation
- [ ] Multi-language support

## 👥 Credits

**Developed by**: Sibel  
**Platform**: Manus AI  
**Based on**: CancerAI Project (genomic analysis removed)

## 📄 License

This project is for educational and research purposes.

---

**Note**: This platform is designed for clinical decision support and should not replace professional medical judgment. All predictions should be validated by qualified healthcare providers.
