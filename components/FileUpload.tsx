import React, { useCallback, useState } from 'react';
import type { CsvData } from '../types';
import { UploadIcon } from '../constants';

interface FileUploadProps {
  onDataParsed: (data: CsvData) => void;
  onError: (message: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed, onError }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        onError("Invalid file type. Please upload a .csv file.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        try {
            const lines = text.trim().split(/\r\n|\n/);
            if (lines.length < 2) {
                onError("CSV file must have a header and at least one row of data.");
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
            
            if (rows.some(row => row.length !== headers.length)) {
                onError("Inconsistent number of columns in CSV data. Please check your file.");
                return;
            }

            onDataParsed({ headers, rows });
        } catch (err) {
            onError("Failed to parse the CSV file. Please ensure it's correctly formatted.");
        }
      }
    };
    reader.onerror = () => {
        onError("Failed to read the file.");
    }
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`flex justify-center items-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-blue-600 bg-blue-100' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}
      >
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <UploadIcon />
            <p className="mt-4 text-lg text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
            <p className="text-sm text-gray-400">CSV files only</p>
            <input id="file-upload" name="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
        </label>
      </div>
    </div>
  );
};

export default FileUpload;