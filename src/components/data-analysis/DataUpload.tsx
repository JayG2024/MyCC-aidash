import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, AlertCircle, Check, Loader2, BookOpen, Save, Info, FileText, X, UploadCloud as CloudUpload } from 'lucide-react';

interface DataUploadProps {
  onDataParsed: (data: Record<string, unknown>[], headers: string[], fileName?: string) => void;
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
  const [rowsProcessed, setRowsProcessed] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState<string | null>(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [processingMode, setProcessingMode] = useState<'full' | 'sample' | 'streaming'>('full');
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

  // Monitor memory usage
  const getMemoryUsage = (): string => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB used`;
    }
    return 'Memory monitoring unavailable';
  };

  // Smart processing mode selection based on file size
  const selectProcessingMode = (fileSize: number): 'full' | 'sample' | 'streaming' => {
    if (fileSize > 200 * 1024 * 1024) { // > 200MB
      return 'streaming';
    } else if (fileSize > 50 * 1024 * 1024) { // > 50MB
      return 'sample';
    }
    return 'full';
  };

  // Preview file content for column selection
  const previewFile = async (file: File): Promise<{ headers: string[], preview: any[] }> => {
    return new Promise((resolve, reject) => {
      const isCSV = file.name.toLowerCase().endsWith('.csv');
      
      if (isCSV) {
        Papa.parse(file, {
          header: true,
          preview: 5, // Only parse first 5 rows for preview
          complete: (results) => {
            resolve({
              headers: results.meta.fields || [],
              preview: results.data
            });
          },
          error: reject
        });
      } else {
        // Excel preview
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Get just the first 6 rows (header + 5 data rows)
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            range.e.r = Math.min(range.e.r, 5);
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
              header: 1,
              range: range,
              defval: ''
            });
            
            const headers = (jsonData[0] as string[]) || [];
            const preview = jsonData.slice(1).map((row: unknown[]) => {
              const obj: Record<string, unknown> = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
            });
            
            resolve({ headers, preview });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleFile = useCallback(async (file: File) => {
    // Reset states
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError(null);
    setLoading(false);
    setSuccess(false);
    setProgress(0);
    setProcessingInfo(null);
    setShowLargeFileWarning(false);
    setRowsProcessed(0);
    setTotalRows(0);
    setMemoryUsage(getMemoryUsage());

    // Validate file type
    const fileExtension = file.name.toLowerCase();
    const isCSV = fileExtension.endsWith('.csv');
    const isExcel = fileExtension.endsWith('.xlsx') || fileExtension.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
      setError('Please upload a CSV file (.csv) or Excel file (.xlsx, .xls)');
      return;
    }

    // Determine processing mode based on file size
    const mode = selectProcessingMode(file.size);
    setProcessingMode(mode);

    // Set warnings and processing info based on file size
    if (file.size > 200 * 1024 * 1024) { // > 200MB
      setShowLargeFileWarning(true);
      setProcessingInfo('Massive file detected. Using streaming mode for optimal performance and memory usage.');
    } else if (file.size > 50 * 1024 * 1024) { // > 50MB
      setShowLargeFileWarning(true);
      setProcessingInfo('Large file detected. Will process a representative sample to reduce memory usage.');
    } else if (file.size > 10 * 1024 * 1024) { // > 10MB
      setProcessingInfo('Large file detected. Processing may take a few moments...');
    }

    try {
      // First, get a preview to show available columns
      setProcessingInfo('Analyzing file structure...');
      const preview = await previewFile(file);
      setAvailableColumns(preview.headers);
      setSelectedColumns(preview.headers); // Select all by default
      setPreviewData(preview.preview);

      // For massive files, show column selector
      if (mode === 'streaming' || mode === 'sample') {
        setShowColumnSelector(true);
        setProcessingInfo(`File structure analyzed. ${preview.headers.length} columns found. You can select specific columns to reduce memory usage.`);
        return; // Wait for user to select columns
      }

      // For normal files, process immediately
      await processFileWithMode(file, mode, preview.headers);
    } catch (error) {
      setError(`Error analyzing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const processFileWithMode = async (file: File, mode: 'full' | 'sample' | 'streaming', headers: string[]) => {
    setLoading(true);
    setShowColumnSelector(false);
    
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const columnsToInclude = selectedColumns.length > 0 ? selectedColumns : headers;

    if (mode === 'streaming') {
      await processFileInStreamingMode(file, isCSV, columnsToInclude);
    } else if (mode === 'sample') {
      await processFileAsSample(file, isCSV, columnsToInclude);
    } else {
      await processFileCompletely(file, isCSV, columnsToInclude);
    }
  };

  const processFileInStreamingMode = async (file: File, isCSV: boolean, columns: string[]) => {
    setProcessingInfo('Processing in streaming mode for memory efficiency...');
    
    const batchSize = 1000;
    let processedData: any[] = [];
    let processedRowCount = 0;
    
    if (isCSV) {
      return new Promise<void>((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          worker: true,
          step: function(results) {
            const row = results.data as any;
            
            // Filter to selected columns only
            const filteredRow: any = {};
            columns.forEach(col => {
              filteredRow[col] = row[col];
            });
            
            processedData.push(filteredRow);
            processedRowCount++;
            
            // Update progress
            if (results.meta.cursor && file.size) {
              const newProgress = Math.round((results.meta.cursor / file.size) * 100);
              setProgress(newProgress);
              setRowsProcessed(processedRowCount);
              
              if (processedRowCount % 1000 === 0) {
                setProcessingInfo(`Streaming: ${processedRowCount.toLocaleString()} rows processed...`);
                setMemoryUsage(getMemoryUsage());
              }
            }
            
            // For streaming mode, we'll take a representative sample
            if (processedData.length >= 10000) {
              results.abort();
            }
          },
          complete: () => {
            handleParseComplete(processedData, columns, []);
            resolve();
          },
          error: reject
        });
      });
    } else {
      // Excel streaming (sample approach)
      await processFileAsSample(file, false, columns);
    }
  };

  const processFileAsSample = async (file: File, isCSV: boolean, columns: string[]) => {
    setProcessingInfo('Processing representative sample...');
    
    if (isCSV) {
      return new Promise<void>((resolve, reject) => {
        let sampleData: any[] = [];
        let rowCount = 0;
        const sampleSize = 5000; // Take first 5000 rows as sample
        
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          worker: true,
          step: function(results) {
            if (rowCount < sampleSize) {
              const row = results.data as any;
              const filteredRow: any = {};
              columns.forEach(col => {
                filteredRow[col] = row[col];
              });
              sampleData.push(filteredRow);
            }
            
            rowCount++;
            
            if (results.meta.cursor && file.size) {
              const newProgress = Math.round((results.meta.cursor / file.size) * 100);
              setProgress(newProgress);
              setRowsProcessed(rowCount);
              
              if (rowCount % 1000 === 0) {
                setProcessingInfo(`Sampling: ${rowCount.toLocaleString()} rows processed...`);
              }
            }
            
            if (rowCount >= sampleSize) {
              results.abort();
            }
          },
          complete: () => {
            setProcessingInfo(`Sample complete: ${sampleData.length.toLocaleString()} rows from ${rowCount.toLocaleString()} total rows.`);
            handleParseComplete(sampleData, columns, []);
            resolve();
          },
          error: reject
        });
      });
    } else {
      // Excel sample processing
      await processExcelFile(file);
    }
  };

  const processFileCompletely = async (file: File, isCSV: boolean, columns: string[]) => {
    if (isCSV) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        worker: file.size > 5 * 1024 * 1024,
        step: function(results) {
          if (results.meta.cursor && file.size) {
            const newProgress = Math.round((results.meta.cursor / file.size) * 100);
            if (newProgress !== progress && newProgress % 5 === 0) {
              setProgress(newProgress);
              setProcessingInfo(`Processing ${newProgress}% complete...`);
            }
          }
        },
        complete: (results) => {
          // Filter data to selected columns
          const filteredData = results.data.map((row: any) => {
            const filteredRow: any = {};
            columns.forEach(col => {
              filteredRow[col] = row[col];
            });
            return filteredRow;
          });
          handleParseComplete(filteredData, columns, results.errors);
        },
        error: (error) => {
          setLoading(false);
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } else {
      await processExcelFile(file);
    }
  };

  // Handle Excel file processing
  const processExcelFile = (file: File) => {
    setProcessingInfo('Processing Excel file...');
    setProgress(25);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setProgress(50);
        setProcessingInfo('Reading Excel data...');
        
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        setProgress(75);
        setProcessingInfo('Converting to data format...');
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          setLoading(false);
          setError('No worksheets found in the Excel file');
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header option
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          blankrows: false
        });
        
        if (!jsonData || jsonData.length === 0) {
          setLoading(false);
          setError('No data found in the Excel file');
          return;
        }
        
        // Extract headers and data
        const headers = (jsonData[0] as string[]) || [];
        const dataRows = jsonData.slice(1).map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        
        setProgress(100);
        handleParseComplete(dataRows, headers, []);
        
      } catch (error) {
        setLoading(false);
        setError(`Error processing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Excel processing error:', error);
      }
    };
    
    reader.onerror = () => {
      setLoading(false);
      setError('Error reading Excel file');
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Common function to handle parse completion
  const handleParseComplete = (data: Record<string, unknown>[], headers: string[], errors?: Papa.ParseError[]) => {
    setLoading(false);
    setProgress(100);

    // Handle parse errors
    if (errors && errors.length > 0) {
      console.error('File parsing errors:', errors);
      const errorMessages = errors.slice(0, 3).map(e => e.message).join('; ');
      setError(`Error parsing file: ${errorMessages}${errors.length > 3 ? ' and more...' : ''}`);
      return;
    }

    // Validate data
    if (headers.length === 0) {
      setError('No column headers found in the file');
      return;
    }

    // Check for empty data
    if (!data || data.length === 0) {
      setError('No data rows found in the file. Please check your file and try again.');
      return;
    }

    // Handle large datasets with appropriate user information
    const rowCount = data.length;
    if (rowCount > 10000) {
      setProcessingInfo(`Successfully processed ${rowCount.toLocaleString()} rows. AI analysis will process this data in chunks for optimal performance.`);
    } else {
      setProcessingInfo(null);
    }

    setSuccess(true);
    onDataParsed(data, headers, fileName);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

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
    setRowsProcessed(0);
    setTotalRows(0);
    setMemoryUsage(null);
    setShowColumnSelector(false);
    setAvailableColumns([]);
    setSelectedColumns([]);
    setPreviewData(null);
    setProcessingMode('full');
    
    // Also clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Column selection functions
  const toggleColumn = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const selectAllColumns = () => {
    setSelectedColumns(availableColumns);
  };

  const selectNoneColumns = () => {
    setSelectedColumns([]);
  };

  // Proceed with selected columns
  const proceedWithSelectedColumns = async () => {
    if (selectedColumns.length === 0) {
      setError('Please select at least one column to proceed.');
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      await processFileWithMode(file, processingMode, availableColumns);
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
            accept=".csv,.xlsx,.xls"
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
                Drop your CSV or Excel file here
              </p>
              <p className="text-sm text-gray-500 mb-2">
                or <span className="text-blue-600 font-medium">click to browse files</span>
              </p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Supports CSV (.csv) and Excel (.xlsx, .xls) files of any size - large datasets will be processed in chunks for optimal performance
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