"use client";
import React, { useState, useEffect } from "react";

import { MdFileUpload, MdAutoAwesomeMotion, MdAppRegistration } from "react-icons/md";

import DragDropFileUpload from "./components/import";
import BatchImportsTable from "./components/history-uploads";

const TABS = [
    { name: "Management", icon: <MdAppRegistration size='20px' /> },
    { name: "History Uploads", icon: <MdAutoAwesomeMotion size='20px' /> },
    { name: "Import", icon: <MdFileUpload size='20px' /> },
];

export default function InvoiceAuditRecordsPage() {
    const [activeTab, setActiveTab] = useState("Management");

    return (
        <div className="p-6" suppressHydrationWarning>
            <h1 className="text-lg font-bold mb-4">Invoice Audit Records</h1>

            {/* Menu Tabs */}
            <div className="bg-white p-4 shadow-md flex flex-row space-x-4 text-sm">
                {TABS.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`px-2 py-3 rounded-md flex flex-row justify-center min-w-40 ${activeTab === tab.name ? "bg-gray-800 text-white" : "bg-gray-200"}`}
                    >
                        <span className="flex flex-row gap-2">{tab.icon} {tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Page Content */}
            <main className="flex-1 p-6 overflow-auto">
                {activeTab === "Management" &&
                    <div>
                        Settings Content
                    </div>
                }
                {activeTab === "Import" &&
                    <div>
                        <DragDropFileUpload />
                    </div>
                }
                {activeTab === "History Uploads" &&
                    <div>
                        <BatchImportsTable />
                    </div>
                }
            </main>
        </div>
    );
}