import React, { useEffect, useState } from 'react';
import EmailTable from '../Components/EmailComponents/EmailTable';
import FiltersBar from '../Components/EmailComponents/FiltersBar';
import PaginationControls from '../Components/EmailComponents/PaginationControls';
import { getEmailHistory } from '../services/AdminServices/Adminservices';
import LoadingOverlay from '../Components/LoadingOverlay';

const EmailHistoryPage = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1, limit: 10, status: '', receiver: '', subject: '', fromDate: '', toDate: ''
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await getEmailHistory(filters, setLoading);
        setEmails(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error('Error fetching emails:', err);
      }
    };
    fetchEmails();
  }, [filters]);

  const onFilterChange = (field, value) =>
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));

  const onPageChange = (page) => setFilters(prev => ({ ...prev, page }));

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">📬 Email History</h2>
      <FiltersBar filters={filters} onChange={onFilterChange} />
      {loading ? (
        <LoadingOverlay />
      ) : (
        <>
          <EmailTable data={emails} />
          <PaginationControls
            currentPage={filters.page}
            totalItems={total}
            limit={filters.limit}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default EmailHistoryPage;
