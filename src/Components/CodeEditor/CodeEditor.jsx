import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ScriptTabBar from './ScriptTabBar';
import EditorPane from './EditorPane';
import { getScripts } from '../../services/ScriptRunner/ScriptRunnerServices';

const ScriptEditor = () => {
    const [scripts, setScripts] = useState([]);
    const [filteredScripts, setFilteredScripts] = useState([]);
    const [openTabs, setOpenTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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

    const openTab = (script) => {
        const alreadyOpen = openTabs.find((tab) => tab.id === script.id);
        if (!alreadyOpen) {
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
        if (activeTabId === id && filteredTabs.length > 0) {
            setActiveTabId(filteredTabs[0].id);
        } else if (filteredTabs.length === 0) {
            setActiveTabId(null);
        }
    };

    const saveScript = (id) => {
        const script = openTabs.find((tab) => tab.id === id);
        if (!script) return;
        console.log(`Saving: ${script.name}`);
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

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                loading={loading}
                filteredScripts={filteredScripts}
                openTab={openTab}
                downloadScript={downloadScript}
            />
            <main className="flex-1 flex flex-col">
                <ScriptTabBar
                    openTabs={openTabs}
                    activeTabId={activeTabId}
                    setActiveTabId={setActiveTabId}
                    saveScript={saveScript}
                    closeTab={closeTab}
                />
                <EditorPane
                    activeScript={activeScript}
                    updateCode={updateCode}
                />
            </main>
        </div>
    );
};

export default ScriptEditor;
