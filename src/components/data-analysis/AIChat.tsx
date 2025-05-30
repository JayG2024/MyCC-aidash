import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, X, Maximize2, Minimize2, ChevronDown, ChevronUp, FileText, Key, Check, Settings, Info, Copy, MessageSquare } from 'lucide-react';
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
      content: 'I\'m your AI data analyst powered by GPT-4o. Upload your data and ask me anything about it - I can help identify trends, analyze patterns, and provide meaningful insights tailored for executives and sales leaders.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [largeDataWarning, setLargeDataWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Available models - optimized for large dataset analysis
  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective for most business analyses (Recommended)' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model for complex data analysis and insights' }
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
    if (csvData && csvData.length > 100000) {
      setLargeDataWarning(true);
    } else {
      setLargeDataWarning(false);
    }
  }, [csvData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyContent = (index: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
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
    setErrorMessage(null);

    // Store all messages except system messages for context
    const userMessages = messages
      .filter(msg => msg.role !== 'system')
      .concat(userMessage);

    try {
      // Defensive: warn if data is huge
      if (csvData.length > 200000) {
        setErrorMessage('Warning: This is a very large dataset. Analysis may be slow or may fail due to browser memory limits.');
      }
      // Call OpenAI API with selected model
      const response = await analyzeDataWithGPT(userMessages, csvData, headers, selectedModel);
      if (response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
    } catch (error: any) {
      let msg = 'Sorry, an error occurred while analyzing your data.';
      if (error?.message?.includes('network')) {
        msg = 'Network error: Please check your internet connection.';
      } else if (error?.message?.includes('API key')) {
        msg = 'OpenAI API key error: Please check your API key.';
      } else if (error?.message?.toLowerCase().includes('memory')) {
        msg = 'Memory error: The dataset may be too large for your browser. Try a smaller file.';
      } else if (typeof error?.message === 'string') {
        msg = error.message;
      }
      setErrorMessage(msg);
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: msg }
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
      <div className="markdown-content ai-response">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'fixed bottom-4 right-4 left-4 lg:left-auto lg:right-4 lg:w-[600px] h-[650px] z-50' : ''
    }`}>
      {/* Error alert */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center justify-between text-sm">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}
      {/* Large data warning */}
      {largeDataWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 text-xs flex items-center">
          <Info size={14} className="mr-2" />
          Large dataset detected ({csvData?.length.toLocaleString()} rows). Analysis may take longer and use more memory.
        </div>
      )}

      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Bot className="mr-2" size={20} />
          <h3 className="font-bold">Executive Data Analyst ({models.find(m => m.id === selectedModel)?.name})</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleModelSelector}
            className="p-1.5 hover:bg-white/20 rounded flex items-center text-xs font-medium"
            title="Change AI model"
          >
            <Settings size={14} className="mr-1" />
            Model
          </button>
          {!isKeyConfigured && !isCheckingKey ? (
            <button 
              onClick={onRequestAPIKey}
              className="p-1.5 hover:bg-white/20 rounded flex items-center text-xs font-medium"
            >
              <Key size={14} className="mr-1" />
              Connect API
            </button>
          ) : isKeyConfigured && (
            <button 
              className="p-1.5 hover:bg-white/20 rounded flex items-center text-xs font-medium bg-green-600/40"
            >
              <Check size={14} className="mr-1" />
              API Connected
            </button>
          )}
          <button 
            onClick={toggleExpanded}
            className="p-1.5 hover:bg-white/20 rounded"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button 
            onClick={onToggleMinimize}
            className="p-1.5 hover:bg-white/20 rounded"
          >
            {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Model selector dropdown */}
      {showModelSelector && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
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
          <div className={`overflow-y-auto p-4 bg-gray-50 ${isExpanded ? 'h-[calc(650px-180px)]' : 'h-[400px]'}`}>
            <div className="space-y-4">
              {messages.filter(m => m.role !== 'system').map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-lg px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Bot size={14} className="mr-1 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">AI Analyst</span>
                        </div>
                        
                        {/* Copy button for assistant messages */}
                        <button
                          onClick={() => handleCopyContent(index, message.content)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
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
                  <div className="max-w-[90%] rounded-lg px-4 py-3 bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-2">
                      <Bot size={14} className="mr-1 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">AI Analyst</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      <span className="ml-3 text-sm text-gray-600">Analyzing your business data...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add welcome message when no messages */}
              {messages.length === 1 && messages[0].role === 'assistant' && !isLoading && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Welcome to AI Data Analysis</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    I'm your AI data analyst assistant. I can help you analyze sales, marketing, and operations data to uncover business insights.
                  </p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {!csvData || csvData.length === 0 ? (
            <div className="p-5 border-t border-gray-200 bg-white">
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <FileText size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-700 font-medium">Upload data to begin</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  Upload CSV data containing sales, marketing, or operations metrics to start analyzing
                </p>
              </div>
            </div>
          ) : !isKeyConfigured && !isCheckingKey ? (
            <div className="p-5 border-t border-gray-200 bg-white">
              <div className="text-center py-6 bg-blue-50 rounded-xl border border-dashed border-blue-200">
                <Key size={32} className="mx-auto mb-3 text-blue-500" />
                <p className="text-blue-700 font-medium">OpenAI API key required</p>
                <button 
                  onClick={onRequestAPIKey}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
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
                <div className="px-5 py-3 border-t border-gray-200 bg-white">
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
              <form onSubmit={handleSubmit} className="p-5 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about sales, marketing, or operational insights..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder:text-gray-400"
                    disabled={isLoading || isCheckingKey}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isCheckingKey}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                      !input.trim() || isLoading || isCheckingKey
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-all duration-200 shadow-sm min-w-[50px]`}
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