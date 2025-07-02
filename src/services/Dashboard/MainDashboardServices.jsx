import axios from "axios";
import {API_BASE} from "../../utils/Config"
// services/ScriptScheduler/schedulerService.js


export const DashboardData = async (setLoading,selectedDays) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.get(`${API_BASE}/dashboard?days=${selectedDays}`);
  } finally {
    if (setLoading) setLoading(false);
  }
};