import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#34D399', '#F87171', '#FBBF24'];

const RADIAN = Math.PI / 180;

// Custom label for Pie slices
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const EmailStatusChart = ({ stats }) => {
  const data = [
    { name: 'Sent', value: stats.sent || 0 },
    { name: 'Failed', value: stats.failed || 0 },
    { name: 'Pending', value: stats.pending || 0 },
  ];

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md w-full md:w-1/2">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Email Status Overview</h3>

      {total === 0 ? (
        <div className="text-center text-gray-400 italic">No email status data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: '12px' }}
              formatter={(value, name) => [`${value}`, `${name}`]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EmailStatusChart;
