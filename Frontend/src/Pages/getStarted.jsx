import React from "react";

export default function GetStarted() {
  const startLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#f5f5f4] to-[#e7e5e4] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {/* App Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Welcome
        </h1>

        <p className="text-gray-600 mb-6">
          Sign in to get started with your workspace
        </p>

        {/* Explanation */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm text-gray-700">
          <p>
            We use Google Sign-In to securely create and manage a private folder
            in your Google Drive where your documents are stored.
          </p>
          <p className="mt-2 text-gray-500">
            No passwords. No ads. No access beyond what’s required.
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={startLogin}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-3 text-gray-800 font-medium text-lg hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          {/* Google Icon */}
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.8 2.3 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l8.3 6.4C13 13.3 18.1 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.6 3-2.4 5.5-5.1 7.1l7.9 6.1c4.6-4.2 6.6-10.4 6.6-16.9z"
            />
            <path
              fill="#FBBC05"
              d="M10.9 28.6c-.5-1.5-.8-3.1-.8-4.6s.3-3.1.8-4.6l-8.3-6.4C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.6l8.3-6z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.3 0 11.6-2.1 15.4-5.7l-7.9-6.1c-2.2 1.5-5 2.4-7.5 2.4-5.9 0-11-3.8-12.8-9.1l-8.3 6.4C6.6 42.6 14.6 48 24 48z"
            />
          </svg>

          Continue with Google
        </button>

        {/* Footer reassurance */}
        <p className="mt-6 text-xs text-gray-500">
          By continuing, you agree to our use of Google OAuth for secure access.
        </p>
      </div>
    </div>
  );
}
