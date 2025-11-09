import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Activity, 
  Brain, 
  Database, 
  TrendingUp, 
  Users, 
  Heart,
  Microscope,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: cancerTypes, isLoading: cancerTypesLoading } = trpc.cancerTypes.list.useQuery();

  // Prepare chart data from cancer types
  const chartData = cancerTypes?.slice(0, 6).map(ct => ({
    name: ct.name.replace(' Cancer', ''),
    cases: ct.totalCases || 0,
    survival: ct.averageSurvivalRate || 0,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">CancerCare AI</h1>
                <p className="text-sm text-muted-foreground">Clinical Cancer Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Live System
              </Badge>
              {isAuthenticated ? (
                <Button variant="outline" size="sm">
                  {user?.name || 'Dashboard'}
                </Button>
              ) : (
                <Button asChild size="sm">
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              AI-Powered Clinical Platform
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Advancing Cancer Care with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Artificial Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Leveraging machine learning and clinical data analysis to provide insights for better cancer diagnosis, 
              treatment planning, and patient outcomes. Built for clinicians, by researchers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" className="text-lg px-8">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              ) : (
                <Button asChild size="lg" className="text-lg px-8">
                  <a href={getLoginUrl()}>
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started
                  </a>
                </Button>
              )}
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Heart className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-0 border-l-4" style={{borderLeftColor: 'oklch(0.6 0.2 240)'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statsLoading ? '...' : stats?.totalPatients.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Comprehensive patient database</p>
              </CardContent>
            </Card>

            <Card className="p-0 border-l-4" style={{borderLeftColor: 'oklch(0.65 0.18 150)'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancer Types</CardTitle>
                <Microscope className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statsLoading ? '...' : stats?.totalCancerTypes}</div>
                <p className="text-xs text-muted-foreground mt-1">Diverse cancer coverage</p>
              </CardContent>
            </Card>

            <Card className="p-0 border-l-4" style={{borderLeftColor: 'oklch(0.6 0.2 290)'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Models</CardTitle>
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statsLoading ? '...' : stats?.activeModels}</div>
                <p className="text-xs text-muted-foreground mt-1">Active prediction models</p>
              </CardContent>
            </Card>

            <Card className="p-0 border-l-4" style={{borderLeftColor: 'oklch(0.7 0.18 50)'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{statsLoading ? '...' : `${stats?.averageAccuracy}%`}</div>
                <p className="text-xs text-muted-foreground mt-1">Average model accuracy</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cancer Types Chart */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-3">Cancer Types Overview</h3>
            <p className="text-lg text-muted-foreground">Distribution and survival rates across major cancer types</p>
          </div>
          
          <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
            <div className="h-96">
              {cancerTypesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis yAxisId="left" orientation="left" className="text-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="cases" fill="oklch(0.6 0.2 240)" name="Total Cases" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="right" dataKey="survival" fill="oklch(0.65 0.18 150)" name="Survival Rate (%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-3">Platform Features</h3>
            <p className="text-lg text-muted-foreground">Comprehensive tools for clinical cancer care analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Clinical Data Management</h4>
              <p className="text-muted-foreground">
                Comprehensive patient records, treatment histories, and outcome tracking in a unified database.
              </p>
            </Card>

            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI Prediction Models</h4>
              <p className="text-muted-foreground">
                Survival prediction and drug response models trained on clinical parameters for accurate forecasting.
              </p>
            </Card>

            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Treatment Analytics</h4>
              <p className="text-muted-foreground">
                Analyze treatment outcomes, response rates, and efficacy across different cancer types and protocols.
              </p>
            </Card>

            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-orange-100 dark:bg-orange-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Real-time Monitoring</h4>
              <p className="text-muted-foreground">
                Track patient progress, treatment responses, and survival outcomes with live data updates.
              </p>
            </Card>

            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-red-100 dark:bg-red-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Survival Analysis</h4>
              <p className="text-muted-foreground">
                Kaplan-Meier curves, Cox models, and comprehensive survival statistics for clinical research.
              </p>
            </Card>

            <Card className="bg-card text-card-foreground rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Secure & Compliant</h4>
              <p className="text-muted-foreground">
                HIPAA-ready architecture with role-based access control and encrypted data storage.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">CancerCare AI</span>
              <span className="text-muted-foreground">by Sibel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 CancerCare AI. Clinical Cancer Analysis Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
