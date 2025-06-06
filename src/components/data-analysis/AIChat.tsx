import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, X, Maximize2, Minimize2, ChevronDown, ChevronUp, FileText, Key, Check, Settings, Info, Copy, MessageSquare } from 'lucide-react';
import { analyzeDataWithGemini, isAPIKeyConfigured } from '../../utils/gemini';
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
      content: 'I\'m your AI data analyst powered by Google Gemini 2.5 Pro - the latest and most advanced AI model with superior reasoning capabilities. Upload your data and ask me anything about it - I can provide sophisticated analysis, identify complex patterns, and deliver executive-ready insights with advanced thinking capabilities.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isKeyConfigured, setIsKeyConfigured] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro-preview-06-05');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [largeDataWarning, setLargeDataWarning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Available models - optimized for large dataset analysis
  const models = [
    { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro', description: 'Latest and most advanced model for superior data analysis (Recommended)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Powerful model for complex data analysis and insights' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Fast and cost-effective for quick analyses' }
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
    // Only auto-scroll if we're not streaming or if user is near bottom
    if (!isStreaming) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Smooth scroll while streaming, but keep content in view
    if (isStreaming && streamingContent) {
      const chatContainer = messagesEndRef.current?.parentElement?.parentElement;
      if (chatContainer) {
        const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 100;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }
  }, [streamingContent, isStreaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
      // Start streaming
      setIsStreaming(true);
      setStreamingContent('');
      
      // Add placeholder message for streaming
      const placeholderMessage: ChatMessage = {
        role: 'assistant',
        content: ''
      };
      setMessages(prevMessages => [...prevMessages, placeholderMessage]);
      const messageIndex = messages.length + 1; // Account for user message already added
      
      // Call Gemini API with selected model
      const response = await analyzeDataWithGemini(userMessages, csvData, headers, selectedModel);
      
      if (response) {
        // Simulate streaming by chunking the response
        const words = response.split(' ');
        const chunkSize = 3; // Words per chunk
        let currentContent = '';
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
          currentContent += chunk;
          
          // Update the message content as it streams
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            if (newMessages[messageIndex]) {
              newMessages[messageIndex].content = currentContent.trim();
            }
            return newMessages;
          });
          
          setStreamingContent(currentContent);
          
          // Add a small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      setIsStreaming(false);
      setStreamingContent('');
    } catch (error: any) {
      let msg = 'Sorry, an error occurred while analyzing your data.';
      if (error?.message?.includes('network')) {
        msg = 'Network error: Please check your internet connection.';
      } else if (error?.message?.includes('API key')) {
        msg = 'Gemini API key error: Please check your API key.';
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

  // Generate intelligent suggested prompts based on actual data columns
  const generateSuggestedPrompts = (headers: string[] | null): string[] => {
    if (!headers || headers.length === 0) {
      return [
        "Analyze trends and patterns in my data",
        "What are the key insights from this dataset?",
        "Show me correlations between different metrics",
        "Identify outliers and anomalies in the data"
      ];
    }

    const suggestions: string[] = [];
    const headerLower = headers.map(h => h.toLowerCase());
    
    // Date/time analysis
    const dateColumns = headerLower.filter(h => 
      h.includes('date') || h.includes('time') || h.includes('month') || 
      h.includes('year') || h.includes('day') || h.includes('created')
    );
    if (dateColumns.length > 0) {
      suggestions.push(`Analyze trends over time using the ${headers[headerLower.indexOf(dateColumns[0])]} column`);
    }

    // Sales/revenue analysis
    const salesColumns = headerLower.filter(h => 
      h.includes('sales') || h.includes('revenue') || h.includes('amount') || 
      h.includes('price') || h.includes('value') || h.includes('total')
    );
    if (salesColumns.length > 0) {
      suggestions.push(`What drives the highest ${headers[headerLower.indexOf(salesColumns[0])]} performance?`);
    }

    // Product/item analysis
    const productColumns = headerLower.filter(h => 
      h.includes('product') || h.includes('item') || h.includes('service') || 
      h.includes('category') || h.includes('type') || h.includes('name')
    );
    if (productColumns.length > 0) {
      suggestions.push(`Show me the top performing ${headers[headerLower.indexOf(productColumns[0])]} categories`);
    }

    // Geographic analysis
    const geoColumns = headerLower.filter(h => 
      h.includes('region') || h.includes('state') || h.includes('country') || 
      h.includes('city') || h.includes('location') || h.includes('territory')
    );
    if (geoColumns.length > 0) {
      suggestions.push(`Breakdown performance by ${headers[headerLower.indexOf(geoColumns[0])]} with percentages`);
    }

    // Customer analysis
    const customerColumns = headerLower.filter(h => 
      h.includes('customer') || h.includes('client') || h.includes('user') || 
      h.includes('segment') || h.includes('demographic')
    );
    if (customerColumns.length > 0) {
      suggestions.push(`Which ${headers[headerLower.indexOf(customerColumns[0])]} segments generate the most value?`);
    }

    // Marketing/channel analysis
    const marketingColumns = headerLower.filter(h => 
      h.includes('channel') || h.includes('source') || h.includes('campaign') || 
      h.includes('marketing') || h.includes('medium') || h.includes('utm')
    );
    if (marketingColumns.length > 0) {
      suggestions.push(`Analyze the effectiveness of different ${headers[headerLower.indexOf(marketingColumns[0])]} options`);
    }

    // Correlation analysis
    const numericColumns = headers.filter((h, i) => {
      const lowerH = headerLower[i];
      return lowerH.includes('amount') || lowerH.includes('count') || lowerH.includes('rate') ||
             lowerH.includes('score') || lowerH.includes('percent') || lowerH.includes('number') ||
             lowerH.includes('quantity') || lowerH.includes('value') || lowerH.includes('sales') ||
             lowerH.includes('revenue') || lowerH.includes('cost') || lowerH.includes('price');
    });
    if (numericColumns.length >= 2) {
      suggestions.push(`What correlations exist between ${numericColumns[0]} and ${numericColumns[1]}?`);
    }

    // Performance analysis
    if (suggestions.length < 6) {
      suggestions.push("Identify the key factors driving performance in this dataset");
      suggestions.push("What patterns and anomalies should I be aware of?");
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  const suggestedPrompts = generateSuggestedPrompts(headers);

  // Custom renderer for markdown content with better table styling
  const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
      <div className="markdown-content ai-response prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            table: ({ children }) => (
              <div className="table-wrapper overflow-x-auto my-4">
                <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="bg-white divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                {children}
              </td>
            ),
          }}
        >
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
          <div className={`overflow-y-auto p-4 bg-gray-50 ${isExpanded ? 'h-[calc(650px-180px)]' : 'h-[calc(100vh-350px)] min-h-[600px]'}`}>
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