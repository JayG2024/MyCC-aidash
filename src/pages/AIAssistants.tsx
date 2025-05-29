import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  PenSquare, Users, BarChart3, MessageSquare, 
  FileText, Search, PlusCircle, Sparkles, TrendingUp
} from 'lucide-react';
import { AIAssistant } from '../types';

const assistants: AIAssistant[] = [
  {
    id: 'content-creator',
    name: 'Enterprise Content Studio',
    description: 'Advanced AI-powered content generation suite for educational marketing',
    icon: 'PenSquare',
    category: 'content',
    features: [
      'Industry-focused blog content',
      'Technical documentation',
      'Course descriptions',
      'Email marketing campaigns',
      'Landing page copy'
    ]
  },
  {
    id: 'student-success',
    name: 'Success Story Engine',
    description: 'AI-driven platform for capturing and showcasing student achievements',
    icon: 'Sparkles',
    category: 'student',
    features: [
      'Career transformation narratives',
      'Alumni success stories',
      'Certification achievement spotlights',
      'Student testimonial enhancement',
      'Graduate placement highlights'
    ]
  },
  {
    id: 'market-intelligence',
    name: 'Market Insights Hub',
    description: 'Real-time market analysis and competitive intelligence platform',
    icon: 'TrendingUp',
    category: 'market',
    features: [
      'IT industry trend analysis',
      'Certification value tracking',
      'Competitor program monitoring',
      'Salary data compilation',
      'Job market demand forecasting'
    ]
  },
  {
    id: 'media-relations',
    name: 'Media Relations Suite',
    description: 'Comprehensive PR and media communication platform',
    icon: 'FileText',
    category: 'press',
    features: [
      'Press release generation',
      'Media pitch creation',
      'Award submission content',
      'Partnership announcements',
      'Crisis communication templates'
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Engagement Pro',
    description: 'B2B-focused content generation for professional networking',
    icon: 'MessageSquare',
    category: 'social',
    features: [
      'Thought leadership content',
      'Industry insight posts',
      'Certification announcements',
      'Alumni success spotlights',
      'Corporate updates'
    ]
  },
  {
    id: 'facebook',
    name: 'Community Connect',
    description: 'Engagement-focused content for building student community',
    icon: 'MessageSquare',
    category: 'social',
    features: [
      'Campus life updates',
      'Event promotions',
      'Student achievements',
      'Community highlights',
      'Educational tips'
    ]
  },
  {
    id: 'instagram',
    name: 'Visual Story Creator',
    description: 'Visual-first content generation for engaging storytelling',
    icon: 'MessageSquare',
    category: 'social',
    features: [
      'Story sequence planning',
      'Carousel post design',
      'Reel script generation',
      'Visual content strategy',
      'Behind-the-scenes content'
    ]
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'PenSquare':
      return <PenSquare size={24} />;
    case 'Sparkles':
      return <Sparkles size={24} />;
    case 'TrendingUp':
      return <TrendingUp size={24} />;
    case 'FileText':
      return <FileText size={24} />;
    case 'MessageSquare':
      return <MessageSquare size={24} />;
    default:
      return <MessageSquare size={24} />;
  }
};

const AIAssistants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        assistant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? assistant.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: null, name: 'All' },
    { id: 'content', name: 'Content Creation' },
    { id: 'social', name: 'Social Engagement' },
    { id: 'market', name: 'Market Analysis' },
    { id: 'student', name: 'Student Success' },
    { id: 'press', name: 'Media Relations' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content':
        return 'bg-indigo-100 text-indigo-600';
      case 'social':
        return 'bg-violet-100 text-violet-600';
      case 'market':
        return 'bg-emerald-100 text-emerald-600';
      case 'student':
        return 'bg-amber-100 text-amber-600';
      case 'press':
        return 'bg-rose-100 text-rose-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout title="AI Assistants">
      <div className="space-y-6">
        {/* Search and filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id ?? 'all'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Assistant grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAssistants.map(assistant => (
            <div 
              key={assistant.id} 
              className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg transition-colors duration-300 group-hover:bg-opacity-80 ${getCategoryColor(assistant.category)}`}>
                    {getIconComponent(assistant.icon)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${getCategoryColor(assistant.category)}`}>
                    {categories.find(c => c.id === assistant.category)?.name}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                  {assistant.name}
                </h3>
                <p className="text-gray-600 mb-6">{assistant.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {assistant.features.map((feature, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 transition-colors duration-300 ${
                          getCategoryColor(assistant.category).replace('bg-', '').replace('text-', 'bg-')
                        }`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className={`w-full py-3 px-4 text-white rounded-lg font-medium transition-all duration-300 ${
                  getCategoryColor(assistant.category)
                    .replace('bg-', 'bg-opacity-90 bg-')
                    .replace('text-', '')
                } hover:bg-opacity-100 hover:shadow-md`}>
                  Use Assistant
                </button>
              </div>
            </div>
          ))}
          
          {/* Add new assistant card */}
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center p-6 h-full">
            <div className="p-3 rounded-full bg-gray-100 mb-4">
              <PlusCircle size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Create Custom Assistant</h3>
            <p className="text-gray-500 text-center mb-4">Build a specialized AI assistant for your specific needs</p>
            <button className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistants;