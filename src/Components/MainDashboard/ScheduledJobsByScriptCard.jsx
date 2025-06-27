import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const daysOfWeekFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const daysOfWeekShort = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const getDayIndex = (day) => daysOfWeekShort.indexOf(day.toLowerCase());

const ScheduledJobsSummary = ({ scheduledJobsByScript }) => {
  const [selectedScript, setSelectedScript] = useState("All Scripts");

  // Filtered data based on selection
  const filteredData = useMemo(() => {
    if (selectedScript === "All Scripts") return scheduledJobsByScript;

    // Return only selected script data, or empty if not found
    return scheduledJobsByScript[selectedScript] ? { [selectedScript]: scheduledJobsByScript[selectedScript] } : {};
  }, [selectedScript, scheduledJobsByScript]);

  // Aggregate job counts by day of week across filtered scripts
  const dayCounts = useMemo(() => {
    const counts = {};
    Object.values(filteredData).forEach(({ daysOfWeek }) => {
      daysOfWeek.forEach(day => {
        counts[day] = (counts[day] || 0) + 1;
      });
    });
    return counts;
  }, [filteredData]);

  // Prepare heatmap and line chart data
  const maxCount = Math.max(...Object.values(dayCounts), 1);

  // Line chart data
  const lineChartData = daysOfWeekShort.map((day, i) => ({
    day: daysOfWeekFull[i].slice(0, 3),
    jobs: dayCounts[day] || 0,
  }));

  // Textual summary calculations
  const totalJobs = Object.values(dayCounts).reduce((acc, val) => acc + val, 0);
  const busiestDay = Object.entries(dayCounts).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ["none", 0]);
  const leastBusyDay = Object.entries(dayCounts).reduce((min, entry) => (entry[1] < min[1] ? entry : min), ["none", Infinity]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-8 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Jobs Summary</h3>

      {/* Script Selector */}
      <div className="mb-6">
        <label htmlFor="script-select" className="block text-gray-700 mb-2 font-medium">
          Select Script
        </label>
        <select
          id="script-select"
          value={selectedScript}
          onChange={(e) => setSelectedScript(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
        >
          <option>All Scripts</option>
          {Object.keys(scheduledJobsByScript).map((script) => (
            <option key={script} value={script}>
              {script}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}
      <div>
        <h4 className="text-gray-700 font-semibold mb-4">Job Frequency by Day of Week (Heatmap)</h4>
        <div className="flex justify-between max-w-xl mx-auto">
          {daysOfWeekShort.map((day, idx) => {
            const count = dayCounts[day] || 0;
            const intensity = (count / maxCount) * 100; // for opacity

            return (
              <div key={day} className="flex flex-col items-center">
                <div
                  title={`${count} jobs`}
                  className="w-12 h-12 rounded-md transition-colors border border-gray-200"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${intensity / 100})` }}
                />
                <span className="mt-2 text-xs font-medium text-gray-600">{daysOfWeekFull[idx]}</span>
                <span className="text-sm font-semibold text-gray-800 mt-1">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line Chart */}
      <div>
        <h4 className="text-gray-700 font-semibold mb-4">Job Frequency by Day of Week (Line Chart)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      
    </div>
  );
};

export default ScheduledJobsSummary;
