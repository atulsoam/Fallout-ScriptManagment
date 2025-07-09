const Console = ({ output }) => {
  return (
    <div className="bg-black text-white p-4 h-48 overflow-y-auto text-sm font-mono">
      {output || 'Console output will appear here...'}
    </div>
  );
};

export default Console;
