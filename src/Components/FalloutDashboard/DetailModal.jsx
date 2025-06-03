import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DetailModal = ({ open, onClose, rowData }) => {
  const [activeTab, setActiveTab] = useState('tab1');
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [error, setError] = useState(null);

  const fetchTabData = async (tab, row) => {
    setLoading(true);
    setError(null);

    try {
      if (!row) {
        setHtmlContent('');
        setJsonData(null);
        setIframeUrl('');
        setLoading(false);
        return;
      }

      if (tab === 'tab1') {
        const res = await fetch(`/api/details/html?id=${row.id}`);
        if (!res.ok) throw new Error('Failed to load HTML content');
        const html = await res.text();
        setHtmlContent(html);
      } else if (tab === 'tab2') {
        const res = await fetch(`/api/details/json?id=${row.id}`);
        if (!res.ok) throw new Error('Failed to load JSON data');
        const json = await res.json();
        setJsonData(json);
      } else if (tab === 'tab3') {
        setIframeUrl(`https://example.com/frame?id=${row.id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && rowData) {
      fetchTabData(activeTab, rowData.row);
    } else {
      setHtmlContent('');
      setJsonData(null);
      setIframeUrl('');
      setError(null);
    }
  }, [open, activeTab, rowData]);

  useEffect(() => {
    if (open) setActiveTab('tab1');
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto p-8 flex flex-col shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Details for ID:{' '}
              <span className="text-indigo-600">{rowData?.row?.ban ?? '-'}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              ✕
            </button>
          </header>

          <nav className="flex space-x-4 border-b border-gray-200 mb-4">
            {[
              { id: 'tab1', label: 'HTML' },
              { id: 'tab2', label: 'JSON' },
              { id: 'tab3', label: 'Iframe' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`pb-2 font-medium text-sm cursor-pointer focus:outline-none ${activeTab === id
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-indigo-500'
                  }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-auto min-h-[200px]">
            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
              <>
                {activeTab === 'tab1' && (
                  <div
                    className="max-w-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )}
                {activeTab === 'tab2' && (
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[400px]">
                    {JSON.stringify(jsonData, null, 2)}
                  </pre>
                )}
                {activeTab === 'tab3' && iframeUrl && (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-[400px] border rounded"
                    title="Iframe content"
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailModal;
