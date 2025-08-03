import React, { useState, useEffect } from 'react';
import sleeperApiService from '../services/sleeperApiService';

/**
 * FSLCup component displays information about the FSL Cup competition
 * with a tournament bracket visualization
 * @returns {JSX.Element} - FSLCup component
 */
const FSLCup = () => {
  // State for Premier League and Championship teams
  const [premierTeams, setPremierTeams] = useState([]);
  const [championshipTeams, setChampionshipTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  // Active round state for mobile view - moved before any conditional returns
  const [activeRound, setActiveRound] = useState("Round 1");
  
  // League IDs (replace with actual IDs)
  const PREMIER_LEAGUE_ID = '1118356697246031872';
  const CHAMPIONSHIP_LEAGUE_ID = '1118361298359787520';

  // Fetch league data on component mount
  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        
        // Fetch Premier League and Championship data in parallel
        const [premierData, championshipData] = await Promise.all([
          fetchLeagueTeams(PREMIER_LEAGUE_ID),
          fetchLeagueTeams(CHAMPIONSHIP_LEAGUE_ID)
        ]);
        
        setPremierTeams(premierData);
        setChampionshipTeams(championshipData);
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeagueData();
  }, []);
  
  // Helper function to fetch and process teams from a league
  const fetchLeagueTeams = async (leagueId) => {
    try {
      // Fetch necessary data
      const [leagueData, usersData, rostersData] = await Promise.all([
        sleeperApiService.getLeagueInfo(leagueId),
        sleeperApiService.getLeagueUsers(leagueId),
        sleeperApiService.getLeagueRosters(leagueId)
      ]);
      
      // Process team data
      const processedTeams = rostersData.map(roster => {
        const user = usersData.find(user => user.user_id === roster.owner_id) || {};
        
        return {
          rosterId: roster.roster_id,
          name: user.display_name || `Team ${roster.roster_id}`,
          record: {
            wins: roster.settings?.wins || 0,
            losses: roster.settings?.losses || 0
          },
          pointsFor: parseFloat((roster.settings?.fpts || 0) + '.' + (roster.settings?.fpts_decimal || 0))
        };
      });
      
      // Sort by wins, then by points
      return processedTeams.sort((a, b) => {
        if (a.record.wins !== b.record.wins) {
          return b.record.wins - a.record.wins;
        }
        return b.pointsFor - a.pointsFor;
      });
    } catch (error) {
      console.error(`Error fetching league ${leagueId} data:`, error);
      return [];
    }
  };
  
  // If still loading, show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }
  
  // Create team names mapping based on standings
  const teamNames = {
    // Teams 1-4: Top 4 teams from Premier League
    1: premierTeams[0]?.name || "Premier Team 1",
    2: premierTeams[1]?.name || "Premier Team 2",
    3: premierTeams[2]?.name || "Premier Team 3",
    4: premierTeams[3]?.name || "Premier Team 4",
    
    // Teams 5-8: Top 4 teams from Championship
    5: championshipTeams[0]?.name || "Championship Team 1",
    6: championshipTeams[1]?.name || "Championship Team 2",
    7: championshipTeams[2]?.name || "Championship Team 3",
    8: championshipTeams[3]?.name || "Championship Team 4",
    
    // Teams 9-16: Teams 5-12 from Premier League
    9: premierTeams[4]?.name || "Premier Team 5",
    10: premierTeams[5]?.name || "Premier Team 6",
    11: premierTeams[6]?.name || "Premier Team 7",
    12: premierTeams[7]?.name || "Premier Team 8",
    13: premierTeams[8]?.name || "Premier Team 9",
    14: premierTeams[9]?.name || "Premier Team 10",
    15: premierTeams[10]?.name || "Premier Team 11",
    16: premierTeams[11]?.name || "Premier Team 12",
    
    // Teams 17-24: Teams 5-12 from Championship
    17: championshipTeams[4]?.name || "Championship Team 5",
    18: championshipTeams[5]?.name || "Championship Team 6",
    19: championshipTeams[6]?.name || "Championship Team 7",
    20: championshipTeams[7]?.name || "Championship Team 8",
    21: championshipTeams[8]?.name || "Championship Team 9",
    22: championshipTeams[9]?.name || "Championship Team 10",
    23: championshipTeams[10]?.name || "Championship Team 11",
    24: championshipTeams[11]?.name || "Championship Team 12"
  };

  // Tournament bracket data structure - only Round 1 matches are set
  const bracketData = {
    "Round 1": [
      { team1: teamNames[16], team2: teamNames[17], score1: null, score2: null, winner: null },
      { team1: teamNames[15], team2: teamNames[18], score1: null, score2: null, winner: null },
      { team1: teamNames[11], team2: teamNames[22], score1: null, score2: null, winner: null },
      { team1: teamNames[13], team2: teamNames[20], score1: null, score2: null, winner: null },
      { team1: teamNames[14], team2: teamNames[19], score1: null, score2: null, winner: null },
      { team1: teamNames[12], team2: teamNames[21], score1: null, score2: null, winner: null },
      { team1: teamNames[10], team2: teamNames[23], score1: null, score2: null, winner: null },
      { team1: teamNames[9], team2: teamNames[24], score1: null, score2: null, winner: null }
    ],
    // For later rounds, we'll generate the potential matchups dynamically
    "Round 2": [],
    "Quarterfinals": [],
    "Semifinals": [],
    "Final": []
  };

  // Teams with first-round byes (top 4 from each league)
  const byeTeams = [1, 2, 3, 4, 5, 6, 7, 8];

  // Define the potential matchups for later rounds
  const potentialMatchups = {
    "Round 2": [
      { team1: teamNames[1], team2: `Winner of R1 ${teamNames[16]}/${teamNames[17]}` },
      { team1: teamNames[2], team2: `Winner of R1 ${teamNames[15]}/${teamNames[18]}` },
      { team1: teamNames[3], team2: `Winner of R1 ${teamNames[11]}/${teamNames[22]}` },
      { team1: teamNames[4], team2: `Winner of R1 ${teamNames[13]}/${teamNames[20]}` },
      { team1: teamNames[5], team2: `Winner of R1 ${teamNames[14]}/${teamNames[19]}` },
      { team1: teamNames[6], team2: `Winner of R1 ${teamNames[12]}/${teamNames[21]}` },
      { team1: teamNames[7], team2: `Winner of R1 ${teamNames[10]}/${teamNames[23]}` },
      { team1: teamNames[8], team2: `Winner of R1 ${teamNames[9]}/${teamNames[24]}` }
    ],
    "Quarterfinals": [
      { team1: "Winner of R2 Match 1", team2: "Winner of R2 Match 2" },
      { team1: "Winner of R2 Match 3", team2: "Winner of R2 Match 4" },
      { team1: "Winner of R2 Match 5", team2: "Winner of R2 Match 6" },
      { team1: "Winner of R2 Match 7", team2: "Winner of R2 Match 8" }
    ],
    "Semifinals": [
      { team1: "Winner of QF Match 1", team2: "Winner of QF Match 2" },
      { team1: "Winner of QF Match 3", team2: "Winner of QF Match 4" }
    ],
    "Final": [
      { team1: "Winner of SF Match 1", team2: "Winner of SF Match 2" }
    ]
  };

  const rounds = Object.keys(bracketData);

  // Function to determine if a team has a first-round bye
  const hasFirstRoundBye = (teamName) => {
    const teamNumber = findTeamNumberByName(teamName);
    return byeTeams.includes(teamNumber);
  };

  // Helper function to find team number by name
  const findTeamNumberByName = (teamName) => {
    for (const [number, name] of Object.entries(teamNames)) {
      if (name === teamName) {
        return parseInt(number);
      }
    }
    return null;
  };

  // Function to render a team in the bracket
  const renderTeam = (team, score, isWinner) => {
    // Check if it's a potential winner placeholder
    const isPlaceholder = team && team.includes("Winner of");
    
    if (!team) return null;
    
    // Get team number if it's an actual team (not a placeholder)
    const teamNumber = !isPlaceholder ? findTeamNumberByName(team) : null;
    const hasBye = !isPlaceholder ? hasFirstRoundBye(team) : false;
    
    // Determine league type based on team number for styling
    const isPremierLeague = !isPlaceholder && teamNumber !== null && teamNumber <= 4 || (teamNumber >= 9 && teamNumber <= 16);
    const bgColorClass = isPremierLeague 
      ? 'bg-blue-100 dark:bg-blue-800' 
      : hasBye 
        ? 'bg-yellow-100 dark:bg-yellow-800' 
        : 'bg-green-100 dark:bg-green-800';
    
    const textColorClass = isPremierLeague 
      ? 'text-blue-800 dark:text-blue-200' 
      : hasBye 
        ? 'text-yellow-800 dark:text-yellow-200' 
        : 'text-green-800 dark:text-green-200';
    
    return (
      <div className={`flex items-center justify-between w-full ${isWinner ? 'font-bold' : 'font-normal'} p-2`}>
        <div className="flex items-center">
          {!isPlaceholder && teamNumber && (
            <div className={`w-7 h-7 ${bgColorClass} rounded-full flex items-center justify-center mr-2`}>
              <span className={`text-xs font-bold ${textColorClass}`}>
                {teamNumber}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-900 dark:text-white">
            {team}
            {!isPlaceholder && hasBye && (
              <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400" title="First-round bye">★</span>
            )}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{score !== null ? score : '-'}</span>
      </div>
    );
  };

  // Mobile view matchup render function
  const renderMobileMatchup = (match, index, roundName) => {
    // For actual matches
    if (roundName === "Round 1") {
      const isCompleted = match.score1 !== null && match.score2 !== null;
      const winner = isCompleted ? (match.score1 > match.score2 ? match.team1 : match.team2) : null;
      
      return (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            {roundName} - Match {index + 1}
          </div>
          <div className="p-3">
            {renderTeam(match.team1, match.score1, winner === match.team1)}
            {renderTeam(match.team2, match.score2, winner === match.team2)}
          </div>
        </div>
      );
    } 
    // For potential matchups
    else {
      const potentialMatch = potentialMatchups[roundName][index];
      
      return (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            {roundName} - Match {index + 1}
          </div>
          <div className="p-3">
            {renderTeam(potentialMatch.team1, null, false)}
            {renderTeam(potentialMatch.team2, null, false)}
          </div>
        </div>
      );
    }
  };

  // Function for rendering a match card in the bracket
  const renderMatchCard = (match, index, roundName) => {
    // For actual matches (Round 1)
    if (roundName === "Round 1") {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
            {roundName} - Match {index + 1}
          </div>
          <div className="p-2">
            <div className="border-b border-gray-200 dark:border-gray-700">
              {renderTeam(match.team1, match.score1, match.winner === match.team1)}
            </div>
            {renderTeam(match.team2, match.score2, match.winner === match.team2)}
          </div>
        </div>
      );
    } 
    // For potential matchups (later rounds)
    else {
      const potentialMatch = potentialMatchups[roundName][index];
      
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400">
            {roundName} - Match {index + 1}
          </div>
          <div className="p-2">
            <div className="border-b border-gray-200 dark:border-gray-700">
              {renderTeam(potentialMatch.team1, null, false)}
            </div>
            {renderTeam(potentialMatch.team2, null, false)}
          </div>
        </div>
      );
    }
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
              The FSL Cup is currently in the first round.
            </p>
            <div className="mt-3 border-t border-blue-100 dark:border-blue-800 pt-3">
              <p className="text-blue-700 dark:text-blue-400 font-medium">Tournament Teams:</p>
              <ul className="mt-2 text-sm text-blue-600 dark:text-blue-400 space-y-1">
                <li>• Teams 1-4: Top 4 teams from Premier League (with first-round bye)</li>
                <li>• Teams 5-8: Top 4 teams from Championship (with first-round bye)</li>
                <li>• Teams 9-16: Teams 5-12 from Premier League</li>
                <li>• Teams 17-24: Teams 5-12 from Championship</li>
              </ul>
            </div>
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
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-800 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-300">Premier League Team</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 dark:bg-green-800 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-300">Championship Team</span>
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
              {activeRound === "Round 1" ? (
                bracketData[activeRound].map((match, index) => renderMobileMatchup(match, index, activeRound))
              ) : (
                potentialMatchups[activeRound].map((match, index) => renderMobileMatchup(match, index, activeRound))
              )}
            </div>
          </div>
          
          {/* Desktop Bracket View - Expanded Size */}
          <div className="hidden md:block">
            <div className="overflow-x-auto pb-6">
              <div className="min-w-[1200px] p-6 relative" style={{ height: "1800px" }}>
                {/* Column Headers */}
                <div className="flex mb-6">
                  <div className="w-[150px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Round 1</div>
                  <div className="w-[250px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Round 2</div>
                  <div className="w-[250px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Quarterfinals</div>
                  <div className="w-[250px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Semifinals</div>
                  <div className="w-[250px] text-center font-semibold text-gray-800 dark:text-gray-200 text-lg">Final</div>
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
                    <div className="absolute top-[40px] left-0 w-[180px]">
                      {renderMatchCard(null, 0, "Round 2")}
                    </div>
                    <div className="absolute top-[220px] left-0 w-[180px]">
                      {renderMatchCard(null, 1, "Round 2")}
                    </div>
                    <div className="absolute top-[400px] left-0 w-[180px]">
                      {renderMatchCard(null, 2, "Round 2")}
                    </div>
                    <div className="absolute top-[580px] left-0 w-[180px]">
                      {renderMatchCard(null, 3, "Round 2")}
                    </div>
                    <div className="absolute top-[760px] left-0 w-[180px]">
                      {renderMatchCard(null, 4, "Round 2")}
                    </div>
                    <div className="absolute top-[940px] left-0 w-[180px]">
                      {renderMatchCard(null, 5, "Round 2")}
                    </div>
                    <div className="absolute top-[1120px] left-0 w-[180px]">
                      {renderMatchCard(null, 6, "Round 2")}
                    </div>
                    <div className="absolute top-[1300px] left-0 w-[180px]">
                      {renderMatchCard(null, 7, "Round 2")}
                    </div>
                  </div>

                  {/* Quarterfinals */}
                  <div className="absolute left-[450px] top-0 w-[180px]">
                    <div className="absolute top-[130px] left-0 w-[180px]">
                      {renderMatchCard(null, 0, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[490px] left-0 w-[180px]">
                      {renderMatchCard(null, 1, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[850px] left-0 w-[180px]">
                      {renderMatchCard(null, 2, "Quarterfinals")}
                    </div>
                    <div className="absolute top-[1210px] left-0 w-[180px]">
                      {renderMatchCard(null, 3, "Quarterfinals")}
                    </div>
                  </div>

                  {/* Semifinals */}
                  <div className="absolute left-[700px] top-0 w-[180px]">
                    <div className="absolute top-[310px] left-0 w-[180px]">
                      {renderMatchCard(null, 0, "Semifinals")}
                    </div>
                    <div className="absolute top-[1030px] left-0 w-[180px]">
                      {renderMatchCard(null, 1, "Semifinals")}
                    </div>
                  </div>

                  {/* Finals */}
                  <div className="absolute left-[950px] top-0 w-[180px]">
                    <div className="absolute top-[670px] left-0 w-[180px]">
                      {renderMatchCard(null, 0, "Final")}
                    </div>
                  </div>


                  {/* Connector Lines */}
                  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ height: '1600px', width: '1000px' }}>
                    {/* Round 1 to Round 2 */}
                    <path d="M180,127 L200,127" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,307 L200,307" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,487 L200,487" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,667 L200,667" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,847 L200,847" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,1027 L200,1027" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,1207 L200,1207" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M180,1387 L200,1387" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Round 2 to Quarterfinals */}
                    <path d="M380,130 L430,130 L430,210 L450,210" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,310 L430,310 L430,210 L450,210" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,490 L430,490 L430,570 L450,570" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,670 L430,670 L430,570 L450,570" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,850 L430,850 L430,930 L450,930" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,1030 L430,1030 L430,930 L450,930" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,1210 L430,1210 L430,1290 L450,1290" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M380,1390 L430,1390 L430,1290 L450,1290" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Quarterfinals to Semifinals */}
                    <path d="M630,220 L675,220 L675,390 L700,390" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M630,580 L675,580 L675,390 L700,390" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M630,940 L675,940 L675,1110 L700,1110" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M630,1300 L675,1300 L675,1110 L700,1110" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    
                    {/* Semifinals to Final */}
                    <path d="M880,390 L930,390 L930,750 L950,750" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
                    <path d="M880,1110 L930,1110 L930,750 L950,750" stroke="#ccc" strokeWidth="2" fill="none" className="dark:stroke-gray-600" />
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
                  <div className={`w-7 h-7 ${teamNum <= 4 ? 'bg-blue-100 dark:bg-blue-800' : 'bg-yellow-100 dark:bg-yellow-800'} rounded-full flex items-center justify-center mr-2`}>
                    <span className={`text-xs font-bold ${teamNum <= 4 ? 'text-blue-800 dark:text-blue-200' : 'text-yellow-800 dark:text-yellow-200'}`}>{teamNum}</span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">{teamNames[teamNum]}</span>
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