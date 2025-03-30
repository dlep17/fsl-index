import React, { useState } from 'react';

/**
 * FSLCup component displays information about the FSL Cup competition
 * with a tournament bracket visualization
 * @returns {JSX.Element} - FSLCup component
 */
const FSLCup = () => {
  // Tournament bracket data structure
  const bracketData = {
    "Round 1": [
      { team1: "Team 16", team2: "Team 17", score1: 87, score2: 74, winner: "Team 16" },
      { team1: "Team 15", team2: "Team 18", score1: 88, score2: 95, winner: "Team 18" },
      { team1: "Team 11", team2: "Team 22", score1: 103, score2: 99, winner: "Team 11" },
      { team1: "Team 13", team2: "Team 20", score1: 96, score2: 84, winner: "Team 13" },
      { team1: "Team 14", team2: "Team 19", score1: 102, score2: 77, winner: "Team 14" },
      { team1: "Team 12", team2: "Team 21", score1: 79, score2: 92, winner: "Team 21" },
      { team1: "Team 10", team2: "Team 23", score1: 92, score2: 88, winner: "Team 10" },
      { team1: "Team 9", team2: "Team 24", score1: 87, score2: 74, winner: "Team 9" }
    ],
    "Round 2": [
      { team1: "Team 1", team2: "Team 16", score1: 108, score2: 86, winner: "Team 1" },
      { team1: "Team 2", team2: "Team 18", score1: 115, score2: 90, winner: "Team 2" },
      { team1: "Team 3", team2: "Team 11", score1: 107, score2: 98, winner: "Team 3" },
      { team1: "Team 4", team2: "Team 13", score1: 112, score2: 88, winner: "Team 4" },
      { team1: "Team 5", team2: "Team 14", score1: 104, score2: 91, winner: "Team 5" },
      { team1: "Team 6", team2: "Team 21", score1: 95, score2: 83, winner: "Team 6" },
      { team1: "Team 7", team2: "Team 10", score1: 89, score2: 101, winner: "Team 10" },
      { team1: "Team 8", team2: "Team 9", score1: 97, score2: 93, winner: "Team 8" }
    ],
    "Quarterfinals": [
      { team1: "Team 1", team2: "Team 2", score1: 106, score2: 92, winner: "Team 1" },
      { team1: "Team 3", team2: "Team 4", score1: 94, score2: 99, winner: "Team 4" },
      { team1: "Team 5", team2: "Team 6", score1: 104, score2: 88, winner: "Team 5" },
      { team1: "Team 8", team2: "Team 10", score1: 97, score2: 105, winner: "Team 10" }
    ],
    "Semifinals": [
      { team1: "Team 1", team2: "Team 4", score1: 110, score2: 106, winner: "Team 1" },
      { team1: "Team 5", team2: "Team 10", score1: 108, score2: 99, winner: "Team 5" }
    ],
    "Final": [
      { team1: "Team 1", team2: "Team 5", score1: 115, score2: 110, winner: "Team 1" }
    ]
  };

  // Teams with first-round byes (top 4 from each league)
  const byeTeams = [1, 2, 3, 4, 5, 6, 7, 8];

  // Active round state for mobile view
  const [activeRound, setActiveRound] = useState("Round 1");
  const rounds = Object.keys(bracketData);

  // Function to determine if a team has a first-round bye
  const hasFirstRoundBye = (teamNumber) => {
    return byeTeams.includes(parseInt(teamNumber.replace("Team ", "")));
  };

  // Function to render a team in the bracket
  const renderTeam = (team, score, isWinner) => {
    const teamNumber = parseInt(team.replace("Team ", ""));
    const hasBye = hasFirstRoundBye(team);
    
    return (
      <div className={`flex items-center justify-between w-full ${isWinner ? 'font-bold' : 'font-normal'} border-b border-gray-200 dark:border-gray-700 p-2`}>
        <div className="flex items-center">
          <div className={`w-7 h-7 ${hasBye ? 'bg-yellow-100 dark:bg-yellow-800' : 'bg-blue-100 dark:bg-blue-800'} rounded-full flex items-center justify-center mr-2`}>
            <span className={`text-xs font-bold ${hasBye ? 'text-yellow-800 dark:text-yellow-200' : 'text-blue-800 dark:text-blue-200'}`}>
              {teamNumber}
            </span>
          </div>
          <span className="text-sm text-gray-900 dark:text-white">{team}</span>
          {hasBye && (
            <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400" title="First-round bye">★</span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{score !== null ? score : '-'}</span>
      </div>
    );
  };

  // Mobile view matchup render function
  const renderMobileMatchup = (match, index) => {
    const isCompleted = match.score1 !== null && match.score2 !== null;
    const winner = isCompleted ? (match.score1 > match.score2 ? match.team1 : match.team2) : null;
    
    return (
      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          {activeRound} - Match {index + 1}
        </div>
        <div className="p-3">
          {renderTeam(match.team1, match.score1, winner === match.team1)}
          {renderTeam(match.team2, match.score2, winner === match.team2)}
        </div>
      </div>
    );
  };

  // Function for rendering a match card in the bracket
  const renderMatchCard = (match, index, roundName) => {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
          {roundName}
        </div>
        <div className="p-2">
          {renderTeam(match.team1, match.score1, match.winner === match.team1)}
          {renderTeam(match.team2, match.score2, match.winner === match.team2)}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">FSL Cup</h2>
        
        <div className="space-y-6">
          {/* Cup Overview */}
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The FSL Cup is a 24-team single-elimination tournament featuring all teams from both the Premier League and Championship.
              The top 4 teams from each league receive a first-round bye.
            </p>
          </div>
          
          {/* Current Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Tournament Status</h3>
            <p className="text-blue-700 dark:text-blue-400">
              The FSL Cup is currently in the Final stage. The championship match will take place next week.
            </p>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-800 rounded-full mr-2 flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-300 text-xs">★</span>
              </div>
              <span className="text-gray-600 dark:text-gray-300">First-round bye</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 font-bold text-gray-700 dark:text-gray-300">B</span>
              <span className="text-gray-600 dark:text-gray-300">Bold text indicates match winner</span>
            </div>
          </div>

          {/* Mobile Round Selector View */}
          <div className="md:hidden">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a round:
            </label>
            <select 
              className="block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-300 mb-4"
              value={activeRound}
              onChange={(e) => setActiveRound(e.target.value)}
            >
              {rounds.map(round => (
                <option key={round} value={round}>{round}</option>
              ))}
            </select>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">{activeRound}</h3>
            <div className="space-y-4">
              {bracketData[activeRound].map((match, index) => renderMobileMatchup(match, index))}
            </div>
          </div>
          
          {/* Desktop Bracket View - Expanded Size */}
          <div className="hidden md:block">
            <div className="overflow-x-auto pb-6">
              <div className="min-w-[1200px] p-6 relative" style={{ height: "1800px" }}>
                {/* Column Headers */}
                <div className="flex mb-6">
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Round 1</div>
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Round 2</div>
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Quarterfinals</div>
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Semifinals</div>
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Final</div>
                  <div className="w-[200px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Champion</div>
                </div>
                
                {/* Bracket Structure */}
                <div className="relative">
                  {/* Round 1 (Play-in Round) */}
                  <div className="absolute left-0 top-0 w-[180px]">
                    <div className="absolute top-[40px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][0], 0, "Round 1")}
                    </div>
                    <div className="absolute top-[220px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][1], 1, "Round 1")}
                    </div>
                    <div className="absolute top-[400px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][2], 2, "Round 1")}
                    </div>
                    <div className="absolute top-[580px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][3], 3, "Round 1")}
                    </div>
                    <div className="absolute top-[760px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][4], 4, "Round 1")}
                    </div>
                    <div className="absolute top-[940px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][5], 5, "Round 1")}
                    </div>
                    <div className="absolute top-[1120px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][6], 6, "Round 1")}
                    </div>
                    <div className="absolute top-[1300px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 1"][7], 7, "Round 1")}
                    </div>
                  </div>

                  {/* Round 2 (First Round) */}
                  <div className="absolute left-[200px] top-0 w-[180px]">
                    <div className="absolute top-[130px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][0], 0, "Round 2")}
                    </div>
                    <div className="absolute top-[310px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][1], 1, "Round 2")}
                    </div>
                    <div className="absolute top-[490px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][2], 2, "Round 2")}
                    </div>
                    <div className="absolute top-[670px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][3], 3, "Round 2")}
                    </div>
                    <div className="absolute top-[850px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][4], 4, "Round 2")}
                    </div>
                    <div className="absolute top-[1030px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][5], 5, "Round 2")}
                    </div>
                    <div className="absolute top-[1210px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][6], 6, "Round 2")}
                    </div>
                    <div className="absolute top-[1390px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Round 2"][7], 7, "Round 2")}
                    </div>
                  </div>

                  {/* Quarterfinals */}
                  <div className="absolute left-[400px] top-0 w-[180px]">
                    <div className="absolute top-[220px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Quarterfinals"][0], 0, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[580px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Quarterfinals"][1], 1, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[940px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Quarterfinals"][2], 2, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[1300px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Quarterfinals"][3], 3, "Quarterfinals")}
                    </div>
                  </div>

                  {/* Semifinals */}
                  <div className="absolute left-[600px] top-0 w-[180px]">
                    <div className="absolute top-[400px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Semifinals"][0], 0, "Semifinals")}
                    </div>
                    <div className="absolute top-[1120px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Semifinals"][1], 1, "Semifinals")}
                    </div>
                  </div>

                  {/* Finals */}
                  <div className="absolute left-[800px] top-0 w-[180px]">
                    <div className="absolute top-[760px] left-0 w-[180px]">
                      {renderMatchCard(bracketData["Final"][0], 0, "Final")}
                    </div>
                  </div>

                  {/* Champion */}
                  <div className="absolute left-[1000px] top-[745px] w-[180px]">
                    <div className="bg-white dark:bg-gray-800 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg overflow-hidden p-4 text-center shadow-md">
                      <div className="font-semibold text-lg text-yellow-800 dark:text-yellow-300 mb-3">Champion</div>
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-2">
                          <span className="text-xl font-bold text-yellow-800 dark:text-yellow-200">1</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900 dark:text-white">Team 1</span>
                      </div>
                    </div>
                  </div>

                  {/* Connector Lines */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ height: '1600px', width: '1100px' }}>
                    {/* Round 1 to Round 2 - Direct connections between each match and the next round */}
                    {/* Team 16 vs 17 → Team 1 vs 16 */}
                    <path d="M180,65 H190 V155 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 15 vs 18 → Team 2 vs 18 */}
                    <path d="M180,245 H190 V335 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 11 vs 22 → Team 3 vs 11 */}
                    <path d="M180,425 H190 V515 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 13 vs 20 → Team 4 vs 13 */}
                    <path d="M180,605 H190 V695 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 14 vs 19 → Team 5 vs 14 */}
                    <path d="M180,785 H190 V875 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 12 vs 21 → Team 6 vs 21 */}
                    <path d="M180,965 H190 V1055 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 10 vs 23 → Team 7 vs 10 */}
                    <path d="M180,1145 H190 V1235 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Team 9 vs 24 → Team 8 vs 9 */}
                    <path d="M180,1325 H190 V1415 H200" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Round 2 to Quarterfinals */}
                    {/* Pair 1-2 */}
                    <path d="M380,155 H390 V270 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,335 H390 V270 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Pair 3-4 */}
                    <path d="M380,515 H390 V630 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,695 H390 V630 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Pair 5-6 */}
                    <path d="M380,875 H390 V990 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,1055 H390 V990 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Pair 7-8 */}
                    <path d="M380,1235 H390 V1350 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,1415 H390 V1350 H400" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Quarterfinals to Semifinals */}
                    {/* Pair 1-2 */}
                    <path d="M580,245 H590 V450 H600" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M580,605 H590 V450 H600" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Pair 3-4 */}
                    <path d="M580,965 H590 V1170 H600" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M580,1325 H590 V1170 H600" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Semifinals to Final */}
                    <path d="M780,425 H790 V810 H800" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M780,1145 H790 V810 H800" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Final to Champion */}
                    <path d="M980,785 H1000" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* First Round Byes Explanation */}
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">First-Round Byes</h3>
            <p className="text-yellow-700 dark:text-yellow-400 mb-2">
              The following teams received a first-round bye in this season's FSL Cup:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {byeTeams.map(teamNum => (
                <div key={teamNum} className="flex items-center">
                  <div className="w-7 h-7 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-yellow-800 dark:text-yellow-200">{teamNum}</span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">Team {teamNum}</span>
                </div>
              ))}
            </div>
            <p className="text-yellow-700 dark:text-yellow-400 mt-3 text-sm">
              Teams 1-4: Premier League top 4
              <br />
              Teams 5-8: Championship top 4
            </p>
          </div>
          
          {/* Cup Rules */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Cup Rules</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">
              <li>24-team single-elimination tournament</li>
              <li>Top 4 teams from each league receive a first-round bye</li>
              <li>In case of a tie, the winner is determined by total points scored</li>
              <li>The cup winner receives an automatic qualification for next season's Premier League</li>
              <li>Teams from both Premier League and Championship compete together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FSLCup; 