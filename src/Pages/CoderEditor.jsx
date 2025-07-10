import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/CodeEditor/Sidebar';
import ScriptTabBar from '../Components/CodeEditor/ScriptTabBar';
import EditorPane from '../Components/CodeEditor/EditorPane';
import Console from '../Components/CodeEditor/Console';
import { getScripts, runCode as RunCode } from '../services/ScriptRunner/ScriptRunnerServices';
import { uploadScript } from '../services/ScriptUploader/ScritpUplaoderServices';
import { toast } from 'react-toastify';
import LoadingOverlay from '../Components/LoadingOverlay';
// import { io } from 'socket.io-client';
// import { API_BASE } from '../utils/Config';
import { socket } from './ScriptRunner';


const EditorLayout = () => {
  // const socket = io(API_BASE, { transports: ['websocket'] });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  const [logs, setLogs] = useState({});
  const [activeExecId, setActiveExecId] = useState(null);
  const [scripts, setScripts] = useState([]);
  const [filteredScripts, setFilteredScripts] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);

  useEffect(() => {
    getScripts(setLoading)
      .then((res) => {
        const data = res?.data || [];
        setScripts(data);
        setFilteredScripts(data);
      })
      .catch(() => console.log('Error fetching scripts'));
  }, []);

  useEffect(() => {
    const lower = searchQuery.toLowerCase();
    setFilteredScripts(
      scripts.filter((script) =>
        script.name.toLowerCase().includes(lower)
      )
    );
  }, [searchQuery, scripts]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTabId) saveScript(activeTabId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, openTabs]);



  useEffect(() => {
    socket.on('log_update', (data) => {
      const { exec_id, line } = data;
      const MAX_LOG_LINES = 100;

      setLogs((prev) => {
        const updated = { ...prev };
        if (!updated[exec_id]) updated[exec_id] = [];
        updated[exec_id] = [
          ...updated[exec_id],
          {
            text: line.text,
            timestamp: line.timestamp || new Date().toISOString(),
            stream_name: line.stream_name || 'stdout',
          },
        ];
        if (updated[exec_id].length > MAX_LOG_LINES) {
          updated[exec_id] = updated[exec_id].slice(-MAX_LOG_LINES);
        }
        return updated;
      });
    });


    return () => socket.off('log_update');
  }, []);

  const runCode = async (scripTorun) => {
    console.log(scripTorun, "in runcode");
    RunCode(scripTorun).then((res) => {
      console.log(res);
      console.log(res.data);


      const Apidata = res.data
      setActiveExecId(Apidata.execId);
      setLogs(prev => ({ ...prev, [Apidata.execId]: [] }));



    }
    )



    // socket.emit('run_code', { code });
  };

  const openTab = (script) => {
    if (!openTabs.find((tab) => tab.id === script.id)) {
      setOpenTabs([...openTabs, { ...script, isEdited: false }]);
    }
    setActiveTabId(script.id);
  };

  const updateCode = (id, newCode) => {
    setOpenTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id
          ? {
            ...tab,
            code: newCode,
            isEdited: newCode !== scripts.find((s) => s.id === id)?.code,
          }
          : tab
      )
    );
  };

  const closeTab = (id) => {
    const filteredTabs = openTabs.filter((tab) => tab.id !== id);
    setOpenTabs(filteredTabs);
    if (activeTabId === id) {
      setActiveTabId(filteredTabs.length ? filteredTabs[0].id : null);
    }
  };

  const saveScript = (id) => {
    const script = openTabs.find((tab) => tab.id === id);
    if (!script) return;

    const storedAuth = JSON.parse(localStorage.getItem('authToken') || '{}');
    const cuid = storedAuth.cuid || 'System';
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();

    const updatedTags = [...(script.tags || []), {
      modifiedBy: cuid,
      modifiedAt: localISOTime,
    }];

    const payload = {
      name: script.name,
      code: script.code,
      uploadedBy: script.uploadedBy,
      description: script.description,
      scriptType: script.scriptType || 'System',
      scriptSubType: script.scriptSubType || 'System',
      approver: script.approver,
      tags: updatedTags,
    };

    setLoading(true);
    uploadScript(setLoading, payload)
      .then(() => notifySuccess('Script updated successfully'))
      .catch(() => notifyError('Script update failed!'))
      .finally(() => setLoading(false));

    setOpenTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === id ? { ...tab, isEdited: false } : tab
      )
    );
  };

  const downloadScript = (script) => {
    const blob = new Blob([script.code || ''], {
      type: 'text/x-python',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${script.name}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeScript = openTabs.find((tab) => tab.id === activeTabId);

  if (loading) return <LoadingOverlay />;
  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] text-[#1F2937]">
      {/* Optional Top Bar */}
      <div className="h-16 px-6 flex items-center justify-center  backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-md flex items-center justify-center text-white font-bold text-sm shadow">
            CE
          </div>
          <h1 className="text-xl font-semibold text-[#6B7280] tracking-wide">
            Code Editor
          </h1>
        </div>
      </div>

      {/* Spacer */}
      {/* <div className="h-4" /> */}



      {/* Main layout: Sidebar + Editor */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          filteredScripts={filteredScripts}
          openTab={openTab}
          downloadScript={downloadScript}
          className="bg-white border-r border-gray-200 shadow-sm"
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <ScriptTabBar
            openTabs={openTabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            saveScript={saveScript}
            closeTab={closeTab}
            className="bg-white border-b border-gray-200 shadow-sm"
          />

          <EditorPane
            activeScript={activeScript}
            updateCode={updateCode}
            runCode={runCode}
            className="flex-1 overflow-auto bg-gray-50 p-4"
          />
        </div>
      </div>

      {/* Console Output */}
      <div className="h-60 bg-black text-green-300 font-mono p-4 border-t border-gray-300 overflow-auto whitespace-pre-wrap">
        <Console logs={logs} activeExecId={activeExecId} />
      </div>
    </div>
  );

};

export default EditorLayout;
