import React, { useState } from 'react';
import { X, Save, Plus, Tag } from 'lucide-react';
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
  
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for the dataset');
      return;
    }
    
    setIsSaving(true);
    try {
      const id = await saveToContentLibrary(data, headers, name, description, tags);
      onSave(id);
    } catch (error) {
      console.error('Error saving to library:', error);
      setError('Failed to save dataset to library');
    } finally {
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center">
              <Save className="mr-2" size={20} />
              Save to Content Library
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dataset Name*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a name for this dataset"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a description (optional)"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags (press Enter)"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <div 
                      key={tag} 
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center"
                    >
                      <Tag size={14} className="mr-1" />
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 p-0.5 text-blue-500 hover:text-blue-700 rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-2 text-sm text-gray-500">
              <p>Dataset summary:</p>
              <ul className="list-disc list-inside mt-1">
                <li>{data.length} rows</li>
                <li>{headers.length} columns</li>
                <li>Fields: {headers.slice(0, 3).join(', ')}{headers.length > 3 ? '...' : ''}</li>
              </ul>
            </div>
            
            {error && (
              <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md flex items-center ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                } transition-colors`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white mr-2"></div>
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
        </div>
      </div>
    </div>
  );
};

export default SaveToLibraryModal;