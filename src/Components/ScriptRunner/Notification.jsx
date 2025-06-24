export default function Notification({ message }) {
  if (!message) return null;
  return (
    <div
      className={`p-4 rounded ${
        message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
      }`}
      role="alert"
    >
      {message.text}
    </div>
  );
}
