import React, { useState } from 'react';
import LeagueOverview from './components/LeagueOverview';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import FSLCup from './pages/FSLCup';
import './App.css';

// Hardcoded league IDs
const PREMIER_LEAGUE_ID = '1257072684567642112';
const CHAMPIONSHIP_LEAGUE_ID = '1257087265260195840';

function App() {
  const [currentPage, setCurrentPage] = useState('standings');

  // Navigation handler
  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render the current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'cup':
        return <FSLCup />;
      case 'standings':
      default:
        return (
          <>
            {/* Premier League Section */}
            <div className="mb-12">
              <div className="border-l-4 border-blue-600 pl-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Premier League</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Top Division • Positions 1-12</p>
              </div>
              
              <LeagueOverview 
                leagueId={PREMIER_LEAGUE_ID} 
                leagueType="premier"
                promotionZone={[]} 
                relegationZone={[12]} 
              />
            </div>

            {/* Championship Section */}
            <div>
              <div className="border-l-4 border-green-600 pl-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Championship</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Second Division • Positions 1-12</p>
              </div>
              
              <LeagueOverview 
                leagueId={CHAMPIONSHIP_LEAGUE_ID} 
                leagueType="championship"
                promotionZone={[1]} 
                relegationZone={[12]} 
              />
            </div>
          </>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center items-center relative">
              <div className="flex flex-col items-center">
                <img src={`${process.env.PUBLIC_URL}/favicon.ico`} alt="FSL Index Logo" className="h-24 w-24 mt-2" />
              </div>
              <div className="absolute right-0">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-4">
              <ul className="flex space-x-6 border-b border-gray-200 dark:border-gray-700">
                <li className={`pb-2 px-1 ${currentPage === 'standings' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <button 
                    onClick={() => navigateTo('standings')}
                    className="focus:outline-none"
                  >
                    Standings
                  </button>
                </li>
                <li className={`pb-2 px-1 ${currentPage === 'cup' ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  <button 
                    onClick={() => navigateTo('cup')}
                    className="focus:outline-none"
                  >
                    FSL Cup
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </main>

        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Data provided by Sleeper API. This is not an official Sleeper product.
            </p>
            <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-2">
              FSL Index v0.0.5
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
