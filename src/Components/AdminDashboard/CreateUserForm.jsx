import React, { useState } from 'react';
import { createUser, getCuidFromStorage } from '../../services/AdminServices/Adminservices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEnvelope, faSignature, faUserShield } from '@fortawesome/free-solid-svg-icons';
import colors from '../../utils/Colors'; // make sure this matches your login color utility
import { toast } from 'react-toastify';
const CreateUserForm = () => {
  const [form, setForm] = useState({
    cuid: '',
    password: '',
    email: '',
    username: '',
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setError('');
    setSuccess('');
  };

  const validate = () => {
    if (!form.cuid.trim() || !form.password.trim()) {
      setError('CUID and Password are required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setError('');
    try {
      await createUser(form, setLoading);
      const CreatedBy = getCuidFromStorage();
      setSuccess('✅ User created successfully!');
      toast.success("User created successfully!")
      setForm({
        cuid: '',
        password: '',
        email: '',
        username: '',
        isAdmin: false,
        createdBy: CreatedBy,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const inputs = [
    { name: 'cuid', placeholder: 'CUID', icon: faUser },
    { name: 'password', placeholder: 'Password', icon: faLock, type: showPassword ? 'text' : 'password', isPassword: true },
    { name: 'email', placeholder: 'Email', icon: faEnvelope, type: 'email' },
    { name: 'username', placeholder: 'Username', icon: faSignature },
  ];

  return (
    <div
      className="p-8 rounded-2xl shadow-lg w-full transition-all duration-300"
      style={{ backgroundColor: colors.surface }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.textPrimary }}>
        Create New User
      </h2>

      <div className="space-y-5">
        {inputs.map(({ name, placeholder, icon, type = 'text', isPassword }) => (
          <div key={name} className="relative">
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              style={{ border: `1px solid ${colors.border}`, color: colors.textPrimary }}
            />
            <FontAwesomeIcon icon={icon} className="absolute top-3.5 left-3" style={{ color: colors.icon }} />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3.5 right-3"
                style={{ color: colors.icon }}
              >
                <FontAwesomeIcon icon={showPassword ? faLock : faLock} />
              </button>
            )}
          </div>
        ))}

        <label className="flex items-center space-x-3 mt-2">
          <input
            type="checkbox"
            name="isAdmin"
            checked={form.isAdmin}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            <FontAwesomeIcon icon={faUserShield} className="mr-2" />
            Make this user an Admin
          </span>
        </label>

        {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md animate-shake">{error}</p>}
        {success && <p className="text-green-600 text-sm bg-green-100 p-2 rounded-md">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2 px-4 font-semibold rounded-xl transition duration-200"
          style={{
            backgroundColor: loading ? colors.primaryDisabled : colors.primary,
            color: colors.buttonText,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating User...' : 'Create User'}
        </button>
      </div>
    </div>
  );
};

export default CreateUserForm;
