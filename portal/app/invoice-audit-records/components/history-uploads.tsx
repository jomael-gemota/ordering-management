import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { FaEye, FaEyeSlash, FaLayerGroup } from "react-icons/fa";

interface Batch {
    batchId: string;
    importer: string;
    fileInfo: {
        name: string;
        size: number;
    };
    data: any[];
}

interface BatchRowProps {
  batch: Batch;
}

export default function BatchImportsTable() {
    const [batches, setBatches] = useState<Batch[] | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 8;

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/invoice-audit-records/purchase-orders/all-imports');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: Batch[] = await response.json();
                setBatches(result);
            } catch (e) {
                console.error('An error occurred while fetching the data: ', e);
            }
        };

        fetchBatches();
    }, []);

    const totalPages = batches ? Math.ceil(batches.length / rowsPerPage) : 0;
    const currentBatches = batches ? batches.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) : [];

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg text-black">
                <thead>
                    <tr className="bg-gray-100 border-b text-sm">
                        <th className="px-4 py-2 text-left">Batch ID</th>
                        <th className="px-4 py-2 text-left">Importer</th>
                        <th className="px-4 py-2 text-left">File Info</th>
                        <th className="px-14 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentBatches.length > 0 ? (
                        currentBatches.map((batch) => (
                            <BatchRow key={batch.batchId} batch={batch} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center text-sm p-4">Loading...</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-center items-center mt-4 text-sm gap-4">
                <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const BatchRow: React.FC<BatchRowProps> = ({ batch }) => {
    const [showData, setShowData] = useState(false);

    return (
        <tr className="border-b hover:bg-gray-50 text-sm">
            <td className="px-4 py-5">
                <span className="flex flex-row gap-4">
                    <FaLayerGroup size='20px' color="#007BFF" /> {batch.batchId}
                </span>
            </td>
            <td className="px-2 py-2">{batch.importer}</td>
            <td className="px-4 py-2">
                <p><strong>Name:</strong> {batch.fileInfo.name}</p>
                <p><strong>Size:</strong> {(batch.fileInfo.size / 1024).toFixed(2)} KB</p>
            </td>
            <td className="px-4 py-2">
                {!showData ? (
                    <button
                        onClick={() => setShowData(true)}
                        className="bg-[#6C757D] text-white px-3 py-1 rounded-md hover:bg[#6C757D] transition-all"
                    >
                        <div className="flex flex-row gap-2 py-1">
                            <FaEye size='20px' color="orange" /> Show Data
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={() => setShowData(false)}
                        className="bg-[#6C757D] text-white px-3 py-1 rounded-md hover:bg-[#6C757D] transition-all"
                    >
                        <div className="flex flex-row gap-2 py-1">
                            <FaEyeSlash size='20px' color="orange" /> Hide Data
                        </div>
                    </button>
                )}
                
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: showData ? 1 : 0, height: showData ? "auto" : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    {showData && (
                        <pre className="mt-2 p-2 bg-gray-200 rounded text-xs max-w-50 max-h-80 overflow-auto mb-5">
                            {JSON.stringify(batch.data, null, 2)}
                        </pre>
                    )}
                </motion.div>
            </td>
        </tr>
    );
};
