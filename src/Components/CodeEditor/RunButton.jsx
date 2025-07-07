const RunButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2"
  >
    Run
  </button>
);

export default RunButton;
