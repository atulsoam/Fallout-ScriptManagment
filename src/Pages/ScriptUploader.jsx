// components/ScriptUploader.jsx
import React, { useState } from "react";
import { API_BASE } from "../utils/Config";

const ScriptUploader = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploaded, setIsUploaded] = useState(false);
    const [formData, setFormData] = useState({
        scriptType: "",
        scriptSubType: "",
        description: "",
    });

    const handleFileSelect = (file) => {
        const isPython = file.name.endsWith(".py") || file.type === "text/x-python";

        if (!isPython) {
            alert("Only Python (.py) files are allowed.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File too large (max 10MB)");
            return;
        }

        setFile(file);
        simulateUpload(file);
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const simulateUpload = (file) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploaded(true);
            }
        }, 150);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async (e) => {
            e.preventDefault()
            const code = e.target.result;

            const payload = {
                name: file.name,
                code,
                uploadedBy: "admin", // You can replace this with real user data
                description: formData.description,
                scriptType: formData.scriptType || "System",
                scriptSubType: formData.scriptSubType || "System",
            };

            try {
                const response = await fetch(`${API_BASE}/upload`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Upload failed");
                }

                const result = await response.json();
                alert(result.message);
            } catch (err) {
                alert("Upload error: " + err.message);
            }
        };

        reader.onerror = () => {
            alert("Failed to read file content.");
        };

        reader.readAsText(file);
    };


    return (
        <div
            className="max-w-xl mx-auto p-6 border-2 border-gray-300 rounded-lg shadow-md bg-white"
            onDrop={handleDrop}
            onDragOver={handleDrag}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
        >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Script</h2>

            {!file && (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <input
                        type="file"
                        accept=".py"

                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                        }}
                    />
                    <div className="flex flex-col items-center">
                        <svg
                            className="w-10 h-10 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0 0l-3-3m3 3l3-3M16 4a4 4 0 00-8 0v4a4 4 0 008 0V4z"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Click or drag a file to upload</p>
                    </div>
                </label>
            )}

            {file && !isUploaded && (
                <div className="mt-4">
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                        <div
                            className="bg-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-sm mt-1 text-right text-blue-700">{uploadProgress}%</p>
                </div>
            )}

            {isUploaded && (
                <div className="mt-6 space-y-6">
                    {/* Script Type */}
                    <div className="relative">
                        <select
                            name="scriptType"
                            value={formData.scriptType}
                            onChange={handleFormChange}
                            className="peer block w-full appearance-none border border-gray-300 bg-white px-4 pt-6 pb-2 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="" disabled hidden />
                            <option value="Automation">Automation</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Deployment">Deployment</option>
                        </select>
                        <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600">
                            Script Type
                        </label>
                    </div>

                    {/* Script Sub Type */}
                    <div className="relative">
                        <select
                            name="scriptSubType"
                            value={formData.scriptSubType}
                            onChange={handleFormChange}
                            className="peer block w-full appearance-none border border-gray-300 bg-white px-4 pt-6 pb-2 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="" disabled hidden />
                            <option value="Linux">Linux</option>
                            <option value="Windows">Windows</option>
                            <option value="Docker">Docker</option>
                        </select>
                        <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600">
                            Script Sub Type
                        </label>
                    </div>

                    {/* Description */}
                    <div className="relative">
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            rows="4"
                            placeholder=" "
                            className="peer block w-full border border-gray-300 px-4 pt-6 pb-2 rounded-md shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        ></textarea>
                        <label className="absolute left-4 top-2 text-gray-500 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600">
                            Description
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className="relative w-full inline-flex items-center justify-center px-4 py-2 font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group"
                    >
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                                className="w-5 h-5 text-white transition-transform duration-300 transform group-hover:rotate-12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0 0l-3-3m3 3l3-3M16 4a4 4 0 00-8 0v4a4 4 0 008 0V4z" />
                            </svg>
                        </span>
                        Upload Metadata
                    </button>
                </div>
            )}

        </div>
    );
};

export default ScriptUploader;
