"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";

import { RiFileExcel2Fill } from "react-icons/ri";
import { FaRegHandPointer, FaTrash } from "react-icons/fa";
import { BsInfoCircle, BsFillSendFill } from "react-icons/bs";

// notes:
// 1. after the import is successful (5 secs), the user should be redirected to the management tab. the upload button should be disabled too.

interface ParsedData {
    poNumber: string;
    sku: string;
    [key: string]: any;
}

export default function DragDropFileUpload() {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
    const [duplicates, setDuplicates] = useState<ParsedData[]>([]);
    const [existingDuplicates, setExistingDuplicates] = useState<ParsedData[]>([]);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "in-progress" | "success" | "failed">("idle");
    const [excelParsedData, setData] = useState<ParsedData[]>([]);
    const [progress, setProgress] = useState(0);

    // Pagination states
    const [duplicatesPage, setDuplicatesPage] = useState(1);
    const [existingDuplicatesPage, setExistingDuplicatesPage] = useState(1);
    const itemsPerPage = 15;

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) parseExcel(file);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) parseExcel(file);
    };

    const handleFileParsed = async (parsedData: ParsedData[], file: File) => {
        setFileInfo({ name: file.name, size: file.size });

        const uniqueRecords = new Map<string, ParsedData>();
        const duplicateRecords: ParsedData[] = [];

        parsedData.forEach((item) => {
            const key = `${item["PO"]}-${item["Pull PO"]}-${item["SKU"]}`;

            if (uniqueRecords.has(key)) {
                let originalRecord = uniqueRecords.get(key);
                if (originalRecord) {
                    duplicateRecords.push(originalRecord);
                };
                
                duplicateRecords.push(item);
            } else {
                uniqueRecords.set(key, item);
            };
        });

        // const cleanedData = [...uniqueRecords.values()];
        setData([...uniqueRecords.values()]);
        setDuplicates(duplicateRecords);
    };

    const handlePODetailsImport = async () => {
        if (!excelParsedData.length) return alert("No data to submit!");
    
        setUploadStatus("in-progress");
        setProgress(0);

        const payload = {
            batchId: `IA${Date.now()}`,
            importer: "System User",
            fileInfo: fileInfo,
            data: excelParsedData,
        };
    
        try {
            const totalItems = excelParsedData.length;
            let uploadedItems = 0;
            let duplicates = [];
    
            for (const item of excelParsedData) {
                const response = await fetch("http://localhost:5000/api/invoice-audit-records/purchase-orders/import", {
                    method: "POST",
                    body: JSON.stringify({ items: [item] }),
                    headers: { "Content-Type": "application/json" },
                });

                const result = await response.json();
    
                if (response.ok) {
                    uploadedItems++;
                    setProgress(Math.round((uploadedItems / totalItems) * 100));

                    if (result.duplicates.length > 0) {
                        duplicates.push(result.duplicates);
                    };
                };
            };
    
            try {
                const response = await fetch("http://localhost:5000/api/invoice-audit-records/purchase-orders/new-order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
    
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                };
    
                const result = await response.json();
                console.log("Batch Created Successfully:", result);
            } catch (error) {
                console.error("Failed to create batch:", error);
            };

            setUploadStatus("success");
            setExistingDuplicates(duplicates);
            setProgress(100);
        } catch (error) {
            console.error("Error submitting data:", error);
            setUploadStatus("failed");
        };
    };

    const handleRemoveFile = () => {
        setFileInfo(null);
        setData([]);
        setDuplicates([]);
        setExistingDuplicates([]);
        setUploadStatus("idle");
        setProgress(0);
        setDuplicatesPage(1);
        setExistingDuplicatesPage(1);
    
        // Reset file input field
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Pagination logic
    const paginate = (array: ParsedData[], page: number) => {
        return array.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result as ArrayBuffer;
            const data = new Uint8Array(result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: ParsedData[] = XLSX.utils.sheet_to_json<ParsedData>(worksheet);
    
            handleFileParsed(jsonData, file); // Ensure jsonData is typed
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed p-6 text-center cursor-pointer text-sm bg-slate-300 ${
                    dragging ? "border-blue-500 bg-blue-100" : "border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <p className="font-medium flex flex-row justify-center">Drag & drop an <RiFileExcel2Fill className="ml-1 mr-1" size='20px' /> Excel file here, or <FaRegHandPointer className="ml-1 mr-1" size='20px' /> Click to select a file</p>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
            <p className="text-sm mt-2 flex flex-row gap-1">
                <BsInfoCircle size='20px' color="#007BFF" /> Please download the import template <a className="text-blue-600" href="https://order-swift.s3.ap-southeast-2.amazonaws.com/templates/invoice-audit-import.xlsx"> here.</a>
            </p>

            {fileInfo && (
                <div className="mt-4 p-8 border rounded-md text-black bg-white shadow-md text-sm">
                    <h2 className="text-lg font-semibold">File Details</h2>
                    <p><strong>Name:</strong> {fileInfo.name}</p>
                    <p><strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB</p>

                        {!excelParsedData.length && (
                            <p className="py-4 px-2 bg-red-100 text-red-700 border border-red-400 rounded-lg mt-2">
                                ⚠️ The file you imported does not contain any data. Please check the file and ensure that it is not empty before trying again.
                            </p>
                        )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-4 text-sm">
                        <button className="bg-red-500 text-white px-4 py-2 rounded-md flex flex-row gap-2" onClick={handleRemoveFile}>
                            <FaTrash size='18px' /> Remove
                        </button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex flex-row gap-2" onClick={handlePODetailsImport} disabled={!excelParsedData.length || uploadStatus === "in-progress"}>
                            <BsFillSendFill size='18px' /> Upload File
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {uploadStatus !== "idle" && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className={`h-3 rounded-sm ${
                                        uploadStatus === "success" ? "bg-green-500" : "bg-blue-500"
                                    }`}
                                    style={{ width: `${progress}%`, transition: "width 0.2s ease-in-out" }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                                {uploadStatus === "in-progress"
                                    ? `Uploading... (${progress}%)`
                                    : uploadStatus === "success"
                                    ? "Upload Successful!"
                                    : "Upload Failed!"}
                            </p>
                        </div>
                    )}

                    {/* Duplicate Items Table from Import with Pagination */}
                    {duplicates.length > 0 && (
                        <div className="mt-4 p-4 border rounded-sm text-black bg-white shadow-lg text-sm">
                            <div className="mt-4">
                                <span className="text-xs font-semibold">Import File Duplicates: <span className="bg-red-100 px-3 py-1 rounded-xl text-black text-xs">{duplicates.length}</span></span>
                                <p className="text-xs mt-2">These are the fields to consider before tagging them as duplicates: <code className="font-bold text-red-400">PO Numbe, Pull PO, SKU, Item-Type</code></p>
                                <table className="w-full border mt-2">
                                    <thead>
                                        <tr className="bg-[#1F2937] text-left text-white text-xs">
                                            <th className="border p-2">PO Number</th>
                                            <th className="border p-2">Pull PO</th>
                                            <th className="border p-2">SKU</th>
                                            <th className="border p-2">Brand</th>
                                            <th className="border p-2">Segment</th>
                                            <th className="border p-2">Item-Type</th>
                                            <th className="border p-2">UPC</th>
                                            <th className="border p-2">ASIN</th>
                                            <th className="border p-2">Item Cost</th>
                                            <th className="border p-2">Disc. Cost</th>
                                            <th className="border p-2">Qty</th>
                                            <th className="border p-2">Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-black">
                                        {paginate(duplicates, duplicatesPage).map((item, index) => (
                                            <tr key={index} className="border text-xs">
                                                <td className="border p-1">{item["PO"]}</td>
                                                <td className="border p-1">{item["Pull PO"]}</td>
                                                <td className="border p-1">{item["SKU"]}</td>
                                                <td className="border p-1">{item["Brand"]}</td>
                                                <td className="border p-1">{item["Segment"]}</td>
                                                <td className="border p-1">{item["Item-Type"]}</td>
                                                <td className="border p-1">{item["UPC"]}</td>
                                                <td className="border p-1">{item["ASIN"]}</td>
                                                <td className="border p-1">{item["Item Cost"]}</td>
                                                <td className="border p-1">{item["Disc. Cost"]}</td>
                                                <td className="border p-1">{item["Qty"]}</td>
                                                <td className="border p-1">{item["Total Cost"]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination Controls */}
                                <div className="mt-6 mb-2 flex items-center justify-center gap-10">
                                    <button 
                                        disabled={duplicatesPage === 1} 
                                        onClick={() => setDuplicatesPage(duplicatesPage - 1)}
                                        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span>Page {duplicatesPage} of {Math.ceil(duplicates.length / itemsPerPage)}</span>
                                    <button 
                                        disabled={duplicatesPage * itemsPerPage >= duplicates.length} 
                                        onClick={() => setDuplicatesPage(duplicatesPage + 1)}
                                        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Existing Duplicates Table from Database with Pagination */}
                    {existingDuplicates.length > 0 && (
                        <div className="mt-4 p-4 border rounded-sm text-black bg-white shadow-lg text-sm">
                            <div className="mt-4">
                                <span className="text-xs font-semibold">
                                    Database Duplicates: <span className="bg-red-100 px-3 py-1 rounded-xl text-black text-xs">{existingDuplicates.length}</span>
                                </span>
                                <p className="text-xs mt-2">These are the fields to consider before tagging them as duplicates: <code className="font-bold text-red-400">PO Numbe, Pull PO, SKU, Item-Type</code></p>
                                <table className="w-full border mt-2">
                                    <thead>
                                        <tr className="bg-[#1F2937] text-left text-white text-xs">
                                            <th className="border p-2">PO Number</th>
                                            <th className="border p-2">Pull PO</th>
                                            <th className="border p-2">SKU</th>
                                            <th className="border p-2">Brand</th>
                                            <th className="border p-2">Segment</th>
                                            <th className="border p-2">Item-Type</th>
                                            <th className="border p-2">UPC</th>
                                            <th className="border p-2">ASIN</th>
                                            <th className="border p-2">Item Cost</th>
                                            <th className="border p-2">Disc. Cost</th>
                                            <th className="border p-2">Qty</th>
                                            <th className="border p-2">Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-black">
                                        {paginate(existingDuplicates, existingDuplicatesPage).map((item, index) => {
                                            const { poNumber, brand, segment, pullPONumber, sku, itemType, upc, asin, title, itemCost, discCost, qty, totalCost } = item[0];
                                            return <tr key={index} className="border text-xs">
                                                <td className="border p-1">{poNumber}</td>
                                                <td className="border p-1">{pullPONumber}</td>
                                                <td className="border p-1 w-46">{sku}</td>
                                                <td className="border p-1 px-4">{brand}</td>
                                                <td className="border p-1">{segment}</td>
                                                <td className="border p-1">{itemType}</td>
                                                <td className="border p-1">{upc}</td>
                                                <td className="border p-1">{asin}</td>
                                                <td className="border p-1">{itemCost}</td>
                                                <td className="border p-1">{discCost}</td>
                                                <td className="border p-1">{qty}</td>
                                                <td className="border p-1">{totalCost}</td>
                                            </tr>    
                                        })}
                                    </tbody>
                                </table>
                                
                                {/* Pagination Controls */}
                                <div className="mt-6 mb-2 flex justify-center items-center gap-10">
                                    <button 
                                        disabled={existingDuplicatesPage === 1} 
                                        onClick={() => setExistingDuplicatesPage(existingDuplicatesPage - 1)}
                                        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span>Page {existingDuplicatesPage} of {Math.ceil(existingDuplicates.length / itemsPerPage)}</span>
                                    <button 
                                        disabled={existingDuplicatesPage * itemsPerPage >= existingDuplicates.length} 
                                        onClick={() => setExistingDuplicatesPage(existingDuplicatesPage + 1)}
                                        className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}