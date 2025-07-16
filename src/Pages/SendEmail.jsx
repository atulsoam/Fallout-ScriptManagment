import React, { useState } from "react";
import { sendAdminEmail } from "../services/AdminServices/Adminservices";
import EmailPreview from "../Components/EmailComponents/EmailPreview";

const AdminSendEmail = () => {
  const [form, setForm] = useState({
    receiverList: "",
    ccList: "",
    recipientName: "",
    subject: "",
    msg: "",
    infoLink: "",
    information: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      receiverList: form.receiverList.split(",").map((email) => email.trim()),
      ccList: form.ccList
        ? form.ccList.split(",").map((email) => email.trim())
        : [],
      attachments: [],
    };

    try {
      setLoading(true);
      setMessage(null);

      const attachmentPromises = attachments.map(async (file) => {
        const content = await file.arrayBuffer();
        const base64Content = btoa(
          String.fromCharCode(...new Uint8Array(content))
        );
        return {
          filename: file.name,
          content: base64Content,
        };
      });

      payload.attachments = await Promise.all(attachmentPromises);
      const res = await sendAdminEmail(payload, setLoading);

      setMessage({
        type: "success",
        text: res.message || "Email sent successfully.",
      });
      setForm({
        receiverList: "",
        ccList: "",
        recipientName: "",
        subject: "",
        msg: "",
        infoLink: "",
        information: "",
      });
      setAttachments([]);
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.error || "Failed to send email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        📧 Send Email (Admin Only)
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-white p-6 rounded-lg shadow-md"
        >
          <div>
            <label className="block font-medium text-gray-700">
              To (comma separated)
            </label>
            <input
              type="text"
              name="receiverList"
              placeholder="e.g. user1@domain.com, user2@domain.com"
              value={form.receiverList}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              CC (optional)
            </label>
            <input
              type="text"
              name="ccList"
              placeholder="e.g. manager@domain.com"
              value={form.ccList}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Recipient Name
            </label>
            <input
              type="text"
              name="recipientName"
              value={form.recipientName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Message</label>
            <textarea
              name="msg"
              value={form.msg}
              onChange={handleInputChange}
              rows={5}
              className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">
                Info Link (optional)
              </label>
              <input
                type="url"
                name="infoLink"
                value={form.infoLink}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">
                Information Text (optional)
              </label>
              <input
                type="text"
                name="information"
                value={form.information}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mt-1 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700">
              Attachments
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 bg-gray-50"
            />
            {attachments.length > 0 && (
              <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc list-inside">
                {attachments.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded text-sm font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded shadow disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            📩 Live Email Preview
          </h3>
          <EmailPreview
            recipientName={form.recipientName}
            msg={form.msg}
            actionRequired={form.actionRequired}
            infoLink={form.infoLink}
            information={form.information}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminSendEmail;
