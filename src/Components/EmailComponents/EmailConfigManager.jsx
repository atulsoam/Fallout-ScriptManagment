import React, { useEffect, useState } from 'react';
import { getEmailConfigs, updateEmailConfigs } from '../../services/AdminServices/Adminservices';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaSave, FaUpload, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import classNames from 'classnames';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const EmailConfigManager = () => {

    const [configs, setConfigs] = useState({});
    const [expandedLists, setExpandedLists] = useState({});
    const [newListName, setNewListName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingList, setEditingList] = useState(null);
    const [renamingListName, setRenamingListName] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [csvEmails, setCsvEmails] = useState([]);
    const [selectedListForCsv, setSelectedListForCsv] = useState('');

    // Fetch configs on mount
    useEffect(() => {
        fetchConfigs();
    }, []);

    async function fetchConfigs() {
        setLoading(true);
        try {
            const res = await getEmailConfigs();
            setConfigs(res);
            // Expand all by default
            const expanded = Object.keys(res).reduce((acc, k) => ({ ...acc, [k]: true }), {});
            setExpandedLists(expanded);
        } catch {
            toast.error('Failed to load email configurations.')
        } finally {
            setLoading(false);
        }
    }

    // File upload handler using XLSX
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const emails = rows
                    .map(row => row[0])
                    .filter(email => typeof email === 'string' && /\S+@\S+\.\S+/.test(email));

                if (emails.length === 0) {
                    toast.error("No valid emails found in the uploaded file.")
                    setCsvEmails([]);
                } else {
                    setCsvEmails(emails);
                }
            } catch {
                toast.error('Error reading the file. Please upload a valid CSV or Excel file.')
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null; // reset input
    };

    // Import parsed CSV emails into selected list or create new
    const handleImportToList = () => {
        const trimmedList = selectedListForCsv.trim();
        if (!trimmedList) {
            toast.error('Please select or enter a list name for import.')
            return;
        }
        const existing = configs[trimmedList] || [];
        const combined = [...new Set([...existing, ...csvEmails])];
        setConfigs(prev => ({ ...prev, [trimmedList]: combined }));
        setExpandedLists(prev => ({ ...prev, [trimmedList]: true }));
        setCsvEmails([]);
        setSelectedListForCsv('');
        toast.success(`Imported ${combined.length - existing.length} new email(s) into "${trimmedList}".`)
    };

    // Add new list
    const handleAddList = () => {
        const trimmed = newListName.trim();
        if (!trimmed) {
            
            toast.error('List name cannot be empty.');
            return;
        }
        if (configs[trimmed]) {
            toast.error('List already exists.');
            return;
        }
        setConfigs(prev => ({ ...prev, [trimmed]: [] }));
        setExpandedLists(prev => ({ ...prev, [trimmed]: true }));
        setNewListName('');
    };

    // Rename list handler
    const handleRenameList = (oldName) => {
        const newName = renamingListName.trim();
        if (!newName || newName === oldName || configs[newName]) {
            setEditingList(null);
            return;
        }
        const { [oldName]: emails, ...rest } = configs;
        setConfigs({ ...rest, [newName]: emails });
        const { [oldName]: expanded, ...restExpanded } = expandedLists;
        setExpandedLists({ ...restExpanded, [newName]: expanded });
        setEditingList(null);
        setRenamingListName('');
    };

    // Remove list
    const handleRemoveList = (listName) => {
        const { [listName]: _, ...rest } = configs;
        const { [listName]: __, ...restExpanded } = expandedLists;
        setConfigs(rest);
        setExpandedLists(restExpanded);
        setPendingDelete(null);
        toast.success(`Deleted list "${listName}".`)
    };

    // Add single email to list
    const handleAddEmail = (listName, email) => {
        const trimmed = email.trim();
        if (!/\S+@\S+\.\S+/.test(trimmed)) {
            toast.error('Invalid email address.');
            return;
        }
        setConfigs(prev => ({
            ...prev,
            [listName]: [...new Set([...prev[listName], trimmed])],
        }));
    };

    // Remove email from list
    const handleRemoveEmail = (listName, email) => {
        setConfigs(prev => ({
            ...prev,
            [listName]: prev[listName].filter(e => e !== email),
        }));
    };

    // Toggle list expand/collapse
    const handleToggleExpand = (listName) => {
        setExpandedLists(prev => ({ ...prev, [listName]: !prev[listName] }));
    };

    // Save all configs
    const handleSave = async () => {
        setLoading(true);
        try {
            await updateEmailConfigs(configs);
            toast.success('Configuration saved successfully!')
        } catch {
            toast.success('Failed to save configurations.')
        } finally {
            setLoading(false);
        }
    };

    // Filter lists by search term
    const filteredConfigs = Object.entries(configs).filter(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-xl mt-12 space-y-10">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl font-extrabold text-[#1F2937] flex items-center gap-2">
                    ⚙️ Email Configurations
                </h1>
                <button
                    disabled={loading}
                    onClick={handleSave}
                    className={classNames(
                        "inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition duration-200",
                        { 'opacity-50 cursor-not-allowed': loading }
                    )}
                    aria-label="Save email configurations"
                >
                    <FaSave />
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            </header>


            {/* Search + Add New List */}
            <section className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Search lists..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow rounded-lg border border-[#E5E7EB] px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#1F2937]"
                    aria-label="Search email lists"
                />
                <div className="flex gap-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="New list name"
                        value={newListName}
                        onChange={e => setNewListName(e.target.value)}
                        className="rounded-lg border border-[#E5E7EB] px-4 py-2 shadow-sm flex-grow focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#1F2937]"
                        aria-label="New list name input"
                    />
                    <button
                        onClick={handleAddList}
                        className="bg-[#6366F1] hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-sm transition"
                        aria-label="Add new email list"
                    >
                        <FaPlus />
                        <span className="ml-1">Add List</span>
                    </button>
                </div>
            </section>

            {/* CSV/XLSX Import Section */}
            <section className="p-6 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB] space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-[#1F2937]">
                    <FaUpload /> Import Emails from Excel or CSV
                </h2>

                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="file-input file:border file:border-gray-300 file:rounded file:py-2 file:px-4 file:bg-white file:text-[#1F2937]"
                    aria-label="Upload CSV or Excel file"
                />

                {csvEmails.length > 0 && (
                    <>
                        <p className="text-[#374151] font-medium">
                            Parsed <strong>{csvEmails.length}</strong> valid email(s)
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                            <select
                                className="border border-[#E5E7EB] rounded-lg px-4 py-2 shadow-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#1F2937]"
                                value={selectedListForCsv}
                                onChange={e => setSelectedListForCsv(e.target.value)}
                                aria-label="Select existing list to import emails"
                            >
                                <option value="">-- Select existing list --</option>
                                {Object.keys(configs).map(list => (
                                    <option key={list} value={list}>{list}</option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Or enter new list name"
                                value={selectedListForCsv}
                                onChange={e => setSelectedListForCsv(e.target.value)}
                                className="border border-[#E5E7EB] rounded-lg px-4 py-2 shadow-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-[#1F2937]"
                                aria-label="New list name for import"
                            />

                            <button
                                onClick={handleImportToList}
                                className="bg-[#6366F1] hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
                                aria-label="Import emails into list"
                            >
                                Import
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* Lists Accordion */}
            <section className="space-y-6">
                {filteredConfigs.length === 0 ? (
                    <p className="text-[#6B7280] text-center py-8 italic">No lists found.</p>
                ) : (
                    filteredConfigs.map(([listName, emails]) => {
                        const isExpanded = expandedLists[listName];
                        const isEditing = editingList === listName;

                        return (
                            <article key={listName} className="border border-[#E5E7EB] rounded-xl shadow-sm bg-[#F9FAFB]">
                                <header
                                    className="flex justify-between items-center px-5 py-3 bg-[#E5E7EB] rounded-t-xl cursor-pointer select-none"
                                    onClick={() => handleToggleExpand(listName)}
                                    aria-expanded={isExpanded}
                                    aria-controls={`list-panel-${listName}`}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleToggleExpand(listName);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <FaChevronUp className="text-[#6B7280]" />
                                        ) : (
                                            <FaChevronDown className="text-[#6B7280]" />
                                        )}

                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={renamingListName}
                                                onChange={e => setRenamingListName(e.target.value)}
                                                onBlur={() => handleRenameList(listName)}
                                                onKeyDown={e => e.key === 'Enter' && handleRenameList(listName)}
                                                autoFocus
                                                className="text-lg font-semibold rounded px-2 py-1 border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                                                aria-label={`Rename list ${listName}`}
                                            />
                                        ) : (
                                            <h3
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setEditingList(listName);
                                                    setRenamingListName(listName);
                                                }}
                                                className="text-lg font-semibold text-[#1F2937] capitalize hover:underline"
                                                title="Click to rename"
                                                tabIndex={0}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        setEditingList(listName);
                                                        setRenamingListName(listName);
                                                    }
                                                }}
                                                role="button"
                                                aria-label={`Rename list ${listName}`}
                                            >
                                                {listName}
                                            </h3>
                                        )}
                                    </div>

                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            setPendingDelete(listName);
                                        }}
                                        className="text-red-600 hover:text-red-800 transition"
                                        aria-label={`Delete list ${listName}`}
                                    >
                                        <FaTrash />
                                    </button>
                                </header>

                                {isExpanded && (
                                    <section id={`list-panel-${listName}`} className="p-5 bg-white rounded-b-xl space-y-4">
                                        <AddEmailInput onAdd={email => handleAddEmail(listName, email)} />

                                        {emails.length === 0 ? (
                                            <p className="italic text-gray-500 text-center py-4">No emails added yet.</p>
                                        ) : (
                                            <ul className="max-h-52 overflow-auto space-y-2">
                                                {emails.map((email, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded shadow-sm border"
                                                    >
                                                        <span className="break-all text-[#374151]">{email}</span>
                                                        <button
                                                            onClick={() => handleRemoveEmail(listName, email)}
                                                            className="text-red-500 hover:text-red-700"
                                                            aria-label={`Remove email ${email} from list ${listName}`}
                                                        >
                                                            &times;
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </section>
                                )}
                            </article>
                        );
                    })
                )}
            </section>

            {/* Delete Confirmation Modal */}
            {pendingDelete && (
                <Modal
                    title="Confirm Delete"
                    onClose={() => setPendingDelete(null)}
                    onConfirm={() => handleRemoveList(pendingDelete)}
                    confirmText="Delete"
                    confirmColor="red"
                >
                    <p>Are you sure you want to delete the list &quot;{pendingDelete}&quot;? This action cannot be undone.</p>
                </Modal>
            )}
        </main>

    );
};



