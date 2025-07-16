import React, { useEffect, useState } from "react";
import StatsCards from "../Components/EmailComponents/StatsCards";
import EmailStatusChart from "../Components/EmailComponents/EmailStatusChart";
import FiltersBar from "../Components/EmailComponents/FiltersBar";
import EmailTable from "../Components/EmailComponents/EmailTable";
import PaginationControls from "../Components/EmailComponents/PaginationControls";
import LoadingOverlay from "../Components/LoadingOverlay";
import {
  getEmailStats,
  getEmailHistory,
} from "../services/AdminServices/Adminservices";
import classNames from "classnames";
import { FaMailBulk } from "react-icons/fa";

const SkeletonCard = ({ height = "h-36" }) => (
  <div
    className={classNames(
      "bg-white rounded-lg shadow animate-pulse p-4 flex items-center justify-center",
      height
    )}
  >
    <div className="w-full space-y-2">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const SectionDivider = ({ title }) => (
  <div className="flex items-center my-8">
    <div className="flex-grow border-t border-gray-300"></div>
    <span className="mx-4 text-gray-600 font-semibold uppercase tracking-wide">
      {title}
    </span>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

const EmailDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "",
    receiver: "",
    subject: "",
    fromDate: "",
    toDate: "",
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    getEmailStats(setLoading).then(setStats);
  }, []);

  useEffect(() => {
    getEmailHistory(filters, setLoading)
      .then((res) => {
        setEmails(res.data);
        setTotal(res.total);
      })
      .catch(console.error);
  }, [filters]);

  if (!stats) {
    return (
      <div className="space-y-12 p-8 bg-gray-50 max-w-7xl mx-auto">
        <SectionDivider title="Loading Email Dashboard..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, idx) => (
            <SkeletonCard key={idx} height="h-64" />
          ))}
        </div>
      </div>
    );
  }
  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-12 p-8 bg-gray-50 max-w-7xl mx-auto">
      {/* Page Title */}
      <h2 className="text-3xl font-bold text-gray-800">📬 Email Dashboard</h2>

      {/* Summary */}
      <section>
        <SectionDivider title="Summary" />
        <div className="w-full">
          <StatsCards stats={stats} />
        </div>
      </section>

      {/* Charts */}
      <section>
        <SectionDivider title="Status Breakdown" />
        <div className="w-full">
          <EmailStatusChart stats={stats} />
        </div>
      </section>

      <SectionDivider title="Email History" />
      <section className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-6xl mx-auto mt-8 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <FaMailBulk className="mr-2 text-blue-600" />
          Email History
        </h2>
        <FiltersBar
          filters={filters}
          onChange={(field, value) =>
            setFilters((prev) => ({ ...prev, [field]: value, page: 1 }))
          }
        />
        <div className="mt-6">
          {!loading && (
            <>
              <EmailTable data={emails} />
              <PaginationControls
                currentPage={filters.page}
                totalItems={total}
                limit={filters.limit}
                onPageChange={(page) =>
                  setFilters((prev) => ({ ...prev, page }))
                }
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default EmailDashboardPage;
