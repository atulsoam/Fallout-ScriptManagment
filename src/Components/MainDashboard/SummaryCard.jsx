const SummaryCard = ({ title, value, icon }) => (
  <div className="bg-white shadow rounded-lg p-4 flex items-center gap-4">
    {icon && <span className="text-2xl text-blue-500">{icon}</span>}
    <div>
      <h4 className="text-gray-500 text-sm">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);
export default SummaryCard;
