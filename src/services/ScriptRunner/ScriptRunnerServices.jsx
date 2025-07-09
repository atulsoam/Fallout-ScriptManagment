import axios from 'axios';
import { API_BASE } from '../../utils/Config';

export const getScripts = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.get(`${API_BASE}/scripts`);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getAllScripts = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.get(`${API_BASE}/AllScripts`);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getRunningScripts = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.get(`${API_BASE}/running-scripts`);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const runScript = (scriptName) => {
  // runScript already has its own loading handling
  const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
  const cuid = storedAuth.cuid || "";
  return axios.post(`${API_BASE}/run-script`, { scriptName, "Cuid": cuid });
};

export const terminateScript = async (execId, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.post(`${API_BASE}/stop`, { execId });
  } finally {
    if (setLoading) setLoading(false);
  }
};
