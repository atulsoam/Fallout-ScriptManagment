import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#10B981", "#EF4444"];
const ResultSummaryPie = ({ data }) => {
  const chartData = [
    { name: "Fixed", value: data.Fixed },
    { name: "Not Fixed", value: data["Not Fixed"] }
  ];
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h4 className="text-gray-700 mb-2">Result Summary</h4>
      <PieChart width={200} height={200}>
        <Pie data={chartData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default ResultSummaryPie;
