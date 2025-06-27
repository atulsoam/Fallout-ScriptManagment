import React, { useState } from "react";
import { FaClipboard, FaCheck } from "react-icons/fa";
import Modal from "./Modal";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
const ViewCodeModal = ({ scriptName, code, onClose, language = "python" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Failed to Copy!"));
  };

  return (
    <Modal onClose={onClose} title={`Code: ${scriptName}`}>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          showLineNumbers
          wrapLines
          customStyle={{
            maxHeight: "70vh",
            maxWidth: "90vw",
            overflowY: "auto",
            borderRadius: "0.75rem",
            padding: "2rem 3.5rem 2rem 2rem", // leave space on right for copy button
            fontSize: "0.9rem",
            fontFamily: "'Fira Code', monospace",
            boxShadow: "0 6px 12px rgb(0 0 0 / 0.3)",
          }}
          lineNumberStyle={{ color: "#616e88", paddingRight: "1rem", userSelect: "none" }}
        >
          {code}
        </SyntaxHighlighter>

        {/* Copy button placed top right INSIDE the code block */}
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="absolute top-3 right-3 flex items-center gap-2 bg-gray-800 bg-opacity-80 hover:bg-green-600 hover:text-white text-green-400 px-3 py-1 rounded transition duration-200 shadow-md select-none"
          title={copied ? "Copied!" : "Copy to clipboard"}
          type="button"
        >
          {copied ? <FaCheck size={14} /> : <FaClipboard size={14} />}
          <span className="text-xs font-semibold">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold shadow"
          type="button"
        >
          Close
        </button>
      </div> */}
    </Modal>
  );
};

export default ViewCodeModal;
