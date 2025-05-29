import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  FileText, Download, Filter, Calendar, Search, 
  ChevronDown, ArrowUpDown, RefreshCw, Star, UserCheck, 
  BarChart2, PieChart, TrendingUp, Users
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'lead' | 'content' | 'performance' | 'market';
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'published' | 'archived';
  aiAssistant?: string;
  rating?: number;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Q2 Lead Conversion Analysis',
    type: 'lead',
    createdBy: 'Jaydus Martin',
    createdAt: new Date('2023-07-01'),
    status: 'published',
    aiAssistant: 'Market Insights Hub',
    rating: 4.8
  },
  {
    id: '2',
    title: 'IT Certification Trends 2025',
    type: 'market',
    createdBy: 'Alice Johnson',
    createdAt: new Date('2023-06-28'),
    status: 'published',
    aiAssistant: 'Market Insights Hub',
    rating: 4.9
  },
  {
    id: '3',
    title: 'Social Media Engagement Analysis',
    type: 'performance',
    createdBy: 'John Davis',
    createdAt: new Date('2023-06-25'),
    status: 'published',
    aiAssistant: 'LinkedIn Engagement Pro',
    rating: 4.5
  },
  {
    id: '4',
    title: 'Top Performing Blog Content',
    type: 'content',
    createdBy: 'Sarah Williams',
    createdAt: new Date('2023-06-20'),
    status: 'published',
    aiAssistant: 'Enterprise Content Studio',
    rating: 4.7
  },
  {
    id: '5',
    title: 'Industry Partnerships Opportunity Analysis',
    type: 'market',
    createdBy: 'Jaydus Martin',
    createdAt: new Date('2023-06-15'),
    status: 'draft',
    aiAssistant: 'Market Insights Hub'
  },
  {
    id: '6',
    title: 'Student Outcome Projection',
    type: 'performance',
    createdBy: 'Michael Brown',
    createdAt: new Date('2023-06-10'),
    status: 'archived',
    aiAssistant: 'Success Story Engine',
    rating: 4.3
  },
  {
    id: '7',
    title: 'Campus Expansion Analysis',
    type: 'market',
    createdBy: 'Alice Johnson',
    createdAt: new Date('2023-06-05'),
    status: 'published',
    aiAssistant: 'Market Insights Hub',
    rating: 4.6
  }
];

// Featured reports with additional data
const featuredReports = [
  {
    id: '1',
    title: 'IT Certification Market Analysis',
    description: 'Comprehensive analysis of the current IT certification landscape, value trends, and future projections.',
    insights: [
      '37% increase in cloud certification demand',
      'Cybersecurity certifications yielding highest ROI',
      'Entry-level IT certification market growing at 15% annually'
    ],
    type: 'market',
    createdBy: 'Market Insights Hub',
    thumbnail: 'https://images.pexels.com/photos/7947782/pexels-photo-7947782.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Lead Conversion Optimization',
    description: 'Analysis of current lead conversion funnel with AI-driven recommendations for optimization.',
    insights: [
      'Follow-up timing critical for 28% of conversions',
      'Personalized outreach increases conversion by 42%',
      'Technical assessment calls yield 3.2x better qualification'
    ],
    type: 'lead',
    createdBy: 'Success Story Engine',
    thumbnail: 'https://images.pexels.com/photos/6476808/pexels-photo-6476808.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3',
    title: 'LinkedIn Content Performance',
    description: 'Detailed analysis of content engagement patterns and recommendations for optimization.',
    insights: [
      'Student success stories generate 3.5x engagement',
      'Technical tip posts reach 74% more potential students',
      'Video content has 2.8x higher conversion rate'
    ],
    type: 'content',
    createdBy: 'LinkedIn Engagement Pro',
    thumbnail: 'https://images.pexels.com/photos/8353841/pexels-photo-8353841.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published':
        return 'bg-green-100 text-green-600';
      case 'draft':
        return 'bg-yellow-100 text-yellow-600';
      case 'archived':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'lead':
        return <Users size={16} />;
      case 'content':
        return <FileText size={16} />;
      case 'performance':
        return <TrendingUp size={16} />;
      case 'market':
        return <BarChart2 size={16} />;
      default:
        return <FileText size={16} />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'lead':
        return 'bg-purple-100 text-purple-600';
      case 'content':
        return 'bg-blue-100 text-blue-600';
      case 'performance':
        return 'bg-emerald-100 text-emerald-600';
      case 'market':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType ? report.type === selectedType : true;
    const matchesStatus = selectedStatus ? report.status === selectedStatus : true;
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const typeFilters = [
    { id: null, name: 'All Types' },
    { id: 'lead', name: 'Lead Analysis' },
    { id: 'content', name: 'Content Performance' },
    { id: 'performance', name: 'AI Performance' },
    { id: 'market', name: 'Market Intelligence' }
  ];
  
  const statusFilters = [
    { id: null, name: 'All Status' },
    { id: 'published', name: 'Published' },
    { id: 'draft', name: 'Draft' },
    { id: 'archived', name: 'Archived' }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={`${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Layout title="Reports">
      <div className="space-y-8">
        {/* Featured Reports */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Featured Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReports.map(report => (
              <div key={report.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md group">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={report.thumbnail} 
                    alt={report.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(report.type)}`}>
                      {typeFilters.find(t => t.id === report.type)?.name}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">
                      Generated by {report.createdBy}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Insights:</h4>
                    <ul className="space-y-1">
                      {report.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                      <FileText size={16} className="mr-1" />
                      View Full Report
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                      <Download size={16} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Report List */}
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">All Reports</h2>
                  <p className="text-gray-600">Browse and manage all generated reports</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    <FileText size={18} className="mr-2" />
                    Generate New Report
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filters and Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50">
                      <span className="mr-2">Type</span>
                      <ChevronDown size={16} />
                    </button>
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden">
                      <div className="py-1">
                        {typeFilters.map(filter => (
                          <button
                            key={filter.id ?? 'all-types'}
                            onClick={() => setSelectedType(filter.id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {filter.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50">
                      <span className="mr-2">Status</span>
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50">
                    <Calendar size={16} className="mr-2" />
                    <span>Date Range</span>
                  </button>
                  
                  <button className="p-2 bg-white border border-gray-300 rounded-lg text-blue-600 hover:bg-gray-50">
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <span>Report</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-1 cursor-pointer">
                        <span>Created</span>
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Assistant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{report.title}</div>
                        <div className="text-gray-500 text-sm">By {report.createdBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                          {getTypeIcon(report.type)}
                          <span>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {report.aiAssistant || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.rating ? renderStars(report.rating) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-3">
                          <button className="text-blue-600 hover:text-blue-900" title="View Report">
                            <FileText size={18} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900" title="Download">
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredReports.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500">No reports found matching your criteria.</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredReports.length}</span> of <span className="font-medium">{mockReports.length}</span> reports
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Reports;