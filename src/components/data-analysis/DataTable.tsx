import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUp, ArrowDown, Search, Download, FileText, Filter, ChevronDown, X, SlidersHorizontal, Eye, EyeOff, ChevronsUpDown } from 'lucide-react';

interface DataTableProps {
  data: any[];
  headers: string[];
}

const DataTable: React.FC<DataTableProps> = ({ data, headers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(headers);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showFilterMenu, setShowFilterMenu] = useState<string | null>(null);
  
  // When headers change, update selectedColumns
  useEffect(() => {
    setSelectedColumns(headers);
  }, [headers]);
  
  // Get unique values for each column for filtering
  const uniqueValues = useMemo(() => {
    const values: Record<string, Set<string>> = {};
    
    headers.forEach(header => {
      const columnValues = new Set<string>();
      
      data.forEach(row => {
        if (row[header] !== null && row[header] !== undefined && row[header] !== '') {
          columnValues.add(String(row[header]));
        }
      });
      
      values[header] = columnValues;
    });
    
    return values;
  }, [data, headers]);
  
  // Filter data based on search term and column filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // Search filter
      const matchesSearch = searchTerm === '' || headers.some(header => {
        const value = row[header];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
      
      // Column filters
      const matchesFilters = Object.keys(activeFilters).every(header => {
        if (!activeFilters[header].length) return true;
        
        const value = row[header];
        if (value === null || value === undefined) return false;
        
        return activeFilters[header].includes(String(value));
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [data, headers, searchTerm, activeFilters]);
  
  // Sort data based on sort config
  const sortedData = useMemo(() => {
    const dataToSort = [...filteredData];
    if (sortConfig !== null) {
      dataToSort.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Check if values are numeric
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
        }
        
        // Check if values are dates
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortConfig.direction === 'ascending' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
        
        // Default string comparison
        return sortConfig.direction === 'ascending' 
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return dataToSort;
  }, [filteredData, sortConfig]);
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleDownloadCSV = () => {
    // Convert the data to CSV format
    const selectedData = sortedData.map(row => 
      Object.fromEntries(selectedColumns.map(header => [header, row[header]]))
    );
    
    const csvContent = [
      selectedColumns.join(','),
      ...selectedData.map(row => selectedColumns.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : `"${value}"`;
      }).join(','))
    ].join('\n');
    
    // Create a Blob and generate a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const toggleColumnSelection = (header: string) => {
    if (selectedColumns.includes(header)) {
      if (selectedColumns.length > 1) { // Ensure at least one column is selected
        setSelectedColumns(selectedColumns.filter(h => h !== header));
      }
    } else {
      setSelectedColumns([...selectedColumns, header]);
    }
  };

  const handleFilterChange = (header: string, value: string, checked: boolean) => {
    setActiveFilters(prev => {
      const current = prev[header] || [];
      
      if (checked) {
        return { ...prev, [header]: [...current, value] };
      } else {
        return { ...prev, [header]: current.filter(v => v !== value) };
      }
    });
  };
  
  const clearFilters = () => {
    setActiveFilters({});
  };
  
  const clearFilter = (header: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[header];
      return newFilters;
    });
  };
  
  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Check if it's a date
    const dateValue = new Date(value);
    if (!isNaN(dateValue.getTime()) && String(value).includes('-')) {
      return dateValue.toLocaleDateString();
    }
    
    // Check if it's a number
    if (typeof value === 'number') {
      // Format currency if it looks like a monetary value
      if (value > 100 || Number.isInteger(value)) {
        return value.toLocaleString();
      }
      // Format percentage or decimal
      if (value < 1 && value > 0) {
        return value.toFixed(2);
      }
    }
    
    return String(value);
  };
  
  // Check if there are any active filters
  const hasActiveFilters = Object.values(activeFilters).some(filters => filters.length > 0);
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with search and actions */}
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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
          
          <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative">
              <button 
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center py-2 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm"
              >
                <Eye size={16} className="mr-1.5" />
                <span className="mr-1">Columns</span>
                <ChevronDown size={14} />
              </button>
              
              {showColumnSelector && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-64 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Visible columns</h4>
                    <button 
                      onClick={() => setSelectedColumns(headers)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Reset all
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-1">
                    {headers.map(header => (
                      <div key={header} className="flex items-center py-1.5 px-1 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={`col-${header}`}
                          checked={selectedColumns.includes(header)}
                          onChange={() => toggleColumnSelection(header)}
                          className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`col-${header}`} className="text-sm text-gray-700 cursor-pointer truncate flex-1">
                          {header}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(showFilterMenu ? null : 'main')}
                className={`flex items-center py-2 px-3 border hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm ${
                  hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300'
                }`}
              >
                <Filter size={16} className="mr-1.5" />
                <span className="mr-1">Filter</span>
                {hasActiveFilters && (
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1">
                    {Object.values(activeFilters).flat().length}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>
              
              {showFilterMenu === 'main' && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-72 p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Filter data</h4>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                  
                  {/* Active filter tags */}
                  {hasActiveFilters && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {Object.entries(activeFilters).map(([header, values]) => 
                        values.length > 0 && (
                          <div key={header} className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2 py-1 text-xs">
                            <span className="font-medium mr-1">{header}:</span>
                            <span>{values.length > 1 ? `${values.length} values` : values[0]}</span>
                            <button 
                              onClick={() => clearFilter(header)} 
                              className="ml-1 text-blue-500 hover:text-blue-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {headers.map(header => {
                      // Only show columns that have a reasonable number of unique values
                      const values = Array.from(uniqueValues[header] || []);
                      return values.length > 0 && values.length <= 30 ? (
                        <div key={header} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setShowFilterMenu(showFilterMenu === header ? 'main' : header)}
                            className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
                          >
                            <span className="truncate max-w-[200px]">{header}</span>
                            <ChevronDown size={14} className={`transform transition-transform ${showFilterMenu === header ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {showFilterMenu === header && (
                            <div className="p-2 max-h-32 overflow-y-auto bg-white">
                              {Array.from(uniqueValues[header] || []).sort().map(value => (
                                <div key={value} className="flex items-center py-1 px-1">
                                  <input
                                    type="checkbox"
                                    id={`filter-${header}-${value}`}
                                    checked={(activeFilters[header] || []).includes(value)}
                                    onChange={(e) => handleFilterChange(header, value, e.target.checked)}
                                    className="mr-2 rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor={`filter-${header}-${value}`} className="text-sm text-gray-700 cursor-pointer truncate">
                                    {value === '' ? '(Empty)' : value}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download size={16} className="mr-1.5" />
              Export
            </button>
          </div>
        </div>
        
        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {Object.entries(activeFilters).map(([header, values]) => 
              values.length > 0 && (
                <div key={header} className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                  <span className="font-medium mr-1">{header}:</span>
                  <span>{values.length > 1 ? `${values.length} values` : values[0]}</span>
                  <button 
                    onClick={() => clearFilter(header)} 
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X size={12} />
                  </button>
                </div>
              )
            )}
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        {paginatedData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                {selectedColumns.map((header, index) => {
                  const isFiltered = activeFilters[header]?.length > 0;
                  
                  return (
                    <th 
                      key={index} 
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${
                        isFiltered ? 'text-blue-600' : 'text-gray-500'
                      }`}
                      onClick={() => handleSort(header)}
                    >
                      <div className="flex items-center">
                        <span className="inline-block max-w-[150px] truncate" title={header}>
                          {header}
                        </span>
                        {sortConfig?.key === header ? (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp size={14} className="ml-1" />
                          ) : (
                            <ArrowDown size={14} className="ml-1" />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="ml-1 text-gray-300" />
                        )}
                        
                        {isFiltered && (
                          <span className="ml-1.5 text-blue-600">
                            <Filter size={12} />
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {selectedColumns.map((header, colIndex) => {
                    const value = row[header];
                    const formattedValue = formatCellValue(value);
                    
                    // Determine if this is a numeric cell for text alignment
                    const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={`px-6 py-3 text-sm ${isNumeric ? 'text-right' : 'text-left'} ${
                          activeFilters[header]?.includes(String(value)) 
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {formattedValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            {filteredData.length === 0 && searchTerm ? (
              <div>
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No matching results found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : data.length === 0 ? (
              <div>
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No data available</p>
                <p className="text-sm text-gray-500 mt-2">Upload a CSV file to get started</p>
              </div>
            ) : (
              <p className="text-gray-500">No data to display</p>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination and row count display */}
      {filteredData.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 flex items-center w-full sm:w-auto">
            <span className="mr-3 whitespace-nowrap">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            
            <select 
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className="border border-gray-300 rounded p-1.5 text-sm bg-white shadow-sm"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
          
          {/* Pagination controls */}
          <div className="flex space-x-2 w-full sm:w-auto justify-center">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1 px-2">
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {/* Show ellipsis for skipped pages */}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="text-gray-500 px-1">...</span>
              )}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;