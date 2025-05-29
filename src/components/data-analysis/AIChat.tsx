import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, X, Maximize2, Minimize2, ChevronDown, ChevronUp, FileText, Key, Check, Settings, Info } from 'lucide-react';
import { analyzeDataWithGPT, isAPIKeyConfigured } from '../../utils/openai';
import ReactMarkdown from 'react-markdown';

interface AIChatProps {
  csvData: any[] | null;
  headers: string[] | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onRequestAPIKey: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ 
  csvData, 
  headers, 
  isMinimized, 
  onToggleMinimize, 
  onRequestAPIKey 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'I\'m your AI data analyst powered by o3-mini. Upload your data and ask me anything about it - I can help identify trends, analyze patterns, and provide meaningful insights tailored for executives and sales leaders.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [selectedModel, setSelectedModel] = useState('o3-mini-2025-01-31');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available models
  const models = [
    { id: 'o3-mini-2025-01-31', name: 'o3-mini (2025-01-31)', description: 'Faster, more efficient model for business analyses' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Powerful model with comprehensive business analysis capabilities' }
  ];

  // Check if API key is configured
  useEffect(() => {
    const checkAPIKey = async () => {
      setIsCheckingKey(true);
      const hasKey = await isAPIKeyConfigured();
      console.log('API key configured:', hasKey);
      setIsKeyConfigured(hasKey);
      setIsCheckingKey(false);
    };
    
    checkAPIKey();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !csvData || !headers) return;

    if (!isKeyConfigured) {
      onRequestAPIKey();
      return;
    }

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Store all messages except system messages for context
    const userMessages = messages
      .filter(msg => msg.role !== 'system')
      .concat(userMessage);

    try {
      console.log('Analyzing data with model:', selectedModel);
      
      // Call OpenAI API with selected model
      const response = await analyzeDataWithGPT(userMessages, csvData, headers, selectedModel);
      
      if (response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: 'Sorry, I encountered an error while analyzing your data. Please check your API key or try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };

  // Define suggested prompts specifically for sales & marketing executives
  const suggestedPrompts = [
    "Analyze sales trends over time and identify patterns",
    "What are our top-selling products/services and why?",
    "Which customer segments generate the most revenue?",
    "Identify our best-performing marketing channels",
    "Show me a breakdown of sales by region with percentages",
    "What correlations exist between marketing spend and sales?"
  ];

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

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed bottom-4 right-4 left-4 lg:left-auto lg:right-4 lg:w-[600px] h-[650px] z-50' : ''
    }`}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="mr-2" size={20} />
          <h3 className="font-bold">Executive Data Analyst ({models.find(m => m.id === selectedModel)?.name})</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleModelSelector}
            className="p-1 hover:bg-white/20 rounded flex items-center text-sm"
            title="Change AI model"
          >
            <Settings size={16} className="mr-1" />
            Model
          </button>
          {!isKeyConfigured && !isCheckingKey ? (
            <button 
              onClick={onRequestAPIKey}
              className="p-1 hover:bg-white/20 rounded flex items-center text-sm"
            >
              <Key size={16} className="mr-1" />
              Connect API
            </button>
          ) : isKeyConfigured && (
            <button 
              className="p-1 hover:bg-white/20 rounded flex items-center text-sm bg-green-600/40"
            >
              <Check size={16} className="mr-1" />
              API Connected
            </button>
          )}
          <button 
            onClick={toggleExpanded}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={onToggleMinimize}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Model selector dropdown */}
      {showModelSelector && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select AI Model:</h4>
          <div className="space-y-2">
            {models.map(model => (
              <div 
                key={model.id}
                onClick={() => {
                  setSelectedModel(model.id);
                  setShowModelSelector(false);
                }}
                className={`flex items-start p-3 rounded-lg cursor-pointer ${
                  selectedModel === model.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-full ${
                  selectedModel === model.id ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {selectedModel === model.id ? (
                    <Check size={14} className="text-white" />
                  ) : (
                    <div className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="ml-3">
                  <h5 className={`font-medium ${
                    selectedModel === model.id ? 'text-blue-700' : 'text-gray-800'
                  }`}>{model.name}</h5>
                  <p className="text-xs text-gray-500">{model.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isMinimized && (
        <>
          <div className={`overflow-y-auto p-4 bg-gray-50 ${isExpanded ? 'h-[calc(650px-180px)]' : 'h-80'}`}>
            <div className="space-y-4">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-lg px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center mb-1">
                        <Bot size={14} className="mr-1 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Executive Data Analyst</span>
                      </div>
                    )}
                    
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-lg px-4 py-3 bg-white border border-gray-200">
                    <div className="flex items-center">
                      <Loader2 size={16} className="mr-2 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-600">Analyzing your business data...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {!csvData || csvData.length === 0 ? (
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="text-center py-4">
                <FileText size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 font-medium">Upload CSV data first</p>
                <p className="text-sm text-gray-500">Upload your sales, marketing or operations data to start analyzing</p>
              </div>
            </div>
          ) : !isKeyConfigured && !isCheckingKey ? (
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="text-center py-4">
                <Key size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600 font-medium">OpenAI API key required</p>
                <button 
                  onClick={onRequestAPIKey}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                >
                  <Key size={16} className="mr-2" />
                  Connect OpenAI API Key
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Suggested prompts specifically for executives */}
              {messages.length <= 3 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white">
                  <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInput(prompt);
                        }}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chat input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about sales, marketing, or operational insights..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading || isCheckingKey}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isCheckingKey}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      !input.trim() || isLoading || isCheckingKey
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AIChat;