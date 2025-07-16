import axios from 'axios';
import { API_BASE } from '../../utils/Config';

export const getCuidFromStorage = () => {
  const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
  return storedAuth.cuid || "";
};

export const createUser = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid, createdBy: cuid };
    return await axios.post(`${API_BASE}/admin/create-user`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const addApprover = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/add-approver`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const removeApprover = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/remove-approver`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const addAdmin = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/add-admin`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const removeAdmin = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/remove-admin`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getUsers = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    console.log(cuid);

    return await axios.get(`${API_BASE}/admin/users`, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const updateUser = async ({ cuid, updates }) => {
  const LogedINcuid = getCuidFromStorage();
  return await axios.put(`${API_BASE}/admin/update-user/${cuid}`, updates,
    {
      headers: { 'X-Requested-By': LogedINcuid }  // if needed as header, or skip this line
    }
  );
};

export const deleteUser = async (cuid, setLoading) => {
  setLoading(true);
  const LogedINcuid = getCuidFromStorage();
  const dataWithCuid = { ...cuid, requestedBy: LogedINcuid };
  const res = await axios.post(`${API_BASE}/admin/delete-user`, dataWithCuid);
  setLoading(false);
  return res;
};



export const getPendingAllScripts = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    return await axios.get(`${API_BASE}/admin/pending-approvals/all-scripts`, {
      headers: { 'X-Requested-By': cuid }
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getPendingScheduledScripts = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    return await axios.get(`${API_BASE}/admin/pending-approvals/scheduled-scripts`, {
      headers: { 'X-Requested-By': cuid }
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};


export const approveScript = async (scriptId) => {
  const cuid = getCuidFromStorage();
  return await axios.post(`${API_BASE}/approve/${scriptId}`, { cuid }, {
    headers: { 'X-Requested-By': cuid }
  });
};

// Reject script (POST with cuid and reason in body)
export const rejectScript = async (scriptId, reason) => {
  const cuid = getCuidFromStorage();
  return await axios.post(`${API_BASE}/reject/${scriptId}`, { cuid, reason }, {
    headers: { 'X-Requested-By': cuid }
  });
};


export const approveScheduledScript = async (jobId) => {
  const cuid = getCuidFromStorage();
  return await axios.patch(`${API_BASE}/admin/approve/${jobId}`, {}, {
    headers: { 'X-Requested-By': cuid }
  });
};

export const rejectScheduledScript = async (jobId, rejectReason) => {
  const cuid = getCuidFromStorage();
  return await axios.patch(`${API_BASE}/admin/reject/${jobId}`, { rejectReason }, {
    headers: { 'X-Requested-By': cuid }
  });
};
export const getAllPendingRequest = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    return await axios.get(`${API_BASE}/admin/pending-approvals`, {
      headers: { 'X-Requested-By': cuid }
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

/**
 * Fetch email history with optional filters and pagination.
 * 
 * @param {Object} params - Query params: page, limit, status, receiver, subject, fromDate, toDate
 * @param {Function} [setLoading] - Optional loading state setter
 * @returns {Promise<Object>} - Response data from backend
 */
export const getEmailHistory = async (params = {}, setLoading) => {
  if (setLoading) setLoading(true);

  try {
    const cuid = getCuidFromStorage();

    // Build query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `${API_BASE}/admin/email-history?${queryParams.toString()}`;

    const response = await axios.get(url, {
      headers: { 'X-Requested-By': cuid }
    });

    return response.data;
  } finally {
    if (setLoading) setLoading(false);
  }
};


