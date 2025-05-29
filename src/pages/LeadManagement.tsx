import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Search, Filter, Plus, FileText, Calendar, ArrowUpDown, SendHorizontal, Bot } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  source: string;
  assignedTo: string;
  lastContactDate: Date;
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Michael Smith',
    email: 'michael.smith@example.com',
    phone: '(555) 123-4567',
    status: 'qualified',
    source: 'Website',
    assignedTo: 'Bruce Ackerman',
    lastContactDate: new Date('2023-06-15')
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 987-6543',
    status: 'new',
    source: 'LinkedIn',
    assignedTo: 'Matthew Neitzel',
    lastContactDate: new Date('2023-06-18')
  },
  {
    id: '3',
    name: 'David Wilson',
    email: 'david.w@example.com',
    phone: '(555) 345-6789',
    status: 'contacted',
    source: 'Referral',
    assignedTo: 'Bruce Ackerman',
    lastContactDate: new Date('2023-06-10')
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    phone: '(555) 567-8901',
    status: 'proposal',
    source: 'Facebook Ad',
    assignedTo: 'Aaron Martin',
    lastContactDate: new Date('2023-06-05')
  },
  {
    id: '5',
    name: 'James Taylor',
    email: 'james.t@example.com',
    phone: '(555) 789-0123',
    status: 'converted',
    source: 'Google Ad',
    assignedTo: 'Alan Kerbel',
    lastContactDate: new Date('2023-05-28')
  }
];

const LeadManagement: React.FC = () => {
  const [leads] = useState<Lead[]>(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'assistant', message: string}>>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new':
        return 'bg-blue-100 text-blue-600';
      case 'contacted':
        return 'bg-purple-100 text-purple-600';
      case 'qualified':
        return 'bg-green-100 text-green-600';
      case 'proposal':
        return 'bg-yellow-100 text-yellow-600';
      case 'converted':
        return 'bg-emerald-100 text-emerald-600';
      case 'lost':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat history
    const newUserMessage = { type: 'user' as const, message: chatMessage };
    setChatHistory([...chatHistory, newUserMessage]);
    
    // Simulate AI response
    setTimeout(() => {
      const assistantResponses = [
        "I've analyzed the data for Michael Smith. He came through our website and has been qualified by Bruce. His last contact was on June 15th. Would you like me to draft a follow-up email?",
        "Sarah Johnson is a new lead from LinkedIn. She hasn't been contacted yet. Based on similar leads, I suggest scheduling an initial call to discuss certification options.",
        "Looking at the data, Emily Brown is at the proposal stage. The data shows leads at this stage have a 65% conversion rate when follow-up occurs within 3 days.",
        "Based on your lead patterns, I notice website leads like Michael Smith tend to convert at a 20% higher rate when provided with certification comparison resources.",
        "I can see James Taylor has already converted. Would you like me to analyze what factors contributed to his successful conversion?"
      ];
      
      const randomResponse = assistantResponses[Math.floor(Math.random() * assistantResponses.length)];
      setChatHistory(prev => [...prev, { type: 'assistant', message: randomResponse }]);
    }, 1000);
    
    setChatMessage('');
  };

  return (
    <Layout title="Website Leads">
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <div className="flex space-x-2 w-full sm:w-auto">
            <button className="flex items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
              <Filter size={18} className="mr-2" />
              Filter
            </button>
            <button className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <Plus size={18} className="mr-2" />
              Add Lead
            </button>
          </div>
        </div>
        
        {/* Leads table */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Name</span>
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Status</span>
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center space-x-1 cursor-pointer">
                      <span>Last Contact</span>
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      <div className="text-gray-500 text-sm">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.assignedTo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {formatDate(lead.lastContactDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1 text-blue-600 hover:text-blue-900" title="Generate Report">
                          <FileText size={18} />
                        </button>
                        <button className="p-1 text-purple-600 hover:text-purple-900" title="Schedule Call">
                          <Calendar size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLeads.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No leads found matching your search criteria.</p>
            </div>
          )}
          
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredLeads.length}</span> of <span className="font-medium">{leads.length}</span> leads
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
        
        {/* ChatGPT Interface */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="text-blue-600 mr-2" size={20} />
              <h3 className="font-bold text-gray-800">Lead Insights Assistant</h3>
            </div>
            <button 
              className="text-sm text-blue-600 font-medium"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              {isChatOpen ? 'Minimize' : 'Expand'}
            </button>
          </div>
          
          {isChatOpen && (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  Ask questions about your leads, get insights, or request help with follow-up strategies.
                </p>
              </div>
              
              {/* Chat History */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Bot size={36} className="mb-2 text-gray-300" />
                    <p>Ask me anything about your leads!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3/4 rounded-lg px-4 py-2 ${
                          chat.type === 'user' 
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          <p>{chat.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about your leads (e.g., 'Which leads need follow-up?')"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors flex items-center"
                >
                  <SendHorizontal size={18} className="mr-2" />
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadManagement;