import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const DailyExecutionChart = ({ data }) => {
  const chartData = Object.entries(data).map(([date, value]) => ({ date, value }));
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-gray-700 mb-2">Daily Execution Trend</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyExecutionChart;