const AddEmailInput = ({ onAdd }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    const validateEmail = (val) => /\S+@\S+\.\S+/.test(val);

    const handleAdd = () => {
        const trimmed = email.trim();
        if (!validateEmail(trimmed)) {
            setError('Invalid email address');
            return;
        }
        onAdd(trimmed);
        setEmail('');
        setError('');
        setTouched(false);
    };

    const onChange = (e) => {
        setEmail(e.target.value);
        if (touched) {
            setError(validateEmail(e.target.value.trim()) ? '' : 'Invalid email address');
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const clearInput = () => {
        setEmail('');
        setError('');
        setTouched(false);
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="relative flex items-center gap-2 w-full pb-2">
                <div className="relative flex-grow">
                    <input
                        type="email"
                        placeholder="Add email address"
                        value={email}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        onBlur={() => setTouched(true)}
                        className={`w-full pl-4 pr-10 py-2 rounded-xl border shadow-sm transition focus:outline-none focus:ring-2
              ${error
                                ? 'border-red-500 focus:ring-red-400'
                                : validateEmail(email) && touched
                                    ? 'border-green-500 focus:ring-green-400'
                                    : 'border-[#E5E7EB] focus:ring-[#6366F1]'
                            }
              text-[#1F2937] bg-white
            `}
                        aria-label="Add email input"
                        aria-invalid={!!error}
                        aria-describedby="email-error"
                    />
                    {/* Validation icons */}
                    {touched && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                            {error ? (
                                <FaExclamationCircle className="text-red-500" />
                            ) : validateEmail(email) ? (
                                <FaCheckCircle className="text-green-500" />
                            ) : null}
                        </span>
                    )}

                    {/* Clear input */}
                    {email && (
                        <button
                            type="button"
                            onClick={clearInput}
                            aria-label="Clear email input"
                            className="absolute right-9 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <button
                    onClick={handleAdd}
                    className="bg-[#6366F1] hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
                    aria-label="Add email"
                    disabled={!validateEmail(email.trim())}
                    title={validateEmail(email.trim()) ? 'Add email' : 'Enter a valid email first'}
                >
                    <FaPlus />
                </button>
            </div>

            {/* Error message below input */}
            {error && (
                <p
                    id="email-error"
                    className="text-red-500 text-sm pl-1"
                    role="alert"
                    aria-live="assertive"
                >
                    {error}
                </p>
            )}
        </div>
    );
};





// Simple Modal Component with transparent & blurry background
const Modal = ({ title, children, onClose, onConfirm, confirmText, confirmColor = 'blue' }) => {
    return (
        <>
            <div
                className="fixed inset-0 flex items-center justify-center z-50"
                aria-modal="true"
                role="dialog"
                tabIndex={-1}
            >
                {/* Blur overlay with no black tint */}
                <div className="absolute inset-0 backdrop-blur-md bg-white/10"></div>

                {/* Modal content */}
                <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <h3 className="text-xl font-semibold mb-4">{title}</h3>
                    <div className="mb-6">{children}</div>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-4 py-2 rounded text-white font-semibold transition ${confirmColor === 'red'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>


        </>
    );
};

export default EmailConfigManager;
