const axios = require('axios');

const BASE_URL = 'https://api.sleeper.app/v1';

/**
 * Fetches league information by league ID
 * @param {string} leagueId - The ID of the league to fetch
 * @returns {Promise<Object>} - League information
 */
const getLeagueInfo = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league info:', error);
    throw error;
  }
};

/**
 * Fetches users in a league by league ID
 * @param {string} leagueId - The ID of the league
 * @returns {Promise<Array>} - Array of users in the league
 */
const getLeagueUsers = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league users:', error);
    throw error;
  }
};

/**
 * Fetches rosters in a league by league ID
 * @param {string} leagueId - The ID of the league
 * @returns {Promise<Array>} - Array of rosters in the league
 */
const getLeagueRosters = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/rosters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league rosters:', error);
    throw error;
  }
};

/**
 * Fetches playoff bracket information for a league
 * @param {string} leagueId - The ID of the league
 * @returns {Promise<Object>} - Playoff bracket information
 */
const getLeaguePlayoffBracket = async (leagueId) => {
  try {
    // Fetch both winners and losers brackets
    const [winnersResponse, losersResponse] = await Promise.all([
      axios.get(`${BASE_URL}/league/${leagueId}/winners_bracket`),
      axios.get(`${BASE_URL}/league/${leagueId}/losers_bracket`)
    ]);
    
    return {
      winners: winnersResponse.data,
      losers: losersResponse.data
    };
  } catch (error) {
    console.error('Error fetching playoff bracket:', error);
    throw error;
  }
};

/**
 * Fetches matchups for a specific week in a league
 * @param {string} leagueId - The ID of the league
 * @param {number} week - The week number to fetch matchups for
 * @returns {Promise<Array>} - Array of matchups for the specified week
 */
const getLeagueMatchups = async (leagueId, week) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league matchups:', error);
    throw error;
  }
};

module.exports = {
  getLeagueInfo,
  getLeagueUsers,
  getLeagueRosters,
  getLeaguePlayoffBracket,
  getLeagueMatchups
}; 