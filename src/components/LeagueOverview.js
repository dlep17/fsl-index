import React, { useState, useEffect } from 'react';
import sleeperApiService from '../services/sleeperApiService';
import TeamCard from './TeamCard';

/**
 * LeagueOverview component displays the standings of a fantasy league
 * @param {string} leagueId - The ID of the league to display
 * @param {string} leagueType - The type of league (premier/championship)
 * @param {number[]} promotionZone - Array of positions in promotion zone
 * @param {number[]} relegationZone - Array of positions in relegation zone
 * @returns {JSX.Element} - LeagueOverview component
 */
const LeagueOverview = ({ leagueId, leagueType, promotionZone = [], relegationZone = [] }) => {
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialPromotionTeam, setSpecialPromotionTeam] = useState(null);
  const [specialRelegationTeam, setSpecialRelegationTeam] = useState(null);
  const [winnersBracketChampion, setWinnersBracketChampion] = useState(null);
  const [fslCupByeTeams, setFslCupByeTeams] = useState([]);

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from Sleeper API
        const [leagueData, usersData, rostersData, bracketData] = await Promise.all([
          sleeperApiService.getLeagueInfo(leagueId),
          sleeperApiService.getLeagueUsers(leagueId),
          sleeperApiService.getLeagueRosters(leagueId),
          sleeperApiService.getLeaguePlayoffBracket(leagueId).catch(err => {
            console.warn('Playoff bracket data not available:', err);
            return null;
          })
        ]);
        
        setLeagueInfo(leagueData);
        
        // Process and combine data
        const processedTeams = processTeamData(usersData, rostersData);
        
        // Process playoff bracket data if available
        if (bracketData) {
          processPlayoffBracketData(bracketData, processedTeams, rostersData, leagueType);
        }
        
        // Set FSL Cup bye teams for the top 4 teams in each league
        // For both league types, first 4 teams get byes
        if (processedTeams.length >= 4) {
          const byeTeams = processedTeams.slice(0, 4).map(team => team.rosterId);
          setFslCupByeTeams(byeTeams);
        }
        
      } catch (err) {
        console.error('Error fetching league data:', err);
        setError('Failed to load league data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeagueData();
  }, [leagueId, leagueType]);
  
  // Process playoff bracket data to determine special promotion/relegation teams
  const processPlayoffBracketData = (bracketData, processedTeams, rostersData, leagueType) => {
    try {
      // Check if we have valid bracket data
      if (!bracketData || (!bracketData.winners && !bracketData.losers)) {
        console.warn('No valid playoff bracket data available');
        return;
      }
      
      // Process winners bracket for both leagues
      if (bracketData.winners) {
        const winnersMatches = Object.values(bracketData.winners);
        
        // Find the final match in the winners bracket (championship game)
        // The final match is in the third round (r = 3)
        const championshipFinal = winnersMatches.find(match => match.r === 3);
        
        if (championshipFinal && championshipFinal.w) {
          // Set the winner of the winners bracket as champion
          setWinnersBracketChampion(championshipFinal.w);
          
          // Only set special promotion for championship league (not premier league)
          if (leagueType === 'championship') {
            setSpecialPromotionTeam(championshipFinal.w);
          }
        }
      }
      
      // Process losers bracket (for relegation in both leagues)
      if (bracketData.losers) {
        const losersMatches = Object.values(bracketData.losers);
        
        // Find the final match in the losers bracket
        // For the losers bracket, we need to find the match with r = 3
        const consolationFinal = losersMatches.find(match => match.r === 3);
        
        if (consolationFinal && consolationFinal.w) {
          // The LOSER of the losers bracket final gets relegated
          setSpecialRelegationTeam(consolationFinal.w);
        }
      }
    } catch (err) {
      console.error('Error processing playoff bracket data:', err);
    }
  };
  
  // Process and combine data from different API endpoints
  const processTeamData = (usersData, rostersData) => {
    const processedTeams = rostersData.map(roster => {
      // Find the user that matches this roster
      const user = usersData.find(user => user.user_id === (roster.co_owners.length > 0 ? roster.co_owners[0] : roster.owner_id)) || {};
      
      // Calculate points for and against by properly combining fpts and fpts_decimal values
      const fpts = roster.settings?.fpts || 0;
      const fptsDecimal = roster.settings?.fpts_decimal || 0;
      const fptsAgainst = roster.settings?.fpts_against || 0;
      const fptsAgainstDecimal = roster.settings?.fpts_against_decimal || 0;
      
      // Combine whole number and decimal parts
      // If decimal part is single digit, pad with a leading zero
      const pointsFor = parseFloat(`${fpts}.${fptsDecimal < 10 && fptsDecimal > 0 ? '0' + fptsDecimal : fptsDecimal}`);
      const pointsAgainst = parseFloat(`${fptsAgainst}.${fptsAgainstDecimal < 10 && fptsAgainstDecimal > 0 ? '0' + fptsAgainstDecimal : fptsAgainstDecimal}`);
      
      // Extract actual game results from metadata.record
      let recentForm = [];
      
      if (roster.metadata && roster.metadata.record) {
        // The record string contains W and L characters representing wins and losses
        const recordString = roster.metadata.record;
        
        // Convert the record string to an array of W and L
        const fullRecord = recordString.split('').filter(char => char === 'W' || char === 'L');
        
        // Get the last 5 games (most recent first)
        recentForm = fullRecord.slice(-5).reverse();
      }
      
      // If no record data is available or less than 5 games, pad with placeholder
      while (recentForm.length < 5) {
        recentForm.push('-');
      }
      
      return {
        rosterId: roster.roster_id,
        name: user.display_name || `Team ${roster.roster_id}`,
        owner: user.display_name || 'Unknown Owner',
        avatar: user.avatar,
        record: {
          wins: roster.settings?.wins || 0,
          losses: roster.settings?.losses || 0,
          ties: roster.settings?.ties || 0
        },
        pointsFor: pointsFor,
        pointsAgainst: pointsAgainst,
        recentForm: recentForm // Last 5 games, most recent first
      };
    });
    
    // Sort teams by wins, then by points
    const sortedTeams = processedTeams.sort((a, b) => {
      if (a.record.wins !== b.record.wins) {
        return b.record.wins - a.record.wins;
      }
      return b.pointsFor - a.pointsFor;
    });
    
    setTeams(sortedTeams);
    return sortedTeams;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Table Headers - Only visible on tablet+ */}
      <div className="hidden sm:grid sm:grid-cols-10 bg-gray-50 dark:bg-gray-700 py-2 px-3 border-b border-gray-200 dark:border-gray-600 font-medium text-gray-500 dark:text-gray-300 text-sm">
        <div className="col-span-3">Team</div>
        <div className="col-span-1 text-center">Record</div>
        <div className="col-span-2 text-center">PF</div>
        <div className="col-span-2 text-center">PA</div>
        <div className="col-span-2 text-center">Last 5</div>
      </div>
      
      {/* Mobile Header */}
      <div className="sm:hidden bg-gray-50 dark:bg-gray-700 py-3 px-4 border-b border-gray-200 dark:border-gray-600">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">League Standings</h2>
      </div>
      
      {/* Team Cards */}
      <div>
        {teams.length > 0 ? (
          teams.map((team, index) => {
            const position = index + 1;
            
            // Determine if this team is in a special promotion/relegation zone
            const isSpecialPromotion = team.rosterId === specialPromotionTeam;
            const isSpecialRelegation = team.rosterId === specialRelegationTeam;
            const isChampion = team.rosterId === winnersBracketChampion;
            const hasFSLCupBye = fslCupByeTeams.includes(team.rosterId);
            
            return (
              <TeamCard 
                key={team.rosterId} 
                team={team} 
                rank={position}
                isPromotionZone={promotionZone.includes(position) || isSpecialPromotion}
                isRelegationZone={relegationZone.includes(position) || isSpecialRelegation}
                isSpecialPromotion={isSpecialPromotion}
                isSpecialRelegation={isSpecialRelegation}
                isChampion={isChampion}
                hasFSLCupBye={hasFSLCupBye}
              />
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No teams found in this league.
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 text-sm">
          {winnersBracketChampion && (
            <div className="flex items-center">
              <span className="w-5 h-5 flex items-center justify-center text-yellow-500 mr-1">🏆</span>
              <span className="text-gray-600 dark:text-gray-300">League Champion</span>
            </div>
          )}
          {(promotionZone.length > 0 || specialPromotionTeam) && (
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600 dark:text-gray-300">Promotion</span>
            </div>
          )}
          {specialPromotionTeam && specialPromotionTeam !== winnersBracketChampion && leagueType === 'championship' && (
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 border-2 border-green-700 rounded-full mr-2"></span>
              <span className="text-gray-600 dark:text-gray-300">Playoff Promotion</span>
            </div>
          )}
          {(relegationZone.length > 0 || specialRelegationTeam) && (
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-gray-600 dark:text-gray-300">Relegation</span>
            </div>
          )}
          {fslCupByeTeams.length > 0 && (
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              <span className="text-gray-600 dark:text-gray-300">FSL Cup First-Round Bye</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueOverview; 