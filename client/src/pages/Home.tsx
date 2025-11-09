import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Brain, Database, TrendingUp, Microscope, FileText, Heart, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Fetch data from API
  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: cancerTypes } = trpc.cancerTypes.list.useQuery();
  const { data: treatmentTimeline } = trpc.treatmentOutcomes.timeline.useQuery();
  const { data: aiModels } = trpc.aiModels.list.useQuery();
  const { data: progress } = trpc.analysisProgress.get.useQuery();
  const { data: datasets } = trpc.datasets.list.useQuery();

  // Animated progress
  useEffect(() => {
    if (progress) {
      const timer = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= progress.clinicalProcessing) return progress.clinicalProcessing;
          return prev + 1;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [progress]);

  // Prepare chart data
  const cancerTypesChartData = cancerTypes?.map(ct => ({
    name: ct.name,
    cases: ct.totalCases,
    survival: ct.averageSurvivalRate
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CancerAI
                </h1>
                <p className="text-sm text-gray-600">AI-Driven Cancer Research Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Activity className="h-3 w-3 mr-1" />
                Live Analysis
              </Badge>
              <p className="text-sm text-gray-600">by Sibel</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 px-4">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-1">
              AI-Powered Clinical Platform
            </Badge>
          </div>
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Advancing Cancer Research with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Leveraging machine learning and clinical data analysis to uncover insights for better cancer 
            diagnosis, treatment planning, and patient outcomes. Built for clinicians, by researchers.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Samples</CardTitle>
              <Database className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalPatients.toLocaleString() || '50'}</div>
              <p className="text-xs text-gray-500 mt-1">Comprehensive patient database</p>
            </CardContent>
          </Card>
          
          <Card className="border-indigo-100 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Cancer Types</CardTitle>
              <Microscope className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats?.totalCancerTypes || '24'}</div>
              <p className="text-xs text-gray-500 mt-1">Diverse cancer coverage</p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-100 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">AI Models</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{aiModels?.length || '3'}</div>
              <p className="text-xs text-gray-500 mt-1">Active prediction models</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-100 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {aiModels && aiModels.length > 0 
                  ? `${(aiModels.reduce((sum, m) => sum + m.accuracy, 0) / aiModels.length).toFixed(1)}%`
                  : '91.5%'}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average model accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Progress - NO GENOMIC */}
        <Card className="mb-8 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Real-time Analysis Progress</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Current clinical data processing and model training status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2 text-gray-700">
                  <span className="font-medium">Clinical Data Processing</span>
                  <span className="font-semibold text-blue-600">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">TCGA Data: {progress?.tcgaStatus || 'Complete'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Model Training: {progress?.modelTrainingStatus || 'In Progress'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">Validation: {progress?.validationStatus || 'In Progress'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs - NO GENOMICS TAB */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              Outcomes
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              AI Models
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">Cancer Types Distribution</CardTitle>
                  <CardDescription>Sample distribution across different cancer types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cancerTypesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="cases" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardHeader>
                  <CardTitle className="text-gray-900">5-Year Survival Rates</CardTitle>
                  <CardDescription>Survival rates by cancer type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cancerTypesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Survival Rate']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="survival" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Datasets Section */}
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Database className="h-5 w-5 text-indigo-600" />
                  <span>Data Sources</span>
                </CardTitle>
                <CardDescription>Clinical cancer research datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {datasets?.map((dataset, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all">
                      <h4 className="font-semibold text-gray-900 mb-2">{dataset.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Samples:</span>
                          <span className="font-medium text-gray-700">{dataset.samples.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cancer Types:</span>
                          <span className="font-medium text-gray-700">{dataset.cancerTypes}</span>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {dataset.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-6">
            <Card className="border-indigo-100">
              <CardHeader>
                <CardTitle className="text-gray-900">Treatment Outcomes Over Time</CardTitle>
                <CardDescription>Monthly treatment success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={treatmentTimeline || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} name="Success" />
                    <Line type="monotone" dataKey="partial" stroke="#f59e0b" strokeWidth={3} name="Partial" />
                    <Line type="monotone" dataKey="failure" stroke="#ef4444" strokeWidth={3} name="Failure" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiModels?.map((model, idx) => (
                <Card key={idx} className="border-purple-100 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Brain className="h-8 w-8 text-purple-600" />
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {model.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-gray-900 mt-3">{model.name}</CardTitle>
                    <CardDescription>{model.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-semibold text-purple-600">{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Training Samples</span>
                          <span className="font-medium text-gray-900">{model.trainingSamples.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500 pb-8">
          <p>© 2024 CancerAI - Clinical Cancer Analysis Platform. by Sibel</p>
        </div>
      </main>
    </div>
  );
}
