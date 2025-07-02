// services/authService.js
import axios from 'axios';
import { API_BASE } from '../../utils/Config'; // Adjust the import path as needed

export const login = async ({ cuid, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/login`, { cuid, password }, {
      withCredentials: true,  // important for session cookies
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
};

export const signup = async ({ cuid, password, isAdmin = false }) => {
  try {
    const response = await axios.post(`${API_BASE}/signup`, { cuid, password, isAdmin }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(`${API_BASE}/logout`, {}, {
      withCredentials: true,
    });
    // localStorage.removeItem("authToken");
    localStorage.clear()
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    throw error;
  }
};

// Add this to services/authService.js

export const checkIfAdmin = async (cuid) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/is-admin/${cuid}`, {
      withCredentials: true,
    });
    return response.data; // expects updated user object
  } catch (error) {
    console.error('Admin check failed:', error.response?.data || error.message);
    throw error;
  }
};

