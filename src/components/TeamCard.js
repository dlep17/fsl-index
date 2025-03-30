import React from 'react';

/**
 * TeamCard component displays information about a team in a card/row format
 * @param {Object} team - Team data
 * @param {string} team.name - Team name
 * @param {string} team.owner - Team owner name
 * @param {Object} team.record - Team record
 * @param {number} team.record.wins - Number of wins
 * @param {number} team.record.losses - Number of losses
 * @param {number} team.pointsFor - Points scored by the team
 * @param {number} team.pointsAgainst - Points scored against the team
 * @param {Array} team.recentForm - Array of recent results (W, L, D, -)
 * @param {number} rank - Team's position in the league
 * @param {boolean} isPromotionZone - Whether the team is in promotion zone
 * @param {boolean} isRelegationZone - Whether the team is in relegation zone
 * @param {boolean} isSpecialPromotion - Whether the team is promoted based on playoff results
 * @param {boolean} isSpecialRelegation - Whether the team is relegated based on playoff results
 * @param {boolean} isChampion - Whether the team is the league champion
 * @param {boolean} hasFSLCupBye - Whether the team qualifies for FSL Cup first-round bye
 * @returns {JSX.Element} - TeamCard component
 */
const TeamCard = ({ 
  team, 
  rank, 
  isPromotionZone, 
  isRelegationZone,
  isSpecialPromotion = false,
  isSpecialRelegation = false,
  isChampion = false,
  hasFSLCupBye = false
}) => {
  const { name, owner, record, pointsFor, pointsAgainst, recentForm = [] } = team;
  
  // Function to determine the color for form indicators
  const getFormColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-500';
      case 'L': return 'bg-red-500';
      case 'D': return 'bg-gray-400';
      case '-': return 'bg-gray-200 dark:bg-gray-600'; // Placeholder for games not played yet
      default: return 'bg-gray-300 dark:bg-gray-500';
    }
  };

  // Determine background color based on zone
  const getZoneStyle = () => {
    if (isChampion && isSpecialPromotion) {
      return 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 bg-gradient-to-r from-yellow-50/70 to-green-50/70 dark:from-yellow-900/30 dark:to-green-900/30 border-l-4 border-yellow-500';
    }
    if (isChampion) {
      return 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 bg-yellow-50/50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
    }
    if (isSpecialPromotion) {
      return 'hover:bg-green-50 dark:hover:bg-green-900/20 bg-green-50/50 dark:bg-green-900/20 border-l-4 border-green-600';
    }
    if (isPromotionZone) {
      return 'hover:bg-green-50 dark:hover:bg-green-900/20 bg-green-50/30 dark:bg-green-900/10';
    }
    if (isSpecialRelegation) {
      return 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-red-50/50 dark:bg-red-900/20 border-l-4 border-red-600';
    }
    if (isRelegationZone) {
      return 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-red-50/30 dark:bg-red-900/10';
    }
    return 'hover:bg-gray-50 dark:hover:bg-gray-700';
  };

  // Determine rank badge style
  const getRankBadgeStyle = () => {
    if (isChampion && isSpecialPromotion) {
      return 'bg-gradient-to-r from-yellow-500 to-green-600 ring-2 ring-yellow-600 ring-offset-1 dark:ring-offset-gray-800';
    }
    if (isChampion) {
      return 'bg-yellow-500 ring-2 ring-yellow-600 ring-offset-1 dark:ring-offset-gray-800';
    }
    if (isSpecialPromotion) {
      return 'bg-green-600 ring-2 ring-green-800 ring-offset-1 dark:ring-offset-gray-800';
    }
    if (isPromotionZone) {
      return 'bg-green-600';
    }
    if (isSpecialRelegation) {
      return 'bg-red-600 ring-2 ring-red-800 ring-offset-1 dark:ring-offset-gray-800';
    }
    if (isRelegationZone) {
      return 'bg-red-600';
    }
    return 'bg-blue-600';
  };

  // Format points to display with 2 decimal places
  const formatPoints = (points) => {
    return points.toFixed(2);
  };

  // Get the zone text
  const getZoneText = () => {
    const indicators = [];
    
    if (isChampion) {
      indicators.push('🏆 League Champion');
    }
    
    if (isSpecialPromotion) {
      indicators.push('↑ Playoff Promotion');
    } else if (isPromotionZone) {
      indicators.push('↑ Promotion');
    }
    
    if (isSpecialRelegation) {
      indicators.push('↓ Playoff Relegation');
    } else if (isRelegationZone) {
      indicators.push('↓ Relegation');
    }
    
    if (hasFSLCupBye) {
      indicators.push('⭐ FSL Cup Bye');
    }
    
    return indicators.join(' • ');
  };

  // Get the zone text color
  const getZoneTextColor = () => {
    if (isChampion) {
      return 'text-yellow-700 dark:text-yellow-400';
    }
    if (isSpecialPromotion || isPromotionZone) {
      return 'text-green-700 dark:text-green-400';
    }
    if (isSpecialRelegation || isRelegationZone) {
      return 'text-red-700 dark:text-red-400';
    }
    if (hasFSLCupBye && !isChampion && !isPromotionZone && !isRelegationZone) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return '';
  };

  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${getZoneStyle()}`}>
      {/* Mobile view (stack vertically) */}
      <div className="flex flex-col sm:hidden p-4">
        <div className="flex items-center mb-2">
          <span className={`w-8 h-8 flex items-center justify-center ${getRankBadgeStyle()} text-white font-bold rounded-full mr-3`}>
            {rank}
          </span>
          <div>
            <h3 className="font-semibold text-lg flex items-center text-gray-900 dark:text-white">
              {name}
              {hasFSLCupBye && (
                <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400 align-top mt-1" title="FSL Cup First-Round Bye">
                  ⭐
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Owner: {owner}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Record</p>
            <p className="font-medium text-gray-900 dark:text-white">{record.wins}-{record.losses}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatPoints(pointsFor)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Against</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatPoints(pointsAgainst)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Form</p>
            <div className="flex space-x-1 mt-1">
              {recentForm.slice(0, 5).map((result, idx) => (
                <span 
                  key={idx} 
                  className={`w-6 h-6 flex items-center justify-center ${result === '-' ? 'text-gray-400 dark:text-gray-500' : 'text-white'} text-xs font-semibold rounded-full ${getFormColor(result)}`}
                >
                  {result}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Zone Indicator */}
        {(isPromotionZone || isRelegationZone || isSpecialPromotion || isSpecialRelegation || isChampion || hasFSLCupBye) && (
          <div className={`mt-3 text-sm font-medium ${getZoneTextColor()}`}>
            {getZoneText()}
          </div>
        )}
      </div>

      {/* Tablet/Desktop view (row) */}
      <div className="hidden sm:grid sm:grid-cols-10 sm:items-center sm:p-3">
        <div className="col-span-3 flex items-center">
          <span className={`w-8 h-8 flex items-center justify-center ${getRankBadgeStyle()} text-white font-bold rounded-full mr-3`}>
            {rank}
          </span>
          <div>
            <h3 className="font-semibold flex items-center text-gray-900 dark:text-white">
              {name}
              {hasFSLCupBye && (
                <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400 align-top mt-0.5" title="FSL Cup First-Round Bye">
                  ⭐
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Owner: {owner}</p>
            {(isPromotionZone || isRelegationZone || isSpecialPromotion || isSpecialRelegation || isChampion || hasFSLCupBye) && (
              <p className={`text-sm mt-1 font-medium ${getZoneTextColor()}`}>
                {getZoneText()}
              </p>
            )}
          </div>
        </div>
        
        <div className="col-span-1 text-center">
          <p className="font-medium text-gray-900 dark:text-white">{record.wins}-{record.losses}</p>
        </div>
        
        <div className="col-span-2 text-center">
          <p className="font-medium text-gray-900 dark:text-white">{formatPoints(pointsFor)}</p>
        </div>
        
        <div className="col-span-2 text-center">
          <p className="font-medium text-gray-900 dark:text-white">{formatPoints(pointsAgainst)}</p>
        </div>
        
        <div className="col-span-2 flex justify-center space-x-1">
          {recentForm.slice(0, 5).map((result, idx) => (
            <span 
              key={idx} 
              className={`w-6 h-6 flex items-center justify-center ${result === '-' ? 'text-gray-400 dark:text-gray-500' : 'text-white'} text-xs font-semibold rounded-full ${getFormColor(result)}`}
            >
              {result}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCard; 