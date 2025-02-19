import React from 'react';
import PurpleLogo from '@components/ui/purple-logo';

interface VerificationStatusProps {
  status: 'loading' | 'success' | 'error';
  message: string;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ status, message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center">
            <PurpleLogo className="w-32 mb-8" />
            
            {/* Status Icon */}
            <div className="mb-6">
              {status === 'loading' && (
                <div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full"/>
              )}
              {status === 'success' && (
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Message */}
            <p className="text-center text-gray-700 text-lg font-medium mb-4">{message}</p>
            
            {status === 'error' && (
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors"
              >
                Return to Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus; 