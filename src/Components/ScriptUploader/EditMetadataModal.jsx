import React, { useState } from "react";
import Modal from "./Modal";

const EditMetadataModal = ({ script, onClose, onSave }) => {
  const [form, setForm] = useState({
    scriptType: script.scriptType || "",
    scriptSubType: script.scriptSubType || "",
    description: script.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal onClose={onClose} title={`Edit Metadata: ${script.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Script Type
          </label>
          <select
            name="scriptType"
            value={form.scriptType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Script Type</option>
            <option value="Automation">Automation</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Deployment">Deployment</option>
            <option value="System">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Script Sub Type
          </label>
          <select
            name="scriptSubType"
            value={form.scriptSubType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="">Select Script Sub Type</option>
            <option value="Linux">Linux</option>
            <option value="Windows">Windows</option>
            <option value="Docker">Docker</option>
            <option value="System">System</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
            placeholder="Describe your script"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditMetadataModal;
