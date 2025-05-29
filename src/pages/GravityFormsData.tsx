import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { AlertTriangle, Database, RefreshCw, ExternalLink, Key, CheckCircle, Code, Bot, Send, Loader2, FileText, MessageCircle, Info, X, Link } from 'lucide-react';
import { analyzeDataWithGPT, isAPIKeyConfigured } from '../utils/openai';
import ReactMarkdown from 'react-markdown';
import ErrorBoundary from '../components/ErrorBoundary';

const GravityFormsData: React.FC = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  
  // AI Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    // Check if OpenAI API key is configured
    const checkApiKey = async () => {
      const hasKey = await isAPIKeyConfigured();
      setHasApiKey(hasKey);
    };
    
    checkApiKey();
    // Fetch forms on component mount
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log('Fetching Gravity Forms data');
      
      // Routes are mounted at the root level
      const response = await fetch('/gravity-forms');
      console.log('Gravity Forms API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API returned status ${response.status}${errorData ? `: ${errorData.error || 'Unknown error'}` : ''}`);
      }
      
      const data = await response.json();
      console.log('Gravity Forms API response data:', data);
      
      if (data.error) {
        setError(data.error);
        setErrorDetails(data);
        setForms([]);
      } else if (Array.isArray(data)) {
        setForms(data);
        setConnectionSuccess(true);
      } else {
        setError('Unexpected response format');
        setForms([]);
      }
    } catch (error: any) {
      console.error('Error fetching forms:', error);
      setError(`Failed to connect to the Gravity Forms API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (formId: string) => {
    setLoading(true);
    setSelectedForm(formId);
    setEntries([]);
    
    try {
      // Routes are mounted at the root level
      const response = await fetch(`/gravity-forms/${formId}/entries`);
      console.log(`Entries API response status for form ${formId}:`, response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API returned status ${response.status}${errorData ? `: ${errorData.error || 'Unknown error'}` : ''}`);
      }
      
      const data = await response.json();
      console.log(`Entries API response data for form ${formId}:`, data);
      
      if (data.error) {
        setError(data.error);
        setEntries([]);
        return [];
      } else if (Array.isArray(data)) {
        setEntries(data);
        return data;
      } else if (data.entries && Array.isArray(data.entries)) {
        // Handle case where entries might be nested under an 'entries' property
        setEntries(data.entries);
        return data.entries;
      } else {
        setError('Unexpected response format for entries');
        return [];
      }
    } catch (error: any) {
      console.error(`Error fetching entries for form ${formId}:`, error);
      setError(`Failed to fetch entries for form ${formId}: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Custom renderer for markdown content with better table styling
  const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
      <div className="markdown-content prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-table:my-2">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isAiLoading || !entries.length) return;
    
    // Add user message
    const userMessage = { role: 'user' as const, content: chatMessage };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsAiLoading(true);
    setAiError(null);
    
    try {
      // Call OpenAI
      const context = `The data is from a Gravity Form named "${forms.find(f => f.id === selectedForm)?.title || 'Unknown Form'}" with ${entries.length} entries.`;
      const messages = [
        ...chatHistory,
        userMessage
      ];
      
      const response = await analyzeDataWithGPT(messages, entries, Object.keys(entries[0] || {}), 'o3-mini-2025-01-31');
      
      if (response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setAiError('Failed to analyze data. Please check your API key and try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Layout title="Gravity Forms Data">
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Database className="mr-2" size={24} />
                  Gravity Forms Data Integration
                </h2>
                <p className="text-gray-600 mt-1">
                  View and analyze data from your WordPress Gravity Forms
                </p>
                {connectionSuccess && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <CheckCircle size={14} className="mr-1" />
                    Connected to WordPress API
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={fetchForms}
                  className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Refresh Data
                </button>
                
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="flex items-center py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  disabled={!selectedForm || entries.length === 0}
                >
                  <Bot size={18} className="mr-2" />
                  {chatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
                </button>
                
                <a 
                  href="https://docs.gravityforms.com/rest-api-v2/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  <ExternalLink size={18} className="mr-2" />
                  API Docs
                </a>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertTriangle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-red-800">Connection Error</h3>
                <p className="text-red-700">{error}</p>
                {errorDetails && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer text-red-600 font-medium">View technical details</summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(errorDetails, null, 2)}
                    </pre>
                  </details>
                )}
                <div className="mt-3">
                  <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                    <p className="font-medium">Troubleshooting Steps:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Verify your WordPress API URL in the .env file</li>
                      <li>Check that your Consumer Key and Consumer Secret are valid</li>
                      <li>Ensure Gravity Forms REST API v2 is enabled in WordPress</li>
                      <li>Verify WordPress server can be reached from this application server</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Forms List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Available Forms</h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
                    <p className="text-gray-500 ml-3">Loading forms...</p>
                  </div>
                ) : forms.length === 0 ? (
                  <div className="text-center py-6">
                    <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      No forms found
                    </p>
                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      Check your API connection or refresh
                    </p>
                    <button 
                      onClick={fetchForms}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                    >
                      <RefreshCw size={14} className="mr-1.5" />
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forms.map((form) => (
                      <div 
                        key={form.id}
                        onClick={() => fetchEntries(form.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedForm === form.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{form.title}</h4>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {form.entry_count || 0} entries
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Entries or AI Chat */}
            <div className="lg:col-span-3">
              {!selectedForm ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Select a form to view entries</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Choose a form from the list to view its entries and analyze the data with AI
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading form entries...</p>
                  </div>
                </div>
              ) : entries.length === 0 ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No entries found</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-4">
                      This form doesn't have any entries yet
                    </p>
                    <button 
                      onClick={() => fetchEntries(selectedForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                    >
                      <RefreshCw size={14} className="mr-1.5" />
                      Refresh Entries
                    </button>
                  </div>
                </div>
              ) : chatOpen ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold flex items-center">
                        <Bot className="mr-2" size={20} />
                        AI Form Analyst
                      </h3>
                      <button 
                        onClick={() => setChatOpen(false)}
                        className="p-1 hover:bg-white/20 rounded text-white"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Bot size={36} className="mb-2 text-gray-300" />
                        <p>Ask me about the form data! I can help analyze entries, identify patterns, and extract insights.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chatHistory.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-3/4 rounded-lg px-4 py-3 ${
                              msg.role === 'user' 
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-800'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <MarkdownRenderer content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-line">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {isAiLoading && (
                          <div className="flex justify-start">
                            <div className="max-w-3/4 rounded-lg px-4 py-3 bg-white border border-gray-200">
                              <div className="flex items-center">
                                <Loader2 size={16} className="mr-2 text-purple-600 animate-spin" />
                                <span className="text-sm text-gray-600">Analyzing form data...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {aiError && (
                    <div className="px-4 py-3 bg-red-50 border-t border-red-200 flex items-center">
                      <AlertTriangle size={16} className="text-red-500 mr-2" />
                      <p className="text-sm text-red-600">{aiError}</p>
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-gray-100">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Ask about the form data (e.g., 'Summarize the entries')"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!chatMessage.trim() || isAiLoading}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          !chatMessage.trim() || isAiLoading
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entry ID
                          </th>
                          {entries.length > 0 && Object.keys(entries[0]).filter(key => key !== 'id' && key !== 'form_id').map(key => (
                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {entries.map(entry => (
                          <tr key={entry.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {entry.id}
                            </td>
                            {Object.keys(entry).filter(key => key !== 'id' && key !== 'form_id').map(key => (
                              <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {typeof entry[key] === 'object' ? JSON.stringify(entry[key]) : String(entry[key] || '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Showing <span className="font-medium">{entries.length}</span> entries
                    </span>
                    
                    <button
                      onClick={() => setChatOpen(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center"
                    >
                      <Bot size={18} className="mr-2" />
                      Analyze with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default GravityFormsData;