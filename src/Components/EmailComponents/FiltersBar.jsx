const FiltersBar = ({ filters, onChange }) => (
  <div className="flex flex-wrap gap-4 mb-6">
    <input
      className="border border-gray-300 rounded px-3 py-2 w-48"
      type="text" placeholder="Receiver"
      value={filters.receiver}
      onChange={e => onChange('receiver', e.target.value)}
    />
    <input
      className="border border-gray-300 rounded px-3 py-2 w-48"
      type="text" placeholder="Subject"
      value={filters.subject}
      onChange={e => onChange('subject', e.target.value)}
    />
    <select
      className="border border-gray-300 rounded px-3 py-2 w-40"
      value={filters.status}
      onChange={e => onChange('status', e.target.value)}
    >
      <option value="">All Status</option>
      <option value="Sent">Sent</option>
      <option value="Failed">Failed</option>
      <option value="Pending">Pending</option>
    </select>
    <input
      className="border border-gray-300 rounded px-3 py-2"
      type="date"
      value={filters.fromDate?.split('T')[0] || ''}
      onChange={e => onChange('fromDate', e.target.value ? `${e.target.value}T00:00:00` : '')}
    />
    <input
      className="border border-gray-300 rounded px-3 py-2"
      type="date"
      value={filters.toDate?.split('T')[0] || ''}
      onChange={e => onChange('toDate', e.target.value ? `${e.target.value}T23:59:59` : '')}
    />
  </div>
);

export default FiltersBar