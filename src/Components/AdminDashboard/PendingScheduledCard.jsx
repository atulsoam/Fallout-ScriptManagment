export default function PendingScheduledCard({ job, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 p-5 flex flex-col justify-between h-full">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-800">{job.scriptName}</h3>
        <p className="text-sm text-gray-500">
          Frequency: <span className="text-gray-700 font-medium">{job.frequency}</span>
        </p>
        <p className="text-sm text-gray-500">
          Time: <span className="text-gray-700">{job.time}</span> | Days:{" "}
          <span className="text-gray-700">{job.daysOfWeek?.join(', ') || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-500">
          Requested At:{" "}
          <span className="text-gray-700">{new Date(job.createdAt).toLocaleString()}</span>
        </p>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={onApprove}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          className="px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
