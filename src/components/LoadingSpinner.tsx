export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-gray-100">
      <div className="flex space-x-2 animate-pulse">
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
      </div>
    </div>
  );
}
