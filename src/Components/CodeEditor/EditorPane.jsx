import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { tokyoNight } from '@uiw/codemirror-theme-tokyo-night';
import { FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';

const EditorPane = ({ activeScript, updateCode }) => {
  // Track cursor position: line and column
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Handler for CodeMirror updates
  const onEditorUpdate = (update) => {
    const selection = update.state.selection.main;
    const line = update.state.doc.lineAt(selection.head);
    setCursorPos({
      line: line.number,
      col: selection.head - line.from + 1,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e2f] text-white min-h-0">
      {activeScript ? (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2 text-sm text-gray-300 select-none">
              <FiFileText className="text-blue-400 text-base" aria-hidden="true" />
              <span className="font-semibold text-white">{activeScript.name}.py</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full font-mono tracking-wide">
                Python
              </span>
            </div>
            {activeScript.isEdited && (
              <div
                className="flex items-center gap-1 text-yellow-400 font-semibold cursor-default"
                title="You have unsaved changes"
                aria-live="polite"
              >
                <FiAlertCircle className="animate-pulse" />
                <span className="text-xs">Unsaved changes</span>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto min-h-0">
            <CodeMirror
              value={activeScript.code}
              extensions={[
                python(),
                EditorView.lineWrapping,
                keymap.of(defaultKeymap),
                EditorView.editable.of(true),
                EditorView.updateListener.of(onEditorUpdate),
                EditorView.theme({
                  "&": {
                    fontFamily: "'Fira Code', Consolas, monospace",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    backgroundColor: "#1e1e2f",
                    height: "100%",
                  },
                  ".cm-content": {
                    padding: "6px 10px",
                    caretColor: "#AEAFAD", // VS Code caret color
                    outline: "none",
                  },
                  ".cm-cursor": {
                    borderLeft: "1.2px solid #AEAFAD",
                    animation: "blink 1.2s steps(2, start) infinite",
                  },
                  ".cm-activeLine": {
                    backgroundColor: "rgba(100, 100, 100, 0.15)",
                  },
                  ".cm-selectionBackground, .cm-content ::selection": {
                    backgroundColor: "rgba(30, 110, 180, 0.3)",
                  },
                  ".cm-gutters": {
                    backgroundColor: "#252526",
                    color: "#858585",
                    borderRight: "1px solid #333333",
                    fontSize: "13px",
                  },
                  ".cm-foldPlaceholder": {
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#888888",
                    fontWeight: "bold",
                  },
                }, { dark: true }),
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
              onChange={(value) => updateCode(activeScript.id, value)}
              height="100%"
            />
          </div>

          {/* Status bar */}
          <div className="h-7 flex items-center justify-between px-4 bg-[#252526] border-t border-[#3c3c3c] text-xs select-none font-mono text-gray-300">
            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FiFileText className="text-blue-400" aria-hidden="true" />
                <span>{activeScript.name}.py</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="uppercase bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">Python</span>
              </div>
            </div> */}
            <div className="flex items-center gap-6">
              <div>
                Line {cursorPos.line}, Col {cursorPos.col}
              </div>
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
          <FiFileText className="text-6xl mb-4 opacity-40" aria-hidden="true" />
          <p className="text-lg font-light">Select a script to start editing</p>
        </div>
      )}
    </div>
  );
};

export default EditorPane;
