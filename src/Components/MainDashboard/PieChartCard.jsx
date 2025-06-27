import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f43f5e", "#a855f7", "#22c55e"];

const PieChartCard = ({ title, data }) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: key,
    value
  }));

  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col h-full">
      <h4 className="text-gray-700 mb-4 text-lg font-semibold">{title}</h4>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Chart Area */}
        <div className="flex-1 min-w-[200px] h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Area */}
        <div className="flex-1 overflow-auto max-h-[250px]">
          <ul className="text-sm text-gray-600 space-y-2">
            {chartData.map((entry, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full inline-block"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="truncate">{entry.name}</span>
                <span className="ml-auto font-medium">{entry.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PieChartCard;
