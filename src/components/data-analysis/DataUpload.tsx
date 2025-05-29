import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileUp, AlertCircle, Check, Loader2, BookOpen, Save, Info, FileText } from 'lucide-react';

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError(null);
    setLoading(true);
    setSuccess(false);
    setProgress(0);
    setProcessingInfo(null);
    setShowLargeFileWarning(false);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // > 50MB
      setShowLargeFileWarning(true);
      setProcessingInfo('Warning: This file is very large and may not process reliably in the browser. Consider splitting it into smaller files if you encounter issues.');
    } else if (file.size > 10 * 1024 * 1024) { // > 10MB
      setProcessingInfo('Large file detected. Processing may take a few moments...');
    }

    // Configure Papa Parse for large files
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      worker: file.size > 5 * 1024 * 1024, // Use a worker for files > 5MB
      step: function(results, parser) {
        // Update progress periodically
        if (results.meta.cursor && file.size) {
          const newProgress = Math.round((results.meta.cursor / file.size) * 100);
          if (newProgress !== progress && newProgress % 10 === 0) {
            setProgress(newProgress);
            setProcessingInfo(`Processing ${newProgress}% complete...`);
          }
        }
      },
      complete: (results) => {
        setLoading(false);
        setProgress(100);

        if (results.errors && results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
          // Only show the first few errors to avoid overwhelming the user
          const errorMessages = results.errors.slice(0, 3).map(e => e.message).join('; ');
          setError(`Error parsing CSV: ${errorMessages}${results.errors.length > 3 ? ' and more...' : ''}`);
          return;
        }

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

        // For large datasets, provide information
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center justify-between text-sm mb-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}
      {/* Large file warning */}
      {showLargeFileWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 text-xs flex items-center mb-2">
          <Info size={14} className="mr-2" />
          This file is very large. If you experience browser crashes or errors, try splitting the file into smaller parts.
        </div>
      )}
      
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
        <span>Upload Data</span>
        {hasActiveData && (
          <button
            onClick={onSaveToLibrary}
            className="flex items-center text-sm px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Save size={14} className="mr-1" />
            Save to Library
          </button>
        )}
      </h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
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
        
        <div className="mb-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            {loading ? (
              <Loader2 size={24} className="text-blue-600 animate-spin" />
            ) : success ? (
              <Check size={24} className="text-green-600" />
            ) : (
              <Upload size={24} className="text-gray-500" />
            )}
          </div>
        </div>
        
        {fileName ? (
          <div>
            <p className="font-medium text-gray-800">{fileName}</p>
            <p className="text-sm text-gray-500">{fileSize}</p>
            {success && (
              <p className="mt-2 text-sm text-green-600">File uploaded successfully!</p>
            )}
            {loading && progress > 0 && progress < 100 && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm text-gray-600">{progress}% processed</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-700">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-blue-600">click to browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supports CSV files of any size - large files (30K-100K rows) will be processed in chunks
            </p>
          </div>
        )}
        
        {processingInfo && (
          <div className="mt-3 flex items-center justify-center text-blue-600 text-sm">
            <Info size={16} className="mr-1" />
            {processingInfo}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex gap-3">
        <button
          onClick={onBrowseLibrary}
          className="flex-1 flex items-center justify-center py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
        >
          <BookOpen size={18} className="mr-2" />
          Browse Library
        </button>
        
        {hasActiveData && (
          <button
            onClick={onSaveToLibrary}
            className="flex-1 flex items-center justify-center py-2.5 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
          >
            <Save size={18} className="mr-2" />
            Save to Library
          </button>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center text-blue-600 mb-1">
          <Info size={14} className="mr-1 flex-shrink-0" />
          <span>The AI uses o3-mini model for efficient analysis of datasets up to 100K rows</span>
        </div>
        <p>Your data is stored locally and only processed through your own OpenAI API key</p>
      </div>
    </div>
  );
};

export default DataUpload;