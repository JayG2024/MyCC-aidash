import React, { useState, useEffect } from 'react';
import { getContentLibrary, StoredCSVData, deleteDataset } from '../../utils/localStorage';
import { Database, Calendar, Trash2, FilePlus, FileText, Search } from 'lucide-react';

interface DatasetLibraryProps {
  onSelectDataset: (dataset: StoredCSVData) => void;
  onClose: () => void;
}

const DatasetLibrary: React.FC<DatasetLibraryProps> = ({ onSelectDataset, onClose }) => {
  const [datasets, setDatasets] = useState<StoredCSVData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      return `${kilobytes.toFixed(2)} KB`;
    } else {
      const megabytes = kilobytes / 1024;
      return `${megabytes.toFixed(2)} MB`;
    }
  };

  // Extract all unique tags from all datasets
  const allTags = [...new Set(datasets.flatMap(dataset => dataset.tags || []))];

  // Filter datasets based on search term and selected tags
  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = 
      dataset.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dataset.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => dataset.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl flex items-center">
            <Database className="mr-2" size={20} />
            Content Library
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredDatasets.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No datasets found</h3>
            <p className="text-gray-500">
              {datasets.length === 0 
                ? 'Your content library is empty. Upload a dataset and save it to the library to get started.'
                : 'No datasets match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDatasets.map(dataset => (
              <div
                key={dataset.id}
                onClick={() => onSelectDataset(dataset)}
                className="border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                        <Database size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 line-clamp-1">{dataset.fileName}</h4>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(dataset.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDataset(dataset.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {dataset.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{dataset.description}</p>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dataset.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                    <span>{dataset.data.length} rows</span>
                    <span>{dataset.headers.length} columns</span>
                    <span>{formatFileSize(dataset.data)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetLibrary;