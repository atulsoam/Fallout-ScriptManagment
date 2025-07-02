import React, { useEffect, useState } from "react";
import SummaryCard from "../Components/MainDashboard/SummaryCard";
import PieChartCard from "../Components/MainDashboard/PieChartCard";
import BarChartCard from "../Components/MainDashboard/BarChartCard";
import ResultSummaryPie from "../Components/MainDashboard/ResultSummaryPie";
import TopExecutedBar from "../Components/MainDashboard/TopExecutedBar";
import ScriptHealthTable from "../Components/MainDashboard/ScriptHealthTable";
import ScheduledJobsByScriptCard from "../Components/MainDashboard/ScheduledJobsByScriptCard";
import ScheduledJobPriorityChart from "../Components/MainDashboard/ScheduledJobPriorityChart";
import RejectionReasonsCard from "../Components/MainDashboard/RejectionReasonsCard";

import { FaTasks, FaCalendarAlt, FaPlayCircle } from "react-icons/fa";
import { DashboardData } from "../services/Dashboard/MainDashboardServices";
import { toast } from "react-toastify";
import SkeletonCard from "../Components/MainDashboard/skeletonCard";

const SectionDivider = ({ title }) => (
  <div className="flex items-center my-8">
    <div className="flex-grow border-t border-gray-300"></div>
    <span className="mx-4 text-gray-600 font-semibold uppercase tracking-wide">
      {title}
    </span>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

const Dashboard = () => {
  const [selectedDays, setSelectedDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    DashboardData(setLoading, selectedDays)
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [selectedDays]);

  if (!stats || loading) {
    return (
      <div className="space-y-8 p-8 bg-gray-50 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
        <SkeletonCard height="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8 bg-gray-50 max-w-7xl mx-auto">
      <div className="mb-6">
        <label htmlFor="days" className="mr-2 font-medium text-gray-700">
          Show data for last:
        </label>
        <select
          id="days"
          value={selectedDays}
          onChange={(e) => setSelectedDays(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>7 days</option>
          <option value={15}>15 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
        </select>
      </div>

      <section>
        <SectionDivider title="Summary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Scripts"
            value={stats.TotalScripts}
            icon={<FaTasks />}
          />
          <SummaryCard
            title="Scheduled Jobs"
            value={stats.ScheduledJobs.Total}
            icon={<FaCalendarAlt />}
          />
          <SummaryCard
            title="Completed Executions"
            value={stats.ExecutionStatuses.Completed}
            icon={<FaPlayCircle />}
          />
        </div>
      </section>

      <section>
        <SectionDivider title="Execution Trends & Script Types" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BarChartCard
            title="Daily Execution Trend"
            data={stats.DailyExecutionTrend}
          />
          <PieChartCard title="Scripts by Type" data={stats.ScriptTypes} />
        </div>
      </section>

      <section>
        <SectionDivider title="Top Scripts & Script Health" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopExecutedBar data={stats.TopExecutedScripts} />
          <ScriptHealthTable
            data={stats.ScriptHealthSummary}
            title="Script Health Summary (Completed vs Failed)"
          />
        </div>
      </section>
      <section>
        <SectionDivider title="Scheduled Jobs By Script" />
        <ScheduledJobsByScriptCard
          scheduledJobsByScript={stats.ScheduledJobsByScript}
        />
      </section>
      <section>
        <SectionDivider title="Result Summary & Other Pie Charts" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultSummaryPie data={stats.ResultSummary} />
          <PieChartCard
            title="Executions by Status"
            data={stats.ExecutionStatuses}
          />
          <PieChartCard title="Script Subtypes" data={stats.ScriptSubTypes} />
          <PieChartCard title="Execution Origin" data={stats.ExecutedFrom} />
        </div>
      </section>





    </div>
  );
};

export default Dashboard;
