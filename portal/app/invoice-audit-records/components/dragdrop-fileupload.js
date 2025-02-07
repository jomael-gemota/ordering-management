import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

export default function DragDropFileUpload({ onFileParsed }) {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            parseExcel(file);
        };
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            parseExcel(file);
        };
    };

    const parseExcel = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            onFileParsed(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div
            className={`border-2 border-dashed p-6 text-center cursor-pointer ${
                dragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <p>Drag & drop an Excel file here, or click to select a file</p>
            <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};