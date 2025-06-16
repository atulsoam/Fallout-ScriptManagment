import React from 'react';
import { FaFileExport, FaSpinner } from 'react-icons/fa';
import classNames from 'classnames';
import { API_BASE } from '../../utils/Config'; // Adjust the import path as needed
import { useState } from 'react';
import ScriptDataModal from './ScriptStatusModal'
const statusStyles = {
  Completed: 'bg-green-100 text-green-700',
  Terminated: 'bg-red-100 text-red-700',
  Running: 'bg-yellow-100 text-yellow-700',
};

const HistoryTable = ({ data = [] }) => {
  const [exportingId, setExportingId] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCellClick = async (item, type) => {
    try {
      setModalOpen(true);
      setLoading(true);
      const response = await fetch(`${API_BASE}/getScriptDataByType`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionName: item.name,
          scriptId: item.id,
          type, // "Fixed", "Not Fixed", or "All"
        }),
      });

      const result = await response.json();
      setModalType(type);
      setModalData(result.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setModalOpen(false);
      alert('Failed to fetch data. Try again.');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left">Script Name</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Script Type</th>
            <th className="px-4 py-3 text-left">Start Time</th>
            <th className="px-4 py-3 text-left">End Time</th>
            <th className="px-4 py-3 text-right">Fixed</th>
            <th className="px-4 py-3 text-right">Not Fixed</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-right">Accounts Processed</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-6 text-gray-400 italic">
                No data found.
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={idx}
                className="hover:bg-blue-50 transition-colors border-b border-gray-100"
              >
                <td className="px-4 py-3 font-medium whitespace-nowrap">{item.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={classNames(
                      'px-2 py-1 rounded-full text-xs font-semibold inline-block',
                      statusStyles[item.status] || 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3">{item.startTime}</td>
                <td className="px-4 py-3">{item.endTime}</td>
                <td
                  className="px-4 py-3 text-right text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleCellClick(item, 'Fixed')}
                >
                  {item.fixed}
                </td>
                <td
                  className="px-4 py-3 text-right text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleCellClick(item, 'Not Fixed')}
                >
                  {item.notFixed}
                </td>
                <td
                  className="px-4 py-3 text-right text-blue-600 hover:underline cursor-pointer"
                  onClick={() => handleCellClick(item, 'All')}
                >
                  {item.total}
                </td>

                <td className="px-4 py-3 text-right">{item.processed}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    title="Export to Excel"
                    className="text-blue-600 hover:text-blue-800 transition disabled:opacity-50"
                    disabled={exportingId === item.id}
                    onClick={async () => {
                      try {
                        setExportingId(item.id);

                        const response = await fetch(`${API_BASE}/exportScriptData`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            collectionName: item.name,
                            scriptId: item.id,
                          }),
                        });

                        if (!response.ok) {
                          throw new Error("Failed to export data.");
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);

                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${item.name}_export.xlsx`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Export failed:', err);
                        alert("Export failed. Please try again.");
                      } finally {
                        setExportingId(null);
                      }
                    }}
                  >
                    {exportingId === item.id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaFileExport />
                    )}
                  </button>

                </td>
              </tr>
            ))
          )}
        </tbody>
        {data.length > 0 && (
          <tfoot className="bg-gray-50 font-semibold text-sm">
            <tr>
              <td colSpan="5" className="px-4 py-3 text-right border-t border-gray-200">
                Total
              </td>
              <td className="px-4 py-3 text-right border-t border-gray-200">{
                data.reduce((acc, cur) => acc + (cur.fixed || 0), 0)
              }</td>
              <td className="px-4 py-3 text-right border-t border-gray-200">{
                data.reduce((acc, cur) => acc + (cur.notFixed || 0), 0)
              }</td>
              <td className="px-4 py-3 text-right border-t border-gray-200">{
                data.reduce((acc, cur) => acc + (cur.total || 0), 0)
              }</td>
              <td className="px-4 py-3 text-right border-t border-gray-200">{
                data.reduce((acc, cur) => acc + (cur.processed || 0), 0)
              }</td>
              <td className="px-4 py-3 border-t border-gray-200"></td>
            </tr>
          </tfoot>
        )}
      </table>
      <ScriptDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        type={modalType}
      />
      {/* <ScriptDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={modalData}
        type={modalType}
        loading={loading}
      /> */}


    </div>

  );
};

export default HistoryTable;
