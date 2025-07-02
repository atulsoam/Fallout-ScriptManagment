import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  Completed: "#10b981", // green
  Failed: "#ef4444",    // red
};

const ScriptHealthTable = ({ title, data }) => {
  // Transform data from object to array suitable for recharts
  // [{ scriptName: "script1", Completed: 10, Failed: 2 }, ...]
  const chartData = Object.entries(data).map(([scriptName, stats]) => ({
    scriptName,
    Completed: stats.Completed || 0,
    Failed: stats.Failed || stats.Terminated || 0,
  }));

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-gray-700 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="scriptName" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Completed" stackId="a" fill={COLORS.Completed} />
          <Bar dataKey="Failed" stackId="a" fill={COLORS.Failed} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScriptHealthTable;
