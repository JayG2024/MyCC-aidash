import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import DataUpload from '../components/data-analysis/DataUpload';
import DataTable from '../components/data-analysis/DataTable';
import AIChat from '../components/data-analysis/AIChat';
import DatasetLibrary from '../components/data-analysis/DatasetLibrary';
import SaveToLibraryModal from '../components/data-analysis/SaveToLibraryModal';
import APIKeyModal from '../components/data-analysis/APIKeyModal';
import { saveCSVData, loadCSVData, saveChatHistory, loadChatHistory, StoredCSVData } from '../utils/localStorage';
import { isAPIKeyConfigured, clearGeminiApiKey } from '../utils/gemini';
import { FileDown, FileUp, Database, Brain, Trash2, AlertTriangle, BookOpen, Key, Info, FileText, Check } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

const DataAnalysis: React.FC = () => {
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [headers, setHeaders] = useState<string[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<{ rows: number, columns: number } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        const savedData = await loadCSVData();
        if (savedData) {
          setCsvData(savedData.data);
          setHeaders(savedData.headers);
          setFileName(savedData.fileName);
          setDatasetInfo({
            rows: savedData.data.length,
            columns: savedData.headers.length
          });
          
          // Show warning if data is older than 24 hours
          const isOld = Date.now() - savedData.timestamp > 24 * 60 * 60 * 1000;
          setShowWarning(isOld);
        }
        
        // Check if API key is configured (includes checking for default key)
        const hasKey = await isAPIKeyConfigured();
        console.log("API key configured:", hasKey);
        setHasApiKey(hasKey);
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  const handleDataParsed = async (data: any[], headers: string[], originalFileName?: string) => {
    setCsvData(data);
    setHeaders(headers);
    setFileName(originalFileName || 'Uploaded File');
    setShowWarning(false);
    setUploadSuccess(true);
    setDatasetInfo({
      rows: data.length,
      columns: headers.length
    });
    
    // Clear success message after 3 seconds
    setTimeout(() => setUploadSuccess(false), 3000);
    
    try {
      await saveCSVData(data, headers, originalFileName || 'Uploaded File');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        setCsvData(null);
        setHeaders(null);
        setFileName(null);
        setDatasetInfo(null);
        await saveCSVData([], [], '');
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };
  
  const handleSelectDataset = (dataset: StoredCSVData) => {
    setCsvData(dataset.data);
    setHeaders(dataset.headers);
    setFileName(dataset.fileName);
    setShowWarning(false);
    setIsLibraryOpen(false);
    setDatasetInfo({
      rows: dataset.data.length,
      columns: dataset.headers.length
    });
    
    // Also save as current dataset
    saveCSVData(dataset.data, dataset.headers, dataset.fileName);
  };

  const handleSaveToLibrary = () => {
    if (csvData && headers) {
      setIsSaveModalOpen(true);
    }
  };
  
  const handleSaveComplete = (id: string) => {
    setIsSaveModalOpen(false);
    // Optionally show a success message
  };
  
  const handleOpenApiKeyModal = () => {
    setIsApiKeyModalOpen(true);
  };
  
  const handleApiKeySuccess = () => {
    setIsApiKeyModalOpen(false);
    setHasApiKey(true);
    // Make sure the chat is visible when API key is successfully added
    setIsChatMinimized(false);
  };
  
  const handleClearApiKey = async () => {
    if (window.confirm('Are you sure you want to remove your custom Gemini API key? The system will fall back to using the demo key with limited functionality.')) {
      await clearGeminiApiKey();
      // We should still have the default key available
      setHasApiKey(true);
    }
  };

  return (
    <Layout title="Data Analytics Dashboard">
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Database className="mr-3" size={28} />
                  Data Analytics Dashboard
                </h2>
                <p className="text-gray-600 mt-1">
                  Upload massive spreadsheets, ask natural language questions, and get instant AI-powered business insights
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {hasApiKey ? (
                  <button
                    onClick={handleClearApiKey}
                    className="flex items-center py-2 px-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                  >
                    <Key size={18} className="mr-2" />
                    API Connected
                  </button>
                ) : (
                  <button
                    onClick={handleOpenApiKeyModal}
                    className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Key size={18} className="mr-2" />
                    Connect Gemini AI
                  </button>
                )}
                {csvData && csvData.length > 0 && (
                  <button
                    onClick={handleClearData}
                    className="flex items-center py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Clear Data
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Success notification */}
          {uploadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
              <Check className="text-green-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-green-800">Upload Successful!</h3>
                <p className="text-green-700 text-sm">
                  Your data has been processed and is ready for analysis. The table and AI assistant are now available.
                </p>
              </div>
            </div>
          )}

          {/* Warning for old data */}
          {showWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
              <AlertTriangle className="text-amber-500 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-amber-800">Using cached data</h3>
                <p className="text-amber-700 text-sm">
                  You're viewing data that was uploaded more than 24 hours ago. 
                  For the most accurate analysis, consider uploading fresh data.
                </p>
              </div>
            </div>
          )}

          {/* Main content - Two row layout */}
          <div className="space-y-6">
            {/* Top Row - Upload and AI Chat side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Side - Upload and Stats */}
              <div className="space-y-6">
                <div id="upload-section">
                  <DataUpload 
                    onDataParsed={handleDataParsed} 
                    onBrowseLibrary={() => setIsLibraryOpen(true)}
                    onSaveToLibrary={handleSaveToLibrary}
                    hasActiveData={!!csvData && csvData.length > 0}
                  />
                </div>
                
                {csvData && csvData.length > 0 && datasetInfo && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FileText size={18} className="mr-2 text-blue-600" />
                      Dataset Overview
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 uppercase font-semibold">Records</p>
                        <p className="text-xl font-bold text-blue-800">{datasetInfo.rows.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs text-indigo-600 uppercase font-semibold">Fields</p>
                        <p className="text-xl font-bold text-indigo-800">{datasetInfo.columns}</p>
                      </div>
                    </div>
                    
                    {headers && headers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Available Metrics</p>
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                          {headers.map((header, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                            >
                              {header}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-600">
                        <Info size={14} className="mr-1 text-blue-500" />
                        {datasetInfo.rows > 10000 ? (
                          <span>Large dataset will be processed in chunks for optimal performance</span>
                        ) : (
                          <span>Dataset size is optimal for AI analysis</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - AI Chat */}
              <div id="chat-section" className="h-fit">
                <AIChat 
                  csvData={csvData} 
                  headers={headers} 
                  isMinimized={false} // Always show expanded in this layout
                  onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
                  onRequestAPIKey={handleOpenApiKeyModal}
                />
              </div>
            </div>

            {/* Bottom Row - Data Table (full width) */}
            <div id="table-section">
              {isLoading ? (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading saved data...</p>
                  </div>
                </div>
              ) : csvData && csvData.length > 0 && headers && headers.length > 0 ? (
                <DataTable data={csvData} headers={headers} />
              ) : (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <FileUp size={48} className="mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Ready for Data Analysis</h3>
                    <p className="text-gray-500 mb-6">Upload your spreadsheets above to start analyzing with AI</p>
                    <button 
                      onClick={() => setIsLibraryOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                    >
                      <BookOpen size={18} className="mr-2" />
                      Browse Saved Datasets
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Dataset Library Modal */}
          {isLibraryOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-5xl">
                <DatasetLibrary 
                  onSelectDataset={handleSelectDataset}
                  onClose={() => setIsLibraryOpen(false)}
                />
              </div>
            </div>
          )}
          
          {/* Save to Library Modal */}
          {isSaveModalOpen && csvData && headers && (
            <SaveToLibraryModal
              data={csvData}
              headers={headers}
              fileName={fileName || 'Untitled Dataset'}
              onClose={() => setIsSaveModalOpen(false)}
              onSave={handleSaveComplete}
            />
          )}
          
          {/* API Key Modal */}
          {isApiKeyModalOpen && (
            <APIKeyModal
              onClose={() => setIsApiKeyModalOpen(false)}
              onSuccess={handleApiKeySuccess}
            />
          )}
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default DataAnalysis;