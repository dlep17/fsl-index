//TODO: figure out how to not hardcode these
const round1Leg1Week = 3;
const round1Leg2Week = 4;
const round2Leg1Week = 5;
const round2Leg2Week = 6;
const round3Leg1Week = 7;
const round3Leg2Week = 8;
const round4Leg1Week = 9;
const round4Leg2Week = 10;
const round5Leg1Week = 11;
const round5Leg2Week = 12;

const generateBracket = (bracketSeeding, currentWeek) => {
  const bracket = {
    rounds: [
      {
        round: 1,
        matchups: [
          createMatchup(
            1,
            bracketSeeding[16],
            bracketSeeding[17],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            2,
            bracketSeeding[15],
            bracketSeeding[18],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            3,
            bracketSeeding[14],
            bracketSeeding[19],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            4,
            bracketSeeding[13],
            bracketSeeding[20],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            5,
            bracketSeeding[12],
            bracketSeeding[21],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            7,
            bracketSeeding[10],
            bracketSeeding[23],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            6,
            bracketSeeding[11],
            bracketSeeding[22],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
          createMatchup(
            8,
            bracketSeeding[9],
            bracketSeeding[24],
            round1Leg1Week,
            round1Leg2Week,
            currentWeek,
            1
          ),
        ],
      },
    ],
  };

  bracket.rounds.push(generateRound2(bracket, bracketSeeding, currentWeek));
  bracket.rounds.push(generateRound3(bracket, bracketSeeding, currentWeek));
  bracket.rounds.push(generateRound4(bracket, bracketSeeding, currentWeek));
  bracket.rounds.push(generateRound5(bracket, bracketSeeding, currentWeek));

  return bracket;
};

const generateRound2 = (bracket, bracketSeeding, currentWeek) => {
  return {
    round: 2,
    matchups: [
      createMatchup(
        9,
        bracketSeeding[1],
        bracket.rounds[0].matchups[0].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        10,
        bracketSeeding[2],
        bracket.rounds[0].matchups[1].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        11,
        bracketSeeding[3],
        bracket.rounds[0].matchups[2].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        12,
        bracketSeeding[4],
        bracket.rounds[0].matchups[3].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        13,
        bracketSeeding[5],
        bracket.rounds[0].matchups[4].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        14,
        bracketSeeding[6],
        bracket.rounds[0].matchups[5].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        15,
        bracketSeeding[7],
        bracket.rounds[0].matchups[6].winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
      createMatchup(
        16,
        bracketSeeding[8],
        bracket.rounds[0]?.matchups[7]?.winner,
        round2Leg1Week,
        round2Leg2Week,
        currentWeek,
        2
      ),
    ],
  };
};

const generateRound3 = (bracket, bracketSeeding, currentWeek) => {
  return {
    round: 3,
    matchups: [
      createMatchup(
        17,
        bracket.rounds[1].matchups[0].winner,
        bracket.rounds[1].matchups[1].winner,
        round3Leg1Week,
        round3Leg2Week,
        currentWeek,
        3
      ),
      createMatchup(
        18,
        bracket.rounds[1].matchups[2].winner,
        bracket.rounds[1].matchups[3].winner,
        round3Leg1Week,
        round3Leg2Week,
        currentWeek,
        3
      ),
      createMatchup(
        19,
        bracket.rounds[1].matchups[4].winner,
        bracket.rounds[1].matchups[5].winner,
        round3Leg1Week,
        round3Leg2Week,
        currentWeek,
        3
      ),
      createMatchup(
        20,
        bracket.rounds[1].matchups[6].winner,
        bracket.rounds[1].matchups[7].winner,
        round3Leg1Week,
        round3Leg2Week,
        currentWeek,
        3
      ),
    ],
  };
};

const generateRound4 = (bracket, bracketSeeding, currentWeek) => {
  return {
    round: 4,
    matchups: [
      createMatchup(
        21,
        bracket.rounds[2].matchups[0].winner,
        bracket.rounds[2].matchups[1].winner,
        round4Leg1Week,
        round4Leg2Week,
        currentWeek,
        4
      ),
      createMatchup(
        22,
        bracket.rounds[2].matchups[2].winner,
        bracket.rounds[2].matchups[3].winner,
        round4Leg1Week,
        round4Leg2Week,
        currentWeek,
        4
      ),
    ],
  };
};

const generateRound5 = (bracket, bracketSeeding, currentWeek) => {
  return {
    round: 5,
    matchups: [
      createMatchup(
        23,
        bracket.rounds[3].matchups[0].winner,
        bracket.rounds[3].matchups[1].winner,
        round5Leg1Week,
        round5Leg2Week,
        currentWeek,
        5
      ),
    ],
  };
};

const createMatchup = (
  matchId,
  team1,
  team2,
  leg1Week,
  leg2Week,
  currentWeek,
  round
) => {
  const team1Score = getBracketScore(team1, leg1Week, leg2Week);
  const team2Score = getBracketScore(team2, leg1Week, leg2Week);

  const matchup = {
    matchId,
    team1,
    team2,
    team1Score,
    team2Score,
    round,
    winner: null,
  };

  // Determine winner
  matchup.winner = determineWinner(matchup, currentWeek, leg1Week, leg2Week);

  return matchup;
};

const determineWinner = (matchup, currentWeek, leg1Week, leg2Week) => {
  // If we haven't reached the first leg, no winner yet
  if (currentWeek < leg2Week) {
    return null;
  }

  // Both legs completed, determine winner based on total score
  return matchup.team1Score > matchup.team2Score
    ? matchup.team1
    : matchup.team2;
};

const getBracketScore = (team, leg1week, leg2week) => {
  return (
    (team.currentLeagueMatchups.find((matchup) => matchup.week === leg1week)
      .points || 0.0) +
    (team.currentLeagueMatchups.find((matchup) => matchup.week === leg2week)
      .points || 0.0)
  );
};

module.exports = { generateBracket, getBracketScore };
