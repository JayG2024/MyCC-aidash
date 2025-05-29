import React, { useState, useEffect } from 'react';
import { getContentLibrary, StoredCSVData, deleteDataset } from '../../utils/localStorage';
import { Database, Calendar, Trash2, FilePlus, FileText, Search, X, Tag, SortAsc, SortDesc, ChevronLeft, Filter, Clock, Eye } from 'lucide-react';

interface DatasetLibraryProps {
  onSelectDataset: (dataset: StoredCSVData) => void;
  onClose: () => void;
}

const DatasetLibrary: React.FC<DatasetLibraryProps> = ({ onSelectDataset, onClose }) => {
  const [datasets, setDatasets] = useState<StoredCSVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'rows'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDataset, setSelectedDataset] = useState<StoredCSVData | null>(null);
  const [previewData, setPreviewData] = useState<{headers: string[], rows: any[]}>({headers: [], rows: []});

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setLoading(true);
    try {
      const library = await getContentLibrary();
      setDatasets(library);
    } catch (error) {
      console.error('Error loading datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await deleteDataset(id);
        await loadDatasets();
        
        // If the currently previewed dataset was deleted, clear the preview
        if (selectedDataset?.id === id) {
          setSelectedDataset(null);
        }
      } catch (error) {
        console.error('Error deleting dataset:', error);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (data: any[]) => {
    // Estimate size based on JSON stringification
    const jsonSize = JSON.stringify(data).length;
    const kilobytes = jsonSize / 1024;
    
    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(1)} KB`;
    } else {
      const megabytes = kilobytes / 1024;
      return `${megabytes.toFixed(1)} MB`;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(timestamp);
    }
  };

  // Extract all unique tags from all datasets
  const allTags = [...new Set(datasets.flatMap(dataset => dataset.tags || []))];

  // Toggle sort direction or change sort field
  const toggleSort = (field: 'date' | 'name' | 'rows') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc'); // Default to descending for new sort field
    }
  };

  // Sort datasets based on current sort settings
  const sortedDatasets = [...datasets].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? a.timestamp - b.timestamp 
        : b.timestamp - a.timestamp;
    } else if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.fileName.localeCompare(b.fileName)
        : b.fileName.localeCompare(a.fileName);
    } else { // rows
      return sortDirection === 'asc'
        ? a.data.length - b.data.length
        : b.data.length - a.data.length;
    }
  });

  // Filter datasets based on search term and selected tags
  const filteredDatasets = sortedDatasets.filter(dataset => {
    const matchesSearch = 
      dataset.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dataset.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => dataset.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Handle dataset selection for preview
  const handleSelectForPreview = (dataset: StoredCSVData) => {
    setSelectedDataset(dataset);
    
    // Prepare preview data - only show first 5 rows
    const previewRows = dataset.data.slice(0, 5);
    setPreviewData({
      headers: dataset.headers,
      rows: previewRows
    });
  };

  // Back to dataset list from preview
  const handleBackToList = () => {
    setSelectedDataset(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl flex items-center">
            <Database className="mr-2" size={20} />
            Content Library
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {selectedDataset ? (
        // Dataset preview view
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back to library
            </button>
            
            <button
              onClick={() => onSelectDataset(selectedDataset)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
            >
              <Eye size={16} className="mr-2" />
              Load This Dataset
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedDataset.fileName}</h2>
                <p className="text-sm text-gray-500 flex items-center">
                  <Clock size={14} className="mr-1.5" />
                  {formatTimeAgo(selectedDataset.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 font-medium mb-1">Rows</p>
                <p className="text-2xl font-bold text-blue-800">{selectedDataset.data.length.toLocaleString()}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-700 font-medium mb-1">Columns</p>
                <p className="text-2xl font-bold text-indigo-800">{selectedDataset.headers.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700 font-medium mb-1">Size</p>
                <p className="text-2xl font-bold text-purple-800">{formatFileSize(selectedDataset.data)}</p>
              </div>
            </div>
            
            {selectedDataset.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description:</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {selectedDataset.description}
                </p>
              </div>
            )}
            
            {selectedDataset.tags && selectedDataset.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDataset.tags.map(tag => (
                    <div key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center">
                      <Tag size={14} className="mr-1.5" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Data Preview:</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {previewData.headers.map((header, index) => (
                          <th key={index} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {previewData.headers.map((header, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                              {row[header] !== null && row[header] !== undefined ? String(row[header]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.rows.length === 0 && (
                  <div className="p-4 text-center text-gray-500">No data to preview</div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing {previewData.rows.length} of {selectedDataset.data.length.toLocaleString()} rows
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Dataset list view
        <>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button 
                    className="flex items-center py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                  >
                    <Filter size={16} className="mr-1.5" />
                    <span className="mr-1">Tags</span>
                    <span className={`${selectedTags.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} w-5 h-5 rounded-full text-xs flex items-center justify-center`}>
                      {selectedTags.length || 0}
                    </span>
                  </button>
                  
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64 hidden group-hover:block hover:block z-10">
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {allTags.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2">No tags available</p>
                      ) : (
                        allTags.map(tag => (
                          <div key={tag} className="flex items-center py-1">
                            <input
                              type="checkbox"
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onChange={() => {
                                if (selectedTags.includes(tag)) {
                                  setSelectedTags(selectedTags.filter(t => t !== tag));
                                } else {
                                  setSelectedTags([...selectedTags, tag]);
                                }
                              }}
                              className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`tag-${tag}`} className="text-sm text-gray-700 cursor-pointer">
                              {tag}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedTags.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <button
                          onClick={() => setSelectedTags([])}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Clear all tags
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative group">
                  <button 
                    className="flex items-center py-2 px-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                  >
                    <SortAsc size={16} className="mr-1.5" />
                    <span className="mr-1">Sort</span>
                  </button>
                  
                  <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-48 hidden group-hover:block hover:block z-10">
                    <button
                      onClick={() => toggleSort('date')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                        sortBy === 'date' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>Date added</span>
                      {sortBy === 'date' && (
                        sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleSort('name')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                        sortBy === 'name' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>Name</span>
                      {sortBy === 'name' && (
                        sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleSort('rows')}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                        sortBy === 'rows' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>Row count</span>
                      {sortBy === 'rows' && (
                        sortDirection === 'desc' ? <SortDesc size={14} /> : <SortAsc size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selected tags display */}
            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <div key={tag} className="flex items-center bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs">
                    <Tag size={12} className="mr-1" />
                    {tag}
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className="ml-1.5 hover:text-blue-900"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-blue-700 hover:underline px-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-4 min-h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-500">Loading your datasets...</p>
                </div>
              </div>
            ) : filteredDatasets.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No datasets found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {datasets.length === 0 
                    ? 'Your content library is empty. Upload a dataset and save it to the library to get started.'
                    : 'No datasets match your search criteria.'}
                </p>
                {searchTerm || selectedTags.length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTags([]);
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm inline-flex items-center"
                  >
                    <X size={14} className="mr-1.5" />
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-flex items-center"
                  >
                    <FilePlus size={16} className="mr-1.5" />
                    Upload New Dataset
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDatasets.map(dataset => (
                  <div
                    key={dataset.id}
                    className="border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden group"
                    onClick={() => handleSelectForPreview(dataset)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-2.5 rounded-lg bg-blue-100 text-blue-600 mr-3">
                            <Database size={18} />
                          </div>
                          <div className="max-w-[140px]">
                            <h4 className="font-medium text-gray-800 truncate group-hover:text-blue-700">{dataset.fileName}</h4>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar size={12} className="mr-1" />
                              {formatTimeAgo(dataset.timestamp)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteDataset(dataset.id, e)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {dataset.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{dataset.description}</p>
                      )}
                      
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {dataset.tags?.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center">
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <span>{dataset.data.length.toLocaleString()} rows</span>
                        <span>{dataset.headers.length} columns</span>
                        <span>{formatFileSize(dataset.data)}</span>
                      </div>
                    </div>
                    
                    {/* Preview/Select buttons */}
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex justify-between items-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectForPreview(dataset);
                        }}
                        className="text-sm text-blue-700 hover:text-blue-900"
                      >
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDataset(dataset);
                        }}
                        className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DatasetLibrary;