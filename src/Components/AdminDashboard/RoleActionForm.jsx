import React, { useState } from 'react';
import { FaUserShield, FaUserPlus, FaUserTimes } from 'react-icons/fa';
import colors from '../../utils/Colors'; // make sure this path matches your project
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa'; // Add at top if not already

const iconMap = {
  approver: FaUserShield,
  admin: FaUserPlus,
  removeAdmin: FaUserTimes,
  removeApprover: FaUserTimes,
};

const RoleActionForm = ({ actionType, roleType, apiFunc }) => {
  const [cuid, setCuid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!cuid.trim()) {
      setError('CUID is required.');
      return;
    }

    try {
      await apiFunc({ cuid }, setLoading);
      setSuccess(`${roleType} ${actionType}ed successfully!`);
      setCuid('');
      toast.success(`${roleType} ${actionType}ed successfully!`)
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${actionType} ${roleType}.`);
      toast.error(`Failed to ${actionType} ${roleType}.`)
    }
  };

  const title = `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} ${roleType}`;
  const Icon = iconMap[`${actionType}${roleType.charAt(0).toUpperCase() + roleType.slice(1)}`] || iconMap[roleType] || FaUserPlus;

  return (
    <div
      className="p-6 rounded-2xl shadow-lg max-w-md w-full transition-all duration-300"
      style={{ backgroundColor: colors.surface }}
    >
      <div className="flex items-center mb-4">
        <Icon className="text-xl mr-2" style={{ color: colors.primary }} />
        <h3 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>{title}</h3>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Enter CUID"
          value={cuid}
          onChange={(e) => setCuid(e.target.value)}
          className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2"
          style={{
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
            backgroundColor: colors.input,
          }}
        />

        {error && (
          <p className="text-sm bg-red-100 text-red-700 p-2 rounded-md">{error}</p>
        )}
        {success && (
          <p className="text-sm bg-green-100 text-green-700 p-2 rounded-md">{success}</p>
        )}



        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 px-4 font-semibold rounded-xl flex justify-center items-center gap-2 transition duration-200"
          style={{
            backgroundColor: loading ? colors.disabled : colors.primary,
            color: colors.buttonText,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              {`${actionType}ing...`}
            </>
          ) : (
            title
          )}
        </button>

      </div>
    </div>
  );
};

export default RoleActionForm;
