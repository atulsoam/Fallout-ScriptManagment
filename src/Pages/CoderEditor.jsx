import React, { useState, useEffect } from 'react';
import CodeEditor from '../Components/CodeEditor/CodeEditor';
import Console from '../Components/CodeEditor/Console';
import RunButton from '../Components/CodeEditor/RunButton';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const EditorLayout = () => {
  const [code, setCode] = useState('print("Hello, Python")');
  const [output, setOutput] = useState('');

  const runCode = () => {
    setOutput("Running...");
    socket.emit('run_code', { code });
  };

  useEffect(() => {
    socket.on('code_output', (data) => {
      setOutput(data.output);
    });
  }, []);

  return (
    <div className="p-4 space-y-4">
      <CodeEditor code={code} setCode={setCode} />
      <RunButton onClick={runCode} />
      <Console output={output} />
    </div>
  );
};

export default EditorLayout;
