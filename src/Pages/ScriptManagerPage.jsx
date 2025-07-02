import React, { useState, useEffect } from "react";
import ScriptUploader from "../Components/ScriptUploader/ScriptUploader";
import ScriptList from "../Components/ScriptUploader/ScriptList";
import { getAllScripts } from "../services/ScriptRunner/ScriptRunnerServices";
import { toast } from "react-toastify";
import { AddScripSubtType, AddScriptType, DeleteScript, fetchScriptTypes, UpdateScript } from "../services/ScriptUploader/ScritpUplaoderServices";
import LoadingOverlay from "../Components/LoadingOverlay";
import { uploadScript, getApprovers } from "../services/ScriptUploader/ScritpUplaoderServices";

const ScriptManagerPage = () => {
    const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
    const approverCuid = storedAuth.cuid || ""
    const [scripts, setScripts] = useState([]);
    const [loading, setLoading] = useState(true);
    const notifySuccess = (msg) => toast.success(msg);
    const notifyError = (msg) => toast.error(msg);
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploaded, setIsUploaded] = useState(false);
    const [scriptTypes, setScriptTypes] = useState([])
    const [scriptSubTypes, setScriptSubTypes] = useState([])
    const [allApprover, setAllApprover] = useState([])

    const setupScriptTypesSubTypes = () => {
        fetchScriptTypes(setLoading).then((res) => {
            const allTypes = res.data
            setScriptSubTypes(allTypes.scriptSubType)
            setScriptTypes(allTypes.scriptType)
        }).catch(() => notifyError("Failed to fetch scriptTypes & Subtypes"))
            .finally(() => setLoading(false))
    }
    const [formData, setFormData] = useState({
        scriptType: "",
        scriptSubType: "",
        description: "",
        approver: "", // add this
    });
    const fetchApprover = () => {
        getApprovers(setLoading)
            .then((res) => {
                setAllApprover(res.data);
            })
            .catch(() => notifyError("Failed to load approvers"))
            .finally(() => setLoading(false));
    }


    const handleFileSelect = (file) => {
        const isPython = file.name.endsWith(".py") || file.type === "text/x-python";
        if (!isPython) return alert("Only Python (.py) files are allowed.");
        if (file.size > 10 * 1024 * 1024) return alert("File too large (max 10MB)");

        setFile(file);
        simulateUpload();
    };

    const simulateUpload = () => {
        setUploadProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploaded(true);
            }
        }, 100);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    // Fetch scripts function
    const fetchScripts = async () => {
        getAllScripts(setLoading)
            .then((res) => {
                setScripts(res.data);
            })
            .catch(() => notifyError("Failed to load scripts"))
            .finally(() => setLoading(false));

    };

    useEffect(() => {
        fetchScripts();
        setupScriptTypesSubTypes()
        fetchApprover()
    }, []);

    // Update script metadata handler
    const handleUpdateScript = async (id, updatedData) => {

        UpdateScript(setLoading, id, updatedData)
            .then((res) => notifySuccess("Script data updated succesfully!"))
            .catch(() => notifyError("Script Update Failed"))
            .finally(() => {
                setLoading(false)
                fetchScripts();
            });


    };

    // Delete script handler
    const handleDeleteScript = async (id) => {

        DeleteScript(setLoading, id).then((res) => notifySuccess("Script Deleted Succesfully!"))
            .catch(() => notifyError("Failed deleting script!"))
            .finally(() => {
                setLoading(false)
                fetchScripts()
            });

    };
    const handleAddType = (newtype) => {
        AddScriptType(setLoading, { scriptType: newtype })
            .then((res) => {
                setupScriptTypesSubTypes()

                notifySuccess("ScriptType Added!")
            })
            .catch(() => notifyError("ScriptType Add Failed"))

    }
    const handleAddSubType = (newtype) => {
        AddScripSubtType(setLoading, { scriptSubType: newtype })
            .then((res) => {
                setupScriptTypesSubTypes()

                notifySuccess("ScriptSubType Added!")
            })
            .catch(() => notifyError("ScriptSubType Add Failed"))
    }

    const handleSubmit = async () => {
        if (!file) return;
        const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
        const cuid = storedAuth.cuid || "System";
        const reader = new FileReader();
        reader.onload = async (e) => {
            const payload = {
                name: file.name,
                code: e.target.result,
                uploadedBy: cuid,
                description: formData.description,
                scriptType: formData.scriptType || "System",
                scriptSubType: formData.scriptSubType || "System",
                approver: approverCuid
            };
            uploadScript(setLoading, payload).then((res) => notifySuccess("Script Uploaded succesfully"))
                .catch(() => notifyError("Script Upload Failed!")).finally(() => {
                    setFile(null);
                    setIsUploaded(false);
                    setFormData({ scriptType: "", scriptSubType: "", description: "" });
                    setLoading(false)
                    fetchScripts();

                })

        };

        reader.onerror = () => alert("Failed to read file content.");
        reader.readAsText(file);
    };
    if (loading) return <LoadingOverlay />;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Script Management Dashboard
            </h1>

            <div className="flex gap-8">


                {/* Right: Script Uploader */}
                <main className="w-1/2 bg-white rounded-xl shadow-md p-6 overflow-auto max-h-[calc(100vh-10rem)]">
                    <ScriptUploader
                        HandleOnSubmit={handleSubmit}
                        file={file}
                        handleDrop={handleDrop}
                        handleFileSelect={handleFileSelect}
                        handleFormChange={handleFormChange}
                        isUploaded={isUploaded}
                        uploadProgress={uploadProgress}
                        formData={formData}
                        scriptTypes={scriptTypes}
                        scriptSubTypes={scriptSubTypes}
                        handleAddType={handleAddType}
                        handleAddSubType={handleAddSubType}
                        approvers={allApprover}
                    />
                </main>
                {/* Left: Script List */}
                <aside className="w-1/2 bg-white rounded-xl shadow-md p-6 overflow-auto max-h-[calc(100vh-10rem)]">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Available Scripts</h2>
                    <ScriptList
                        scripts={scripts}
                        handleUpdateScript={handleUpdateScript}
                        handleDeleteScript={handleDeleteScript}
                    />
                </aside>
            </div>
        </div>
    );
};

export default ScriptManagerPage;
