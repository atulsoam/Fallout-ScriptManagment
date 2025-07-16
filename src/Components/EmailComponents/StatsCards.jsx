const StatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[
      { label: 'Total Emails', value: stats.total, bg: 'bg-gray-50', text:'text-gray-800' },
      { label: 'Sent', value: stats.sent, bg: 'bg-green-50', text:'text-green-800' },
      { label: 'Failed', value: stats.failed, bg: 'bg-red-50', text:'text-red-800' },
      { label: 'Pending', value: stats.pending, bg: 'bg-yellow-50', text:'text-yellow-800' },
    ].map((card, i) => (
      <div key={i} className={`${card.bg} p-4 rounded-lg shadow border text-center`}>
        <p className={`text-sm ${card.text}`}>{card.label}</p>
        <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
      </div>
    ))}
  </div>
);

export default StatsCards;
