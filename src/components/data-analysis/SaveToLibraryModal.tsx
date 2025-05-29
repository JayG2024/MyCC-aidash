import React, { useState } from 'react';
import { X, Save, Plus, Tag, Info, Check } from 'lucide-react';
import { saveToContentLibrary } from '../../utils/localStorage';

interface SaveToLibraryModalProps {
  data: any[];
  headers: string[];
  fileName: string;
  onClose: () => void;
  onSave: (id: string) => void;
}

const SaveToLibraryModal: React.FC<SaveToLibraryModalProps> = ({ 
  data, headers, fileName, onClose, onSave 
}) => {
  const [name, setName] = useState(fileName || 'Untitled Dataset');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the dataset');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      const id = await saveToContentLibrary(data, headers, name, description, tags);
      setSaveSuccess(true);
      
      // Success animation before closing
      setTimeout(() => {
        onSave(id);
      }, 1500);
    } catch (error) {
      console.error('Error saving to library:', error);
      setError('Failed to save dataset to library. Please try again.');
      setIsSaving(false);
    }
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Generate suggested tags based on the data content
  const suggestedTags = ['sales', 'marketing', 'operations', 'finance', 'quarterly', 'customers', 'products'];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center">
              <Save className="mr-2" size={20} />
              Save to Content Library
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded text-white"
              disabled={isSaving}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {saveSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-4">
                <Check size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Dataset Saved!</h4>
              <p className="text-gray-600">
                Your dataset has been successfully saved to the content library.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Dataset Name*
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Enter a name for this dataset"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Enter a description (optional)"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 p-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                {/* Suggested tags */}
                {tags.length === 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1.5">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!tags.includes(tag)) {
                              setTags([...tags, tag]);
                            }
                          }}
                          className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <div 
                        key={tag} 
                        className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center"
                      >
                        <Tag size={12} className="mr-1.5" />
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-1.5 p-0.5 text-blue-500 hover:text-blue-700 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-2 text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-start">
                  <Info size={16} className="mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">Dataset summary:</p>
                    <ul className="list-disc list-inside mt-1 text-blue-700 space-y-1">
                      <li>{data.length.toLocaleString()} rows</li>
                      <li>{headers.length} columns</li>
                      <li className="truncate max-w-full">Fields: {headers.slice(0, 3).join(', ')}{headers.length > 3 ? ` +${headers.length - 3} more` : ''}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center ${
                    isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                  } transition-colors shadow-sm`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save to Library
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveToLibraryModal;