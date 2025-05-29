import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Search, Download, FileText, Filter, ChevronDown } from 'lucide-react';

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
  
  // When headers change, update selectedColumns
  useEffect(() => {
    setSelectedColumns(headers);
  }, [headers]);
  
  // Filter data based on search term
  const filteredData = data.filter(row => {
    return headers.some(header => {
      const value = row[header];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
  
  // Sort data based on sort config
  const sortedData = React.useMemo(() => {
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
        
        // Default string comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
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
      ...selectedData.map(row => selectedColumns.map(header => `"${row[header] || ''}"`).join(','))
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
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search data..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex space-x-2 w-full sm:w-auto">
          <div className="relative">
            <button 
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Filter size={18} className="mr-2" />
              Columns
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {showColumnSelector && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64 p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Select columns to display</h4>
                <div className="max-h-48 overflow-y-auto">
                  {headers.map(header => (
                    <div key={header} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`col-${header}`}
                        checked={selectedColumns.includes(header)}
                        onChange={() => toggleColumnSelection(header)}
                        className="mr-2 rounded"
                      />
                      <label htmlFor={`col-${header}`} className="text-sm text-gray-700 cursor-pointer">
                        {header}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {paginatedData.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {selectedColumns.map((header, index) => (
                  <th 
                    key={index} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort(header)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {sortConfig?.key === header ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp size={14} />
                        ) : (
                          <ArrowDown size={14} />
                        )
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {selectedColumns.map((header, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCellValue(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10">
            {filteredData.length === 0 && searchTerm ? (
              <div>
                <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No matching results found</p>
                <p className="text-sm text-gray-400">Try a different search term</p>
              </div>
            ) : data.length === 0 ? (
              <div>
                <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No data available</p>
                <p className="text-sm text-gray-400">Upload a CSV file to get started</p>
              </div>
            ) : (
              <p className="text-gray-500">No data to display</p>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500 flex items-center">
            <span className="mr-4">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            
            <select 
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className="border border-gray-300 rounded p-1 text-sm"
            >
              <option value={10}>10 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show (centered around current page)
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
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-500">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;