import React, { useState } from 'react';

/**
 * LeagueInput component provides an input for users to enter a league ID
 * @param {Function} onSubmit - Function called when a league ID is submitted
 * @returns {JSX.Element} - LeagueInput component
 */
const LeagueInput = ({ onSubmit, isLoading }) => {
  const [leagueId, setLeagueId] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (leagueId.trim()) {
      onSubmit(leagueId.trim());
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Enter Sleeper League ID</h2>
        <p className="text-gray-600 mt-2">
          Find your league ID in the URL of your Sleeper league page
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            placeholder="e.g. 784688362058338304"
            className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
            disabled={isLoading}
            aria-label="League ID"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!leagueId.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'View League'
            )}
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Example Sleeper IDs: 784688362058338304, 849782162549673984
        </div>
      </form>
    </div>
  );
};

export default LeagueInput; 