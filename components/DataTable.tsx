import React from 'react';
import type { CsvData } from '../types';

interface DataTableProps {
  data: CsvData;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const previewRows = data.rows.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Data Preview</h2>
        <p className="text-sm text-gray-500">Showing first 5 of {data.rows.length} rows</p>
      </div>
      <div className="flex-grow overflow-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-100 sticky top-0">
            <tr>
              {data.headers.map((header, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;