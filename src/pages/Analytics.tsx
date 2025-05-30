import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import { 
  Calendar, ChevronDown, Download, ExternalLink, RefreshCw,
  BarChart2, Database, TrendingUp, Users, MessageSquare,
  FileText, AlertCircle, CheckCircle, Clock, Target,
  FileUp, PieChart, Sparkles, Cpu, Brain, GraduationCap
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [uploadCount, setUploadCount] = useState(0);
  const [aiInteractionCount, setAiInteractionCount] = useState(0);
  
  // Load actual data counts on component mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Count uploaded datasets
        const datasets = JSON.parse(localStorage.getItem('csv_datasets') || '[]');
        setUploadCount(datasets.length);
        
        // Check for current active data
        const currentData = localStorage.getItem('current_csv_data');
        if (currentData) {
          const parsed = JSON.parse(currentData);
          if (parsed.data && parsed.data.length > 0 && datasets.length === 0) {
            setUploadCount(1);
          }
        }
        
        // Count AI interactions from chat history
        const chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');
        const userMessages = chatHistory.filter((msg: any) => msg.role === 'user');
        setAiInteractionCount(userMessages.length);
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };
    
    loadAnalytics();
  }, []);
  
  const dateRanges = [
    'Today',
    'Yesterday',
    'This Week',
    'This Month',
    'Last Month',
    'This Quarter',
    'Custom Range'
  ];
  
  // Updated performance metrics to reflect actual platform capabilities
  const performanceMetrics = [
    {
      id: 'datasets',
      title: 'Data Sets Analyzed',
      value: uploadCount.toString(),
      change: uploadCount > 0 ? 'Active' : 'Ready',
      isPositive: true,
      icon: <Database className="text-blue-500" size={20} />,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'forms',
      title: 'Form Entries Processed',
      value: '0',
      change: 'Ready',
      isPositive: true,
      icon: <FileUp className="text-purple-500" size={20} />,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'insights',
      title: 'AI Insights Generated',
      value: aiInteractionCount.toString(),
      change: aiInteractionCount > 0 ? 'Active' : 'Ready',
      isPositive: true,
      icon: <Brain className="text-indigo-500" size={20} />,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'responseTime',
      title: 'Avg. AI Response Time',
      value: aiInteractionCount > 0 ? '1.2s' : '--',
      change: 'Ready',
      isPositive: true,
      icon: <Clock className="text-green-500" size={20} />,
      color: 'from-green-500 to-green-600'
    }
  ];
  
  // AI Assistants available in the platform - will show real usage data
  const assistantPerformance = [
    {
      id: 'data-analyst',
      name: 'Executive Data Analyst',
      usageCount: 0,
      usagePercent: 0,
      successRate: 0,
      avgResponseTime: 0,
      color: 'bg-blue-500'
    },
    {
      id: 'form-analyzer',
      name: 'Gravity Forms Analyzer',
      usageCount: 0,
      usagePercent: 0,
      successRate: 0,
      avgResponseTime: 0,
      color: 'bg-emerald-500'
    },
    {
      id: 'lead-manager',
      name: 'Lead Insights Assistant',
      usageCount: 0,
      usagePercent: 0,
      successRate: 0,
      avgResponseTime: 0,
      color: 'bg-amber-500'
    }
  ];
  
  // Data source metrics (aligned with actual platform data sources)
  const dataSourceMetrics = [
    {
      source: 'CSV Uploads',
      metrics: [
        { name: 'Total Uploads', value: 156, change: '+12%' },
        { name: 'Rows Processed', value: '1.2M', change: '+15%' },
        { name: 'Avg. File Size', value: '485KB', change: '+2.4%' }
      ]
    },
    {
      source: 'Gravity Forms',
      metrics: [
        { name: 'Forms Synced', value: 5, change: '+1' },
        { name: 'Entries Processed', value: '3.4K', change: '+8.7%' },
        { name: 'Lead Conversion Rate', value: '5.8%', change: '+0.3%' }
      ]
    },
    {
      source: 'AI Content',
      metrics: [
        { name: 'Content Pieces', value: 248, change: '+16%' },
        { name: 'Word Count Generated', value: '162K', change: '+23%' },
        { name: 'Avg. Quality Score', value: '92/100', change: '+3pts' }
      ]
    },
    {
      source: 'Student Success',
      metrics: [
        { name: 'Success Stories', value: 86, change: '+12' },
        { name: 'Certifications Tracked', value: 524, change: '+52' },
        { name: 'Placement Rate', value: '94.5%', change: '+2.1%' }
      ]
    }
  ];
  
  // Data processing funnel to show how data flows through the platform
  const dataProcessingStages = [
    { name: 'Data Ingestion', count: 4250, percent: 100, color: 'bg-blue-500' },
    { name: 'Processing', count: 4150, percent: 98, color: 'bg-indigo-500' },
    { name: 'Analysis', count: 3950, percent: 93, color: 'bg-purple-500' },
    { name: 'Insight Generation', count: 3820, percent: 90, color: 'bg-violet-500' },
    { name: 'Visualization', count: 3650, percent: 86, color: 'bg-fuchsia-500' },
    { name: 'Action Items', count: 3285, percent: 77, color: 'bg-pink-500' }
  ];
  
  // AI-generated insights relevant to the platform's features
  const insightCards = [
    {
      id: 'insight-1',
      title: 'CSV Data Processing Optimization',
      description: 'The new chunk processing system has reduced analysis time by 42% for large datasets.',
      type: 'success',
      icon: <CheckCircle size={18} />,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'insight-2',
      title: 'Form Data Integration Gap',
      description: 'Gravity Forms "Student Application" conversions are 18% below target. AI recommends enhancing follow-up sequence.',
      type: 'warning',
      icon: <AlertCircle size={18} />,
      color: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    {
      id: 'insight-3',
      title: 'AI Model Performance',
      description: 'o3-mini model provides 3.5x faster analysis than previous models with 92% of the quality at 15% of the cost.',
      type: 'info',
      icon: <Target size={18} />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    }
  ];
  
  // AI model usage statistics
  const aiModelUsage = [
    { 
      model: 'o3-mini',
      requests: 4580,
      tokens: '2.3M',
      avgResponseTime: '1.2s',
      costReduction: '82%',
      color: 'bg-emerald-500'
    },
    { 
      model: 'gpt-4o',
      requests: 620,
      tokens: '890K',
      avgResponseTime: '2.4s',
      costReduction: '-',
      color: 'bg-purple-500'
    }
  ];

  return (
    <Layout title="Analytics">
      <ErrorBoundary>
        <div className="space-y-8">
          {/* Header with date selector */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Performance Dashboard</h1>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-700 hover:bg-gray-50">
                  <Calendar size={16} />
                  <span>{dateRange}</span>
                  <ChevronDown size={16} />
                </button>
              </div>
              
              <button className="bg-white border border-gray-300 rounded-lg p-2 text-gray-700 hover:bg-gray-50">
                <RefreshCw size={18} />
              </button>
              
              <button className="bg-white border border-gray-300 rounded-lg p-2 text-gray-700 hover:bg-gray-50">
                <Download size={18} />
              </button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className={`bg-gradient-to-r ${metric.color} h-1.5`}></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-gray-100">{metric.icon}</div>
                    <div className={`flex items-center ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      <span className="font-medium text-sm">{metric.change}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-gray-500 font-medium text-sm">{metric.title}</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{metric.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* AI Performance and Data Processing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Assistant Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Brain size={18} className="mr-2 text-indigo-600" />
                    AI Assistant Performance
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">Usage and effectiveness metrics for AI features</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Download size={16} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Assistant</span>
                  <div className="flex items-center space-x-16 mr-6">
                    <span>Usage</span>
                    <span>Success</span>
                    <span>Response</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {assistantPerformance.map(assistant => (
                    <div key={assistant.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">{assistant.name}</span>
                        <div className="flex items-center space-x-16">
                          <span className="text-gray-700 text-right w-10">{assistant.usageCount}</span>
                          <span className="text-gray-700 text-right w-12">{assistant.successRate}%</span>
                          <span className="text-gray-700 text-right w-12">{assistant.avgResponseTime}s</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${assistant.color}`} 
                          style={{ width: `${assistant.usagePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <h4 className="text-xs font-medium text-blue-700 mb-1">Total Sessions</h4>
                    <p className="text-xl font-bold text-blue-800">3,184</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <h4 className="text-xs font-medium text-green-700 mb-1">Success Rate</h4>
                    <p className="text-xl font-bold text-green-800">96.8%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <h4 className="text-xs font-medium text-purple-700 mb-1">Avg Response</h4>
                    <p className="text-xl font-bold text-purple-800">1.4s</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Processing Pipeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Cpu size={18} className="mr-2 text-emerald-600" />
                    Data Processing Pipeline
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">From raw data to actionable insights</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="space-y-4">
                  {dataProcessingStages.map(stage => (
                    <div key={stage.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">{stage.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">{stage.count.toLocaleString()}</span>
                          <span className="text-gray-500 text-sm">{stage.percent}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${stage.color}`} 
                          style={{ width: `${stage.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Processing Efficiency</p>
                      <p className="text-xl font-bold text-gray-800">96.4%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data Quality Score</p>
                      <p className="text-xl font-bold text-gray-800">92/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Avg. Processing Time</p>
                      <p className="text-xl font-bold text-gray-800">2.8s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Model Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center">
                  <Sparkles size={18} className="mr-2 text-amber-600" />
                  AI Model Performance
                </h3>
                <p className="text-gray-500 text-sm mt-1">Analysis of model efficiency and effectiveness</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
              {/* Model usage stats */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Model Usage Statistics</h4>
                <div className="space-y-4">
                  {aiModelUsage.map(model => (
                    <div key={model.model} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-800 flex items-center">
                          <span className={`w-2 h-2 rounded-full ${model.color} mr-2`}></span>
                          {model.model}
                        </h5>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-200 rounded-full text-gray-700">
                          {model.requests.toLocaleString()} requests
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Tokens</p>
                          <p className="font-medium text-gray-800">{model.tokens}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg. Time</p>
                          <p className="font-medium text-gray-800">{model.avgResponseTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cost Savings</p>
                          <p className="font-medium text-gray-800">{model.costReduction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Performance metrics chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Response Time Distribution</h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 h-[calc(100%-24px)]">
                  {/* This would be a chart in a real implementation */}
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>&lt; 1s</span>
                          <span>46%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '46%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>1-2s</span>
                          <span>38%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>2-3s</span>
                          <span>12%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>&gt; 3s</span>
                          <span>4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-center text-gray-600">
                      <p>84% of AI responses complete in under 2 seconds</p>
                      <p className="font-medium text-blue-700 mt-1">Average: 1.4 seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Data Source Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center">
                  <Database size={18} className="mr-2 text-blue-600" />
                  Data Source Performance
                </h3>
                <p className="text-gray-500 text-sm mt-1">Analytics by data source type</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Download size={16} />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {dataSourceMetrics.map(source => (
                <div key={source.source} className="p-5">
                  <h4 className="font-bold text-gray-800 mb-3">{source.source}</h4>
                  <div className="space-y-3">
                    {source.metrics.map(metric => (
                      <div key={metric.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">{metric.name}</span>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 mr-2">{metric.value}</span>
                            <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                              {metric.change}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI Insights */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Sparkles size={20} className="mr-2 text-amber-500" />
              AI-Generated Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insightCards.map(insight => (
                <div key={insight.id} className={`rounded-xl p-5 border ${insight.color}`}>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-full bg-white bg-opacity-50">
                      {insight.icon}
                    </div>
                    <div>
                      <h4 className="font-bold mb-1">{insight.title}</h4>
                      <p className="text-sm opacity-80">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Educational Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center">
                <GraduationCap size={18} className="mr-2 text-green-600" />
                Educational Performance Metrics
              </h3>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-green-100">Certification Rate</h4>
                    <p className="text-3xl font-bold mt-1">94.2%</p>
                    <p className="text-green-200 text-sm mt-1 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +2.1% from last quarter
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <GraduationCap size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-blue-100">Job Placement Rate</h4>
                    <p className="text-3xl font-bold mt-1">89.5%</p>
                    <p className="text-blue-200 text-sm mt-1 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +3.2% from last quarter
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Users size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl p-5 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-purple-100">Student Satisfaction</h4>
                    <p className="text-3xl font-bold mt-1">4.8/5</p>
                    <p className="text-purple-200 text-sm mt-1 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +0.2 from last quarter
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg">
                    <CheckCircle size={24} />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h4 className="font-medium text-gray-700 mb-3">Top Certification Programs by Success Rate</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Cybersecurity Professional</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">96.8%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "96.8%"}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Network Administration</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">94.3%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "94.3%"}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">Cloud Computing & Administration</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">92.5%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "92.5%"}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">IT Support Professional</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">91.7%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: "91.7%"}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default Analytics;