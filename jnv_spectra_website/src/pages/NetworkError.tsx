import { useState } from "react";

const NetworkError = () => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Network Error</h1>
        <p className="text-xl text-gray-700 mb-4">
          Oops! We couldn't connect to the server.<br />
          Please check your internet connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition mb-4"
          disabled={retrying}
        >
          {retrying ? 'Retrying...' : 'Retry'}
        </button>
        <div>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default NetworkError; 