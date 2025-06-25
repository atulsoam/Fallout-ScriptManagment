import axios from "axios";
import {API_BASE} from "../../utils/Config"
// services/ScriptScheduler/schedulerService.js


export const toggleJobStatus = async (jobId, enable) => {
  return axios.patch(`${API_BASE}/disable/${jobId}`, { enable});
};

export const scheduleJob = async (jobData) => {
  const response = await axios.post(`${API_BASE}/schedule`, jobData, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const unscheduleJob = async (jobId) => {
  const response = await axios.delete(`${API_BASE}/unschedule/${jobId}`);
  return response.data;
};

export const getJobs = async () => {
  const response = await axios.get(`${API_BASE}/jobs`); // Adjust to your endpoint
  return response.data;
};
