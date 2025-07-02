import { useEffect, useState } from 'react';
import {
  getPendingAllScripts,
  getPendingScheduledScripts,
  approveScheduledScript,
  rejectScheduledScript,
  approveScript,
  rejectScript
} from '../services/AdminServices/Adminservices';
import LoadingOverlay from '../Components/LoadingOverlay';
import PendingScriptCard from '../Components/AdminDashboard/PendingScriptCard';
import PendingScheduledCard from '../Components/AdminDashboard/PendingScheduledCard';
import { toast } from 'react-toastify';
export default function PendingApprovals() {
  const [scripts, setScripts] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scriptsRes, scheduledRes] = await Promise.all([
        getPendingAllScripts(),
        getPendingScheduledScripts()
      ]);
      setScripts(scriptsRes?.data?.pendingScripts || []);
      setScheduled(scheduledRes?.data?.pendingScheduled || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveScript = async (scriptId) => {
    setLoading(true)
    await approveScript(scriptId);
    fetchData();
    setLoading(false)
  };

  const handleRejectScript = (scriptId) => {
    setRejecting({ type: 'script', id: scriptId });
  };

  const handleApproveScheduled = async (jobId) => {
    setLoading(true)

    await approveScheduledScript(jobId);
    fetchData();
    setLoading(false)

  };

  const handleRejectScheduled = (jobId) => {
    setRejecting({ type: 'schedule', id: jobId });
  };

  const confirmReject = async () => {
    setLoading(true)

    if (!rejectReason.trim()) return;

    if (rejecting?.type === 'script') {
      await rejectScript(rejecting.id, rejectReason);
    } else {
      await rejectScheduledScript(rejecting.id, rejectReason);
    }

    setRejectReason("");
    setRejecting(null);
    fetchData();
    setLoading(false)

  };

  const cancelReject = () => {
    setRejecting(null);
    setRejectReason("");
  };

  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredScheduled = scheduled.filter(job =>
    job.scriptName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) return <LoadingOverlay/> 

  return (
    <div className="p-6 space-y-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Pending Approvals</h1>

      <input
        type="text"
        placeholder="Search scripts or scheduled jobs..."
        className="w-full p-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="text-center text-lg text-gray-500 mt-10">Loading pending approvals...</div>
      ) : (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Pending Scripts</h2>
            {filteredScripts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScripts.map(script => (
                  <PendingScriptCard
                    key={script._id}
                    script={script}
                    onApprove={() => handleApproveScript(script._id)}
                    onReject={() => handleRejectScript(script._id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No scripts match your search.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Pending Scheduled Scripts</h2>
            {filteredScheduled.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScheduled.map(job => (
                  <PendingScheduledCard
                    key={job._id}
                    job={job}
                    onApprove={() => handleApproveScheduled(job._id)}
                    onReject={() => handleRejectScheduled(job._id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No scheduled scripts match your search.</p>
            )}
          </section>
        </>
      )}

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-5 border border-gray-200">
            <h3 className="text-lg font-bold text-red-600">Confirm Rejection</h3>
            <p className="text-gray-600 text-sm">Please provide a reason for rejection. This will be visible to the uploader.</p>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelReject}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
