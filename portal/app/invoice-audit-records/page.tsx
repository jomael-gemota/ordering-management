'use client';

import { useState } from 'react';

import DragDropFileUpload from './components/dragdrop-fileupload';

export default function InvoiceAuditRecordsPage() {
    const [data, setData] = useState([]);

    const handlePODetailsImport = () => {
        fetch(
            '/api/invoice-audit-records/po-details/import',
            {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            }
        ).then(res => res.json());
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Invoice Audit Records</h1>
            <DragDropFileUpload onFileParsed={setData} />
            <h2 className="text-lg font-semibold mt-4">Parsed Data:</h2>
            <pre className="bg-gray-100 p-4 rounded-md text-black">
                {JSON.stringify(data, null, 4)}
            </pre>
        </div>
    );
}