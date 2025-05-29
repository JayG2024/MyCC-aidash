import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileUp, AlertCircle, Check, Loader2, BookOpen, Save, Info, FileText, X, CloudUpload } from 'lucide-react';

interface DataUploadProps {
  onDataParsed: (data: any[], headers: string[]) => void;
  onBrowseLibrary: () => void;
  onSaveToLibrary: () => void;
  hasActiveData: boolean;
}

const DataUpload: React.FC<DataUploadProps> = ({ 
  onDataParsed, 
  onBrowseLibrary,
  onSaveToLibrary, 
  hasActiveData 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [processingInfo, setProcessingInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showLargeFileWarning, setShowLargeFileWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (file: File) => {
    // Reset states
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError(null);
    setLoading(true);
    setSuccess(false);
    setProgress(0);
    setProcessingInfo(null);
    setShowLargeFileWarning(false);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    // Warning for very large files
    if (file.size > 50 * 1024 * 1024) { // > 50MB
      setShowLargeFileWarning(true);
      setProcessingInfo('Warning: This file is very large and may not process reliably in the browser. Consider splitting it into smaller files if you encounter issues.');
    } else if (file.size > 10 * 1024 * 1024) { // > 10MB
      setProcessingInfo('Large file detected. Processing may take a few moments...');
    }

    // Configure Papa Parse with optimized settings for large files
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      worker: file.size > 5 * 1024 * 1024, // Use worker for files > 5MB
      step: function(results, parser) {
        // Update progress periodically for better UX
        if (results.meta.cursor && file.size) {
          const newProgress = Math.round((results.meta.cursor / file.size) * 100);
          if (newProgress !== progress && newProgress % 5 === 0) {
            setProgress(newProgress);
            setProcessingInfo(`Processing ${newProgress}% complete...`);
          }
        }
      },
      complete: (results) => {
        setLoading(false);
        setProgress(100);

        // Handle parse errors
        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          const errorMessages = results.errors.slice(0, 3).map(e => e.message).join('; ');
          setError(`Error parsing CSV: ${errorMessages}${results.errors.length > 3 ? ' and more...' : ''}`);
          return;
        }

        // Validate data
        const headers = results.meta.fields || [];
        if (headers.length === 0) {
          setError('No data found in the CSV file');
          return;
        }

        // Check for empty data
        if (!results.data || results.data.length === 0) {
          setError('No data rows found in the CSV file. Please check your file and try again.');
          return;
        }

        // Handle large datasets with appropriate user information
        const rowCount = results.data.length;
        if (rowCount > 10000) {
          setProcessingInfo(`Successfully processed ${rowCount.toLocaleString()} rows. AI analysis will process this data in chunks for optimal performance.`);
        } else {
          setProcessingInfo(null);
        }

        setSuccess(true);
        onDataParsed(results.data, headers);
      },
      error: (error) => {
        setLoading(false);
        setError(`Error parsing CSV: ${error.message}`);
        console.error('Papa Parse error:', error);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear the current file and reset states
  const handleClearFile = () => {
    setFileName(null);
    setFileSize(null);
    setError(null);
    setLoading(false);
    setSuccess(false);
    setProgress(0);
    setProcessingInfo(null);
    setShowLargeFileWarning(false);
    // Also clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center">
          <div className="p-2.5 rounded-full bg-blue-100 text-blue-600 mr-3">
            <CloudUpload size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Data Uploader</h3>
        </div>
        {hasActiveData && (
          <button
            onClick={onSaveToLibrary}
            className="flex items-center text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save size={14} className="mr-1.5" />
            Save to Library
          </button>
        )}
      </div>
      
      <div className="p-6">
        {/* Error alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center justify-between text-sm mb-4 rounded-lg">
            <span className="flex items-center">
              <AlertCircle size={16} className="mr-2 flex-shrink-0" />
              {error}
            </span>
            <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700 focus:outline-none">
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Large file warning */}
        {showLargeFileWarning && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm flex items-center mb-4 rounded-lg">
            <Info size={16} className="mr-2 flex-shrink-0" />
            <span>This file is very large. If you experience browser crashes or errors, try splitting the file into smaller parts.</span>
          </div>
        )}
        
        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 shadow-inner' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input 
            type="file" 
            className="hidden"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileInputChange} 
          />
          
          {fileName ? (
            <div className="relative">
              {/* File info */}
              <div className="mb-1">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  {loading ? (
                    <Loader2 size={28} className="text-blue-600 animate-spin" />
                  ) : success ? (
                    <Check size={28} className="text-green-600" />
                  ) : (
                    <FileText size={28} className="text-blue-600" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-medium text-gray-800 text-lg mb-1">{fileName}</p>
                  <p className="text-sm text-gray-500">{fileSize}</p>
                </div>
              </div>
              
              {/* Clear button */}
              {!loading && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="absolute top-0 right-0 p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none"
                  title="Clear file"
                >
                  <X size={16} />
                </button>
              )}
              
              {/* Success message */}
              {success && (
                <div className="mt-3">
                  <p className="text-sm text-green-600 flex items-center justify-center">
                    <Check size={16} className="mr-1" />
                    File processed successfully!
                  </p>
                </div>
              )}
              
              {/* Progress indicator */}
              {loading && progress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 flex items-center justify-center">
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    {progress}% processed
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mx-auto w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Upload size={36} className="text-blue-600" />
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-500 mb-2">
                or <span className="text-blue-600 font-medium">click to browse files</span>
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Supports files of any size - large datasets will be processed in chunks for optimal performance
              </p>
            </div>
          )}
          
          {/* Processing info */}
          {processingInfo && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
              <div className="flex items-center">
                <Info size={16} className="mr-2 flex-shrink-0" />
                <span>{processingInfo}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={onBrowseLibrary}
            className="flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-medium transition-colors shadow-sm"
          >
            <BookOpen size={18} className="mr-2" />
            Browse Library
          </button>
          
          {hasActiveData && (
            <button
              onClick={onSaveToLibrary}
              className="flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Save size={18} className="mr-2" />
              Save to Library
            </button>
          )}
        </div>
        
        {/* Help text */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-start text-sm text-gray-600">
            <Info size={16} className="mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-medium text-blue-700">Pro tip:</span> The AI uses intelligent chunking to analyze up to 200K rows, focusing on patterns and insights executives care about most.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;