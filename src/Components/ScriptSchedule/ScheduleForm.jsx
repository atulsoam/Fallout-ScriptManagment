import React, { useState, useEffect } from "react";
import { scheduleJob } from "../../services/ScriptScheduler/schedulerService";
import { getScripts } from "../../services/ScriptRunner/ScriptRunnerServices";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";

const ScheduleForm = ({ onJobScheduled }) => {
  const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
  const cuid = storedAuth.cuid || "";

  const [formData, setFormData] = useState({
    scriptName: "",
    day: "mon",
    time: "",
    Cuid: cuid,
    metadata: { priority: "normal" },
    enabled: true,
  });

  const [scripts, setScripts] = useState([]);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const res = await getScripts(setLoadingScripts);
        if (Array.isArray(res.data)) {
          setScripts(res.data);
        }
      } catch (err) {
        console.error("Failed to load scripts", err);
      }
    };

    fetchScripts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "enabled") {
      setFormData((prev) => ({ ...prev, enabled: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMetadataChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, priority: e.target.value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      await scheduleJob(formData);
      setFeedback({ type: "success", message: "Job scheduled successfully." });
      toast.success("Job scheduled successfully.")
      onJobScheduled();
    } catch (error) {
      console.error("Schedule failed", error);
      setFeedback({ type: "error", message: "Failed to schedule job." });
      toast.error("Failed to schedule job.")
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg transition-all">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        📅 Schedule Script
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Script Dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Script
          </label>
          <select
            name="scriptName"
            value={formData.scriptName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Script --</option>
            {loadingScripts ? (
              <option disabled>Loading...</option>
            ) : (
              scripts.map((script) => (
                <option key={script} value={script}>
                  {script}
                </option>
              ))
            )}
          </select>
        </div>

        {/* CUID (Read-only) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            User ID (CUID)
          </label>
          <input
            type="text"
            name="Cuid"
            value={formData.Cuid}
            readOnly
            className="w-full border p-2 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Day + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Day
            </label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="*">Everyday</option>
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((day) => (
                <option key={day} value={day}>
                  {day.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Priority + Enable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              name="priority"
              value={formData.metadata.priority}
              onChange={handleMetadataChange}
              className="w-full border p-2 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleChange}
              className="accent-blue-600"
            />
            Enabled
          </label>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex justify-center items-center gap-2 bg-[#6366F1] text-[#FFFFFF] px-4 py-2 rounded-lg transition hover:bg-[#6366F1] ${submitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            {submitting && <FiLoader className="animate-spin" />}
            Schedule Script
          </button>
        </div>
      </form>

      {/* Feedback Message */}
      {feedback.message && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${feedback.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
            }`}
        >
          {feedback.type === "success" ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <FaExclamationCircle className="text-red-500" />
          )}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default ScheduleForm;
