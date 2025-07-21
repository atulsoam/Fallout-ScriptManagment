import React, { useState } from 'react';
import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaCode,
  FaTerminal,
  FaCopy,
  FaCheck,
  FaDatabase,
} from 'react-icons/fa';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded flex items-center gap-1 absolute top-2 right-2"
      title="Copy to clipboard"
    >
      {copied ? <FaCheck /> : <FaCopy />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const CollapsibleSection = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex items-center gap-2 text-sm font-medium text-gray-700"
      >
        {icon}
        {title}
        <span className="ml-auto text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 py-4 bg-white">{children}</div>}
    </div>
  );
};

export default function ScriptStructure() {
  const threadExample = `import threading

def process_account(account_id):
    print(f"Processing account: {account_id}")

def main(exec_id):
    print(f"Script started with exec ID: {exec_id}")
    accounts = [1, 2, 3, 4, 5]
    threads = []

    for acc in accounts:
        t = threading.Thread(target=process_account, args=(acc,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    print("Script completed")`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white min-h-screen space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 flex justify-center items-center gap-2">
          <FaInfoCircle className="text-blue-600" />
          Script Structure Guide
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Build compatible and trackable scripts for execution.
        </p>
      </div>

      {/* Requirements */}
      <CollapsibleSection title="Script Requirements" icon={<FaCode className="text-green-600" />} defaultOpen>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Your script must define a <code className="bg-gray-100 px-1 rounded">main(exec_id)</code> function.</li>
          <li>Use <code>print()</code> for logging — logs will stream to the UI in real time.</li>
          <li>Avoid blocking infinite loops; always ensure the script terminates.</li>
        </ul>
      </CollapsibleSection>

      {/* Multithreading example */}
      <CollapsibleSection title="Multithreading Example" icon={<FaTerminal className="text-purple-600" />} defaultOpen>
        <div className="relative">
          <pre className="bg-gray-900 text-white text-sm rounded-lg p-4 overflow-x-auto">
            {threadExample}
          </pre>
          <CopyButton text={threadExample} />
        </div>
      </CollapsibleSection>

      {/* MongoDB rules */}
      <CollapsibleSection title="Saving Script Output to MongoDB" icon={<FaDatabase className="text-indigo-600" />}>
        <div className="text-sm text-gray-700 space-y-3">
          <p>
            Each script must save its output to a MongoDB collection named exactly after the script name.
            For example, if the script name is <code>pet1</code>, it should write data to the <code>pet1</code> collection.
          </p>

          <p>
            The backend will read script stats from that collection to compute status updates. Your script must store:
          </p>

          <ul className="list-disc pl-6 space-y-1">
            <li><strong>ScriptidentificationId</strong> – should match the <code>exec_id</code> passed to your script.</li>
            <li><strong>status</strong> – a label like <code>"Fixed"</code>, <code>"Not Fixed"</code>, etc.</li>
            <li><strong>otherDetail: "processedAccounts"</strong> – to store total account count.</li>
          </ul>

          <p>
            Here's a sample document:
          </p>

          <pre className="bg-gray-100 text-gray-800 text-sm rounded p-4 overflow-x-auto">
{`{
  "ScriptidentificationId": "abc123",
  "status": "Fixed",
  "accountId": 567,
  "otherDetail": "accountStatus"
}

{
  "ScriptidentificationId": "abc123",
  "otherDetail": "processedAccounts",
  "totalProcessedAccounts": 25
}`}
          </pre>
        </div>
      </CollapsibleSection>

      {/* Warnings */}
      <CollapsibleSection title="Important Notes & Tracking Behavior" icon={<FaExclamationTriangle className="text-yellow-500" />}>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
          <li>Status counts (e.g., <code>Fixed</code>, <code>Not Fixed</code>) are pulled from the script-named collection.</li>
          <li>The total number of records is based on documents with the matching <code>ScriptidentificationId</code>, excluding <code>processedAccounts</code>.</li>
          <li>If the collection is misnamed, or missing required fields, status updates will be inaccurate.</li>
          <li>Errors during execution are captured and added to <code>statusList["error"]</code> in the backend.</li>
        </ul>
      </CollapsibleSection>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pt-6 border-t">
        Last updated automatically based on backend logic. Refer to your team lead for schema changes.
      </p>
    </div>
  );
}
