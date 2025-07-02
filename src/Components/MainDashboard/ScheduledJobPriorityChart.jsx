
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const COLORS = {
  Jobs: "#4F46E5",
  AvgRun: "#10B981",
};

const ScheduledJobPriorityChart = ({ counts = {}, avgRun = {} }) => {
  if (!counts || !Object.keys(counts).length) return null;

  const chartData = Object.keys(counts).map((priority) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    Jobs: counts[priority],
    AvgRun: avgRun?.[priority] || 0,
  }));

  return (
    <div className="bg-white shadow rounded p-6">
      <h3 className="text-lg font-semibold mb-4">Job Priority Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 40, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="priority" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Jobs" fill={COLORS.Jobs}>
            <LabelList dataKey="Jobs" position="right" />
          </Bar>
          <Bar dataKey="AvgRun" fill={COLORS.AvgRun}>
            <LabelList dataKey="AvgRun" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScheduledJobPriorityChart;

