import React from 'react';
import Layout from '../components/layout/Layout';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import StatsCard from '../components/dashboard/StatsCard';
import QuickAccessCard from '../components/dashboard/QuickAccessCard';
import RecentActivitiesCard from '../components/dashboard/RecentActivitiesCard';
import { 
  PenSquare, Users, BarChart3, MessageSquare, 
  Sparkles, FileText, Facebook, Linkedin, Instagram, TrendingUp 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data
  const quickAccessLinks = [
    {
      id: '1',
      title: 'Enterprise Content Studio',
      icon: <PenSquare size={18} />,
      path: '/assistants/content-creator'
    },
    {
      id: '2',
      title: 'Success Story Engine',
      icon: <Sparkles size={18} />,
      path: '/assistants/student-success'
    },
    {
      id: '3',
      title: 'Market Insights Hub',
      icon: <TrendingUp size={18} />,
      path: '/assistants/market-intelligence'
    },
    {
      id: '4',
      title: 'Lead Management',
      icon: <Users size={18} />,
      path: '/leads'
    }
  ];

  const socialLinks = [
    {
      id: '1',
      title: 'LinkedIn Engagement Pro',
      icon: <Linkedin size={18} />,
      path: '/assistants/social/linkedin'
    },
    {
      id: '2',
      title: 'Community Connect',
      icon: <Facebook size={18} />,
      path: '/assistants/social/facebook'
    },
    {
      id: '3',
      title: 'Visual Story Creator',
      icon: <Instagram size={18} />,
      path: '/assistants/social/instagram'
    }
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Created a new blog post about "Top IT Certifications for 2025"',
      type: 'content',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      user: {
        name: 'Bruce Ackerman',
      }
    },
    {
      id: '2',
      title: 'Generated a lead report for Michael Smith',
      type: 'lead',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: {
        name: 'Matthew Neitzel',
      }
    },
    {
      id: '3',
      title: 'Published LinkedIn post about student success stories',
      type: 'content',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      user: {
        name: 'Aaron Martin',
      }
    }
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WelcomeCard userName="Alan Kerbel" />
          </div>
          <div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white h-full flex flex-col justify-center">
              <div className="bg-white/10 p-4 rounded-lg inline-block mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Assistant Metrics</h3>
              <p className="text-purple-100 mb-4">Your AI assistants are performing exceptionally well this month.</p>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-3xl font-bold">94%</div>
                  <div className="text-purple-200 text-sm">Accuracy Rate</div>
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold">1.2s</div>
                  <div className="text-purple-200 text-sm">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Total Content Created" 
            value="248" 
            change={12} 
            icon={<FileText size={20} className="text-gray-600" />} 
          />
          <StatsCard 
            title="Lead Reports" 
            value="52" 
            change={8} 
            icon={<Users size={20} className="text-gray-600" />} 
          />
          <StatsCard 
            title="AI Sessions" 
            value="187" 
            change={-3} 
            icon={<MessageSquare size={20} className="text-gray-600" />} 
          />
          <StatsCard 
            title="Social Media Posts" 
            value="95" 
            change={24} 
            icon={<BarChart3 size={20} className="text-gray-600" />} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivitiesCard activities={recentActivities} />
          </div>
          <div className="space-y-6">
            <QuickAccessCard title="Quick Access" links={quickAccessLinks} />
            <QuickAccessCard title="Social Media" links={socialLinks} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;