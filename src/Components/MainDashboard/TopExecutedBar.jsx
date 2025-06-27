import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const TopExecutedBar = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-gray-700 mb-2">Top Executed Scripts</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopExecutedBar;
