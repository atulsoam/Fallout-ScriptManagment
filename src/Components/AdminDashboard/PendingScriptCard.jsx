import { useState } from 'react';
import {
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    UserIcon,
    ClockIcon,
    TagIcon, AdjustmentsHorizontalIcon
} from '@heroicons/react/24/solid';
import ViewCodeModal from '../ScriptUploader/ViewCodeModal';

export default function PendingScriptCard({ script, onApprove, onReject }) {
    const [showCode, setShowCode] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-5 flex flex-col justify-between h-full">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">{script.name}</h3>
                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {script.status || 'Pending'}
                    </span>
                </div>

                <p className="text-sm text-gray-600 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-medium text-gray-700">{script.scriptType}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                    <TagIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Type: <span className="text-gray-800 font-medium ml-1">{script.scriptType}</span>
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Subtype: <span className="text-gray-800 font-medium ml-1">{script.scriptSubType}</span>
                </p>



                <p className="text-sm text-gray-600 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Uploaded by: <span className="ml-1 text-gray-800 font-medium">{script.uploadedBy}</span>
                </p>

                <p className="text-sm text-gray-600 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                    Requested on:{" "}
                    <span className="ml-1 text-gray-800 font-medium">
                        {new Date(script.uploadedAt || script.createdAt).toLocaleString()}
                    </span>
                </p>

                {script.description && (
                    <p className="text-sm text-gray-500 mt-2">
                        <span className="font-semibold text-gray-700">Description:</span> {script.description}
                    </p>
                )}
            </div>

            <div className="flex justify-between items-center mt-5">
                <button
                    onClick={() => setShowCode(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Code
                </button>

                <div className="space-x-2">
                    <button
                        onClick={onApprove}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Approve
                    </button>
                    <button
                        onClick={onReject}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                    >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Reject
                    </button>
                </div>
            </div>

            {showCode && (
                <ViewCodeModal
                    scriptName={script.name}
                    code={script.code}
                    onClose={() => setShowCode(false)}
                />
            )}
        </div>
    );
}
