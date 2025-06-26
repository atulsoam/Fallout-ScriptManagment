import React, { useState } from "react";
import { FaUpload, FaPlus } from "react-icons/fa";
import AddTypeModal from "./AddTypeModal"; // import this
import { API_BASE } from "../../utils/Config";
const ScriptUploader = (
    {
        HandleOnSubmit,
        handleDrop,
        handleFileSelect,
        file,
        isUploaded,
        uploadProgress,
        handleFormChange,
        formData,
        scriptSubTypes,
        scriptTypes,
        handleAddType,
        handleAddSubType
    }) => {
    const [showTypeModal, setShowTypeModal] = useState(false);
    const [showSubTypeModal, setShowSubTypeModal] = useState(false);





    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="max-w-2xl mx-auto p-6 border border-gray-300 rounded-xl shadow-md bg-white transition hover:shadow-lg"
        >


            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Upload Python Script</h2>

            {!file && (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
                    <input
                        type="file"
                        accept=".py"
                        className="hidden"
                        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                    />
                    <FaUpload className="text-blue-500 text-3xl mb-2" />
                    <p className="text-sm text-blue-700">Click or drag your Python (.py) script here</p>
                </label>
            )}

            {file && !isUploaded && (
                <div className="mt-6">
                    <p className="text-gray-700 font-medium truncate">{file.name}</p>
                    <div className="mt-2 w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-sm text-right text-blue-600 mt-1">{uploadProgress}%</p>
                </div>
            )}

            {isUploaded && (
                <div className="mt-6 space-y-6">
                    {/* Script Type */}
                    <div className="relative">
                        <select
                            name="scriptType"
                            value={formData.scriptType}
                            onChange={(e) => {
                                if (e.target.value === "__add_new__") {
                                    setShowTypeModal(true);
                                } else {
                                    handleFormChange(e);
                                }
                            }}
                            className="peer block w-full appearance-none border border-gray-300 bg-white px-4 pt-6 pb-2 rounded-md shadow-sm"
                        >
                            <option value="" disabled hidden />
                            {scriptTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                            <option value="__add_new__">➕ Add New Type</option>
                        </select>

                        <label className="absolute left-4 top-2 text-gray-500 text-sm peer-focus:text-blue-600">
                            Script Type
                        </label>
                    </div>

                    {/* Script Sub Type */}
                    <div className="relative">
                        <select
                            name="scriptSubType"
                            value={formData.scriptSubType}
                            onChange={(e) => {
                                if (e.target.value === "__add_new__") {
                                    setShowSubTypeModal(true);
                                } else {
                                    handleFormChange(e);
                                }
                            }}
                            className="peer block w-full appearance-none border border-gray-300 bg-white px-4 pt-6 pb-2 rounded-md shadow-sm"
                        >
                            <option value="" disabled hidden />
                            {scriptSubTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                            <option value="__add_new__">➕ Add New Subtype</option>
                        </select>

                        <label className="absolute left-4 top-2 text-gray-500 text-sm peer-focus:text-blue-600">
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
                        <label className="absolute left-4 top-2 text-gray-500 text-sm peer-focus:text-blue-600">
                            Description
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={HandleOnSubmit}
                        className="w-full inline-flex items-center justify-center px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                        <FaUpload className="mr-2" />
                        Submit Script Metadata
                    </button>
                </div>
            )}
            <br />
            <br />
            {/* Info Section */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">How to Upload a Script</h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>Select a valid <strong>.py</strong> Python script (max size: <strong>10MB</strong>).</li>
                    <li>Wait for the upload to complete (100%).</li>
                    <li>Fill in the <strong>script type, subtype, and description</strong>.</li>
                    <li>Submit the script metadata to finish.</li>
                </ol>
            </div>

            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md text-yellow-800 text-sm">
                ⚠️ Please ensure your script does not contain sensitive credentials or production secrets.
            </div>

            {showTypeModal && (
                <AddTypeModal
                    title="Add Script Type"
                    onClose={() => setShowTypeModal(false)}
                    onAdd={handleAddType}
                />
            )}

            {showSubTypeModal && (
                <AddTypeModal
                    title="Add Script Subtype"
                    onClose={() => setShowSubTypeModal(false)}
                    onAdd={handleAddSubType}
                />
            )}

        </div>
    );
};

export default ScriptUploader;
