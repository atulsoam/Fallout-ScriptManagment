import { useState } from 'react';
import {
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon,
    UserIcon,
    ClockIcon,
    TagIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/solid';
import ViewCodeModal from '../ScriptUploader/ViewCodeModal';

export default function PendingScriptCard({ script, onApprove, onReject }) {
    const [showCode, setShowCode] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5 flex flex-col h-full w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 break-words max-w-full">
                    {script.name}
                </h3>
                <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    {script.status || 'Pending'}
                </span>
            </div>

            {/* Body Content */}
            <div className="space-y-3 text-sm text-gray-700 flex-1 overflow-hidden">
                <InfoRow icon={DocumentTextIcon} label="Script Type" value={script.scriptType} />
                <InfoRow icon={TagIcon} label="Type" value={script.scriptType} />
                <InfoRow icon={AdjustmentsHorizontalIcon} label="Subtype" value={script.scriptSubType} />
                <InfoRow icon={UserIcon} label="Uploaded by" value={script.uploadedBy} />
                <InfoRow
                    icon={ClockIcon}
                    label="Requested on"
                    value={new Date(script.uploadedAt || script.createdAt).toLocaleString()}
                />

                {script.description && (
                    <div className="mt-2 max-h-32 overflow-auto pr-1">
                        <p className="text-gray-700 break-words whitespace-pre-wrap text-sm">
                            <span className="font-semibold">Description:</span> {script.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button
                    onClick={() => setShowCode(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center transition"
                >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Code
                </button>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={onApprove}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md w-full sm:w-auto"
                    >
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Approve
                    </button>
                    <button
                        onClick={onReject}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md w-full sm:w-auto"
                    >
                        <XCircleIcon className="h-5 w-5 mr-1" />
                        Reject
                    </button>
                </div>
            </div>

            {/* Modal */}
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

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2 text-gray-700 break-words">
            <Icon className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
                <span className="text-gray-600">{label}:</span>{' '}
                <span className="font-medium">{value}</span>
            </div>
        </div>
    );
}
