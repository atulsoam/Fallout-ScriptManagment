import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BarChartCard = ({ title, data }) => {
  const chartData = Object.entries(data).map(([key, value]) => ({ date: key, value }));
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default BarChartCard;
