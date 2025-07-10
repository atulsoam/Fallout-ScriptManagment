import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { FiFileText, FiAlertCircle, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language'; // ✅ Import this

const EditorPane = ({ activeScript, updateCode, runCode }) => {
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

    const onEditorUpdate = (update) => {
        const selection = update.state.selection.main;
        const line = update.state.doc.lineAt(selection.head);
        setCursorPos({
            line: line.number,
            col: selection.head - line.from + 1,
        });
    };

    return (
        <div className="flex-1  flex flex-col bg-[#1e1e2f] text-white min-h-0">
            {activeScript ? (
                <>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c] shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-gray-300 select-none">
                            <FiFileText className="text-blue-400 text-base" />
                            <span className="font-semibold text-white">{activeScript.name}.py</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full font-mono tracking-wide">
                                Python
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => runCode(activeScript)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs rounded-md shadow transition-all duration-150"
                                title="Run script"
                            >
                                <FiPlay className="text-sm" />
                                Run
                            </button>

                            {activeScript.isEdited && (
                                <div
                                    className="flex items-center gap-1 text-yellow-400 font-semibold cursor-default"
                                    title="You have unsaved changes"
                                    aria-live="polite"
                                >
                                    <FiAlertCircle className="animate-pulse" />
                                    <span className="text-xs">Unsaved</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CodeMirror Editor */}
                    <div className="flex-1 overflow-auto min-h-0">
                        <CodeMirror
                            value={activeScript.code}
                            extensions={[
                                python(),
                                indentUnit.of("    "), // tab = 4 spaces

                                EditorView.lineWrapping,
                                keymap.of([indentWithTab, ...defaultKeymap]),
                                EditorView.editable.of(true),
                                EditorView.updateListener.of(onEditorUpdate),
                                
                            ]}
                            theme={tokyoNight}
                            basicSetup={{
                                lineNumbers: true,
                                foldGutter: true,
                                highlightActiveLineGutter: true,
                                highlightActiveLine: true,
                                dropCursor: true,
                                highlightSelectionMatches: true,
                            }}
                            height="50%"
                            onChange={(value) => updateCode(activeScript.id, value)}
                            indentWithTab={true}
                            indentUnit={4}
                            tabSize={4}

                        />
                    </div>

                    {/* Status Bar */}
                    <div className="h-7 flex items-center justify-between px-4 bg-[#252526] border-t border-[#3c3c3c] text-xs select-none font-mono text-gray-300">
                        <div className="flex items-center gap-6">
                            <div>Line {cursorPos.line}, Col {cursorPos.col}</div>
                            <div className="flex items-center gap-1">
                                {activeScript.isEdited ? (
                                    <>
                                        <FiAlertCircle className="text-yellow-400" />
                                        <span>Unsaved</span>
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle className="text-green-400" />
                                        <span>Saved</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center flex-grow text-gray-500 select-none p-6">
                    <FiFileText className="text-6xl mb-4 opacity-40" />
                    <p className="text-lg font-light">Select a script to start editing</p>
                </div>
            )}
        </div>
    );
};

export default EditorPane;
