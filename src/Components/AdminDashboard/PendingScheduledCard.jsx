export default function PendingScheduledCard({ job, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 break-words">
          {job.scriptName}
        </h3>
        <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
          Pending
        </span>
      </div>

      {/* Metadata */}
      <div className="space-y-3 text-sm text-gray-700 flex-1 overflow-hidden">
        <InfoRow label="Frequency" value={job.frequency} />
        <InfoRow
          label="Time"
          value={`${job.time}`}
        />
        <InfoRow
          label="Days"
          value={job.daysOfWeek?.join(', ') || 'N/A'}
        />
        <InfoRow
          label="Requested At"
          value={new Date(job.createdAt).toLocaleString()}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
        <button
          onClick={onApprove}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md w-full sm:w-auto transition"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md w-full sm:w-auto transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

// Reusable InfoRow
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 text-gray-700 break-words">
      <span className="text-gray-600 min-w-[90px]">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
