export default function CodeViewerModal({ code, onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl shadow-lg relative">
                <button className="absolute top-3 right-4 text-xl" onClick={onClose}>×</button>
                <h2 className="text-lg font-semibold mb-4">Script Code</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
                    <code className="text-sm">{code}</code>
                </pre>
            </div>
        </div>
    );
}
