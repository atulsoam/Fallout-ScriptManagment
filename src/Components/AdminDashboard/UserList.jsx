import React, { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../services/AdminServices/Adminservices';
import {
  FaUser,
  FaEnvelope,
  FaIdBadge,
  FaSearch,
  FaSpinner,
  FaEdit,
  FaCheck,
  FaTimes,
  FaTrash
} from 'react-icons/fa';
import { deleteUser } from '../../services/AdminServices/Adminservices';
import { toast } from 'react-toastify';
import colors from '../../utils/Colors';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingCuid, setEditingCuid] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers(setLoading);
        const data = res.data || [];
        setUsers(data);
        setFiltered(data);
      } catch (err) {
        setError('Failed to load users.');
        // toast.error('Failed to load users.')
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      result = result.filter((user) =>
        user.cuid.toLowerCase().includes(search.toLowerCase()) ||
        (user.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user) =>
        roleFilter === 'admin'
          ? user.isAdmin
          : roleFilter === 'approver'
            ? user.isApprover
            : true
      );
    }

    setFiltered(result);
  }, [search, roleFilter, users]);

  const startEditing = (user) => {
    setEditingCuid(user.cuid);
    setEditedData({ ...user });
    setError('');
  };

  const cancelEdit = () => {
    setEditingCuid(null);
    setEditedData({});
    setError('');
  };

  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!editedData.cuid) return;

    if (!editedData.username?.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    if (
      !editedData.email?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedData.email.trim())
    ) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const { _id, cuid, ...updates } = editedData;
      await updateUser({ cuid, updates });

      setUsers((prev) =>
        prev.map((u) => (u.cuid === cuid ? editedData : u))
      );

      setEditingCuid(null);
      setEditedData({});
      toast.success("User Updated Succesfully")
    } catch (err) {
      setError('Failed to update user.');
      toast.error('Failed to update user.')
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteUser = async (cuid) => {

    try {
      setSaving(true);
      await deleteUser({ cuid }, setSaving);
      setUsers((prev) => prev.filter((u) => u.cuid !== cuid));
      toast.success("User Deleted Succesfully")

    } catch (err) {
      console.log(err);
      setError('Failed to delete user.');
      toast.error("Failed to delete user.")
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* Saving Overlay Spinner */}
      {saving && (
        <div className="absolute inset-0 z-20 bg-white/70 flex items-center justify-center">
          <FaSpinner className="text-blue-600 animate-spin" size={32} />
        </div>
      )}

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-6xl mx-auto mt-8 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <FaIdBadge className="mr-2 text-blue-600" />
          All Users
        </h2>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by CUID, username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              disabled={saving}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-40"
            disabled={saving}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="approver">Approvers Only</option>
          </select>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="flex justify-center py-8 text-blue-600 animate-spin">
            <FaSpinner size={24} />
          </div>
        )}
        {error && (
          <p className="text-red-600 mb-4 bg-red-100 p-2 rounded">{error}</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            No matching users found.
          </p>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full table-auto border-collapse rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3">CUID</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Approver</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filtered.map(({ _id, cuid, username, email, isAdmin, isApprover }, idx) => {
                  const isEditing = editingCuid === cuid;
                  return (
                    <tr
                      key={idx}
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-all`}
                    >
                      <td className="px-4 py-3 flex items-center gap-2">
                        <FaUser className="text-blue-500" />
                        {cuid}
                      </td>

                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedData.username || ''}
                            onChange={(e) => handleFieldChange('username', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          username || '-'
                        )}
                      </td>

                      <td className="px-4 py-3 flex items-center gap-2">
                        <FaEnvelope className="text-gray-400" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedData.email || ''}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          email || '-'
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editedData.isAdmin || false}
                            onChange={(e) => handleFieldChange('isAdmin', e.target.checked)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        ) : isAdmin ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={editedData.isApprover || false}
                            onChange={(e) => handleFieldChange('isApprover', e.target.checked)}
                            className="w-5 h-5 cursor-pointer"
                          />
                        ) : isApprover ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-4">
                            <button onClick={saveChanges} disabled={saving} aria-label="Save" className="text-green-600 hover:text-green-800 transition">
                              <FaCheck size={18} />
                            </button>
                            <button onClick={cancelEdit} disabled={saving} aria-label="Cancel" className="text-red-600 hover:text-red-800 transition">
                              <FaTimes size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => startEditing({ _id, cuid, username, email, isAdmin, isApprover })}
                              aria-label="Edit"
                              className="text-blue-600 hover:text-blue-800 transition"
                              disabled={saving}
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteUser(cuid);
                              }}
                              aria-label="Delete"
                              className="text-red-600 hover:text-red-800 transition"
                              disabled={saving}
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;


