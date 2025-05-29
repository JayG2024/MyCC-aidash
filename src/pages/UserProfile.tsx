import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { 
  User, Mail, Phone, MapPin, Building, Briefcase, 
  Calendar, Settings, Shield, Bell, Lock, LogOut,
  Edit, Check, X, Upload, ExternalLink, ChevronRight
} from 'lucide-react';

// Mock user data
const userData = {
  id: 'user-1',
  firstName: 'Jaydus',
  lastName: 'Martin',
  email: 'jaydus.martin@mycomputercareer.edu',
  phone: '(555) 123-4567',
  role: 'Marketing Director',
  department: 'Marketing',
  location: 'Raleigh, NC',
  joinDate: new Date('2020-06-15'),
  avatar: null, // Would be an image URL
  bio: 'Marketing Director at MyComputerCareer with 10+ years of experience in educational marketing and lead generation. Passionate about leveraging AI to improve student acquisition and engagement.',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/jaydusmartin',
    twitter: 'https://twitter.com/jaydusmartin'
  }
};

// Mock recent activities
const recentActivities = [
  {
    id: 'activity-1',
    type: 'content',
    action: 'Created',
    item: 'Industry Insights: Top IT Certifications for 2025',
    assistant: 'Enterprise Content Studio',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'activity-2',
    type: 'report',
    action: 'Generated',
    item: 'Q2 Lead Conversion Analysis',
    assistant: 'Market Insights Hub',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'activity-3',
    type: 'social',
    action: 'Published',
    item: 'LinkedIn post about student success stories',
    assistant: 'LinkedIn Engagement Pro',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'activity-4',
    type: 'lead',
    action: 'Analyzed',
    item: 'Prospect report for Michael Smith',
    assistant: 'Success Story Engine',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
];

// Mock favorite AI assistants
const favoriteAssistants = [
  {
    id: 'assistant-1',
    name: 'Enterprise Content Studio',
    icon: '📝',
    usageCount: 87,
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'assistant-2',
    name: 'LinkedIn Engagement Pro',
    icon: '🔗',
    usageCount: 64,
    lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 'assistant-3',
    name: 'Market Insights Hub',
    icon: '📊',
    usageCount: 42,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  }
];

// Mock preference settings
const preferences = {
  notifications: {
    email: true,
    browser: true,
    reports: true,
    system: false
  },
  aiSettings: {
    autoSave: true,
    defaultAssistant: 'Enterprise Content Studio',
    contentApproval: 'manual',
    dataCollection: true
  },
  appearance: {
    theme: 'light',
    compactView: false,
    fontSize: 'medium'
  }
};

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    
    return 'just now';
  };
  
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'content':
        return <Edit size={16} className="text-purple-500" />;
      case 'report':
        return <ExternalLink size={16} className="text-blue-500" />;
      case 'social':
        return <Upload size={16} className="text-indigo-500" />;
      case 'lead':
        return <User size={16} className="text-green-500" />;
      default:
        return <Check size={16} className="text-gray-500" />;
    }
  };

  return (
    <Layout title="Profile">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-24 relative">
                {editMode && (
                  <button className="absolute right-4 top-4 bg-white bg-opacity-20 p-1.5 rounded-full text-white hover:bg-opacity-30">
                    <Edit size={16} />
                  </button>
                )}
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-12 left-6">
                  {userData.avatar ? (
                    <img 
                      src={userData.avatar} 
                      alt={`${userData.firstName} ${userData.lastName}`}
                      className="w-24 h-24 rounded-full border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center border-4 border-white">
                      {getInitials(userData.firstName, userData.lastName)}
                    </div>
                  )}
                </div>
                
                <div className="mt-14">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                      {userData.firstName} {userData.lastName}
                    </h2>
                    
                    {!editMode ? (
                      <button 
                        onClick={() => setEditMode(true)}
                        className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setEditMode(false)}
                          className="text-green-600 hover:text-green-700 flex items-center text-sm font-medium"
                        >
                          <Check size={14} className="mr-1" />
                          Save
                        </button>
                        <button 
                          onClick={() => setEditMode(false)}
                          className="text-red-600 hover:text-red-700 flex items-center text-sm font-medium"
                        >
                          <X size={14} className="mr-1" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-1">{userData.role}</p>
                  
                  {editMode ? (
                    <textarea
                      defaultValue={userData.bio}
                      className="w-full mt-3 p-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-600 text-sm mt-3">{userData.bio}</p>
                  )}
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    {editMode ? (
                      <input 
                        type="email" 
                        defaultValue={userData.email}
                        className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm">{userData.email}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    {editMode ? (
                      <input 
                        type="text" 
                        defaultValue={userData.phone}
                        className="border border-gray-300 rounded-md p-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-sm">{userData.phone}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Building size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">{userData.department}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <MapPin size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">{userData.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-3 text-gray-400" />
                    <span className="text-sm">Joined {formatDate(userData.joinDate)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <nav>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full px-6 py-3.5 text-left ${
                    activeTab === 'profile' 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  <span className="font-medium">Profile Information</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`flex items-center w-full px-6 py-3.5 text-left ${
                    activeTab === 'activity' 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={18} className="mr-3" />
                  <span className="font-medium">Activity & History</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className={`flex items-center w-full px-6 py-3.5 text-left ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings size={18} className="mr-3" />
                  <span className="font-medium">Preferences</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center w-full px-6 py-3.5 text-left ${
                    activeTab === 'security' 
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield size={18} className="mr-3" />
                  <span className="font-medium">Security</span>
                </button>
                
                <button 
                  className="flex items-center w-full px-6 py-3.5 text-left text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} className="mr-3" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2">
            {/* Profile Section */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Profile Information</h3>
                  </div>
                  
                  <div className="p-6">
                    {editMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input 
                            type="text"
                            defaultValue={userData.firstName}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input 
                            type="text"
                            defaultValue={userData.lastName}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <input 
                            type="text"
                            defaultValue={userData.role}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option selected={userData.department === 'Marketing'}>Marketing</option>
                            <option selected={userData.department === 'Sales'}>Sales</option>
                            <option selected={userData.department === 'Education'}>Education</option>
                            <option selected={userData.department === 'Administration'}>Administration</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input 
                            type="text"
                            defaultValue={userData.location}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Personal Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Full Name</p>
                              <p className="font-medium text-gray-800">{userData.firstName} {userData.lastName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-800">{userData.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-medium text-gray-800">{userData.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium text-gray-800">{userData.location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Work Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Role</p>
                              <p className="font-medium text-gray-800">{userData.role}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Department</p>
                              <p className="font-medium text-gray-800">{userData.department}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Join Date</p>
                              <p className="font-medium text-gray-800">{formatDate(userData.joinDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Favorite AI Assistants</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {favoriteAssistants.map(assistant => (
                      <div key={assistant.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg mr-4">
                            {assistant.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{assistant.name}</h4>
                            <p className="text-sm text-gray-500">
                              Used {assistant.usageCount} times · Last used {formatTimeAgo(assistant.lastUsed)}
                            </p>
                          </div>
                          
                          <button className="text-blue-600 hover:text-blue-800">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Activity Section */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Recent Activity</h3>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {recentActivities.map(activity => (
                      <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex">
                          <div className="mr-4 mt-0.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-gray-800">
                              <span className="font-medium">{activity.action}</span> {activity.item}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500">
                                Using {activity.assistant}
                              </span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-sm text-gray-500">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Usage Statistics</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-700 mb-1">AI Sessions</h4>
                        <p className="text-2xl font-bold text-blue-800">187</p>
                        <p className="text-xs text-blue-600 mt-1">This month</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-purple-700 mb-1">Content Created</h4>
                        <p className="text-2xl font-bold text-purple-800">42</p>
                        <p className="text-xs text-purple-600 mt-1">This month</p>
                      </div>
                      
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-emerald-700 mb-1">Lead Reports</h4>
                        <p className="text-2xl font-bold text-emerald-800">16</p>
                        <p className="text-xs text-emerald-600 mt-1">This month</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Most Used Assistants</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Enterprise Content Studio</span>
                            <span className="text-sm font-medium text-gray-700">42%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">LinkedIn Engagement Pro</span>
                            <span className="text-sm font-medium text-gray-700">27%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '27%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Market Insights Hub</span>
                            <span className="text-sm font-medium text-gray-700">18%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Preferences Section */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Notification Preferences</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Email Notifications</h4>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.notifications.email} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Browser Notifications</h4>
                          <p className="text-sm text-gray-500">Show desktop notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.notifications.browser} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Report Completion</h4>
                          <p className="text-sm text-gray-500">Get notified when reports are ready</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.notifications.reports} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">System Updates</h4>
                          <p className="text-sm text-gray-500">Get notified about system changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.notifications.system} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">AI Settings</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default AI Assistant</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option selected={preferences.aiSettings.defaultAssistant === 'Enterprise Content Studio'}>Enterprise Content Studio</option>
                          <option selected={preferences.aiSettings.defaultAssistant === 'LinkedIn Engagement Pro'}>LinkedIn Engagement Pro</option>
                          <option selected={preferences.aiSettings.defaultAssistant === 'Market Insights Hub'}>Market Insights Hub</option>
                          <option selected={preferences.aiSettings.defaultAssistant === 'Success Story Engine'}>Success Story Engine</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Approval Process</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="manual" selected={preferences.aiSettings.contentApproval === 'manual'}>Manual Approval</option>
                          <option value="auto" selected={preferences.aiSettings.contentApproval === 'auto'}>Auto Approval</option>
                          <option value="review" selected={preferences.aiSettings.contentApproval === 'review'}>Team Review</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <h4 className="font-medium text-gray-800">Auto-save AI Sessions</h4>
                          <p className="text-sm text-gray-500">Automatically save all AI interactions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.aiSettings.autoSave} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">Data Collection</h4>
                          <p className="text-sm text-gray-500">Allow data collection to improve AI performance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={preferences.aiSettings.dataCollection} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Section */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Account Security</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <h4 className="font-medium text-gray-800 mb-4">Password</h4>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Last updated: 45 days ago</p>
                          <p className="text-sm text-gray-500">It's recommended to change your password every 90 days.</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center">
                          <Lock size={16} className="mr-2" />
                          Change Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                        <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Not Enabled</span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-sm text-gray-500">Protect your account with an extra layer of security by requiring a one-time code in addition to your password when signing in.</p>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center">
                          <Shield size={16} className="mr-2" />
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">Active Sessions</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-start justify-between p-4 border border-gray-100 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Current Session</p>
                            <p className="text-sm text-gray-500">Windows 11 · Chrome · Raleigh, NC</p>
                            <p className="text-xs text-green-600 mt-1">Active now</p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <ExternalLink size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-start justify-between p-4 border border-gray-100 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Mobile App</p>
                            <p className="text-sm text-gray-500">iOS 16 · iPhone · Raleigh, NC</p>
                            <p className="text-xs text-gray-500 mt-1">Last active 3 hours ago</p>
                          </div>
                          <button className="text-red-500 hover:text-red-700 font-medium text-sm">
                            Sign out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">API Access</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-800">Personal Access Tokens</h4>
                        <p className="text-sm text-gray-500">Create tokens to access the API programmatically</p>
                      </div>
                      <button className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                        Create Token
                      </button>
                    </div>
                    
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                      <p className="text-gray-500">No active API tokens</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;