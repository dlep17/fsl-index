const sleeperApiService = require("./sleeperApiService.cjs");
const { createClient } = require("@supabase/supabase-js");
const { generateBracket } = require("./generate-fsl-cup-bracket.cjs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DIV1_LEAGUE_ID = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV1;
const DIV2_LEAGUE_ID = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV2;
const FSL_CUP_WEEK_START = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV1;
const FSL_CUP_WEEK_END = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV2;
const DIV1_PREVIOUS_SEASON_LEAGUE_ID = null;
const DIV2_PREVIOUS_SEASON_LEAGUE_ID = null;

const supabase = createClient(supabaseUrl, supabaseKey);

// Check for required environment variables
const missingVars = [];
if (!supabaseUrl) missingVars.push("SUPABASE_URL");
if (!supabaseKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
if (!DIV1_LEAGUE_ID) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV1");
if (!DIV2_LEAGUE_ID) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV2");
if (!FSL_CUP_WEEK_START) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV1");
if (!FSL_CUP_WEEK_END) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV2");

// Move the await code into an async function
async function initialize() {
  const { data: leagueHistory, error: leagueHistoryError } = await supabase
    .from("league_history")
    .select("league_id, previous_season_league_id")
    .in("league_id", [DIV1_LEAGUE_ID, DIV2_LEAGUE_ID]);

  if (leagueHistoryError) {
    console.error("❌ Error retrieving league history:", leagueHistoryError);
    process.exit(1);
  }

  const DIV1_PREVIOUS_SEASON_LEAGUE_ID = leagueHistory.find(
    (league) => league.league_id === DIV1_LEAGUE_ID
  ).previous_season_league_id;
  const DIV2_PREVIOUS_SEASON_LEAGUE_ID = leagueHistory.find(
    (league) => league.league_id === DIV2_LEAGUE_ID
  ).previous_season_league_id;

  if (
    DIV1_PREVIOUS_SEASON_LEAGUE_ID === null ||
    DIV2_PREVIOUS_SEASON_LEAGUE_ID === null
  ) {
    console.error(
      "❌ Unable to retrieve previous season league id for either league"
    );
    process.exit(1);
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing environment variables:", missingVars.join(", "));
    console.error("Please ensure all required environment variables are set.");
    process.exit(1);
  }

  console.log("✅ All environment variables are set");
  console.log(`📊 Division 1 League ID: ${DIV1_LEAGUE_ID}`);
  console.log(`📊 Division 2 League ID: ${DIV2_LEAGUE_ID}`);
  console.log(
    `📊 Division 1 Previous Season League ID: ${DIV1_PREVIOUS_SEASON_LEAGUE_ID}`
  );
  console.log(
    `📊 Division 2 Previous Season League ID: ${DIV2_PREVIOUS_SEASON_LEAGUE_ID}`
  );
  console.log(`�� FSL Cup Week Start: ${FSL_CUP_WEEK_START}`);
  console.log(`📊 FSL Cup Week End: ${FSL_CUP_WEEK_END}`);

  // Call the main run function
  await run();
}

//TODO: Make this a common function and use it in the LeagueOverview.js and FSLCup.js components
const processTeamData = (
  previousLeagueUsers,
  previousLeagueRosters,
  currentLeagueRosters,
  currentLeagueMatchups
) => {
  const processedTeams = previousLeagueRosters.map((roster) => {
    // Find the user that matches this roster
    const user =
      previousLeagueUsers.find(
        (user) =>
          user.user_id ===
          (roster.co_owners.length > 0 ? roster.co_owners[0] : roster.owner_id)
      ) || {};

    // Calculate points for and against by properly combining fpts and fpts_decimal values
    const fpts = roster.settings?.fpts || 0;
    const fptsDecimal = roster.settings?.fpts_decimal || 0;
    const fptsAgainst = roster.settings?.fpts_against || 0;
    const fptsAgainstDecimal = roster.settings?.fpts_against_decimal || 0;

    // Combine whole number and decimal parts
    // If decimal part is single digit, pad with a leading zero
    const pointsFor = parseFloat(
      `${fpts}.${
        fptsDecimal < 10 && fptsDecimal > 0 ? "0" + fptsDecimal : fptsDecimal
      }`
    );
    const pointsAgainst = parseFloat(
      `${fptsAgainst}.${
        fptsAgainstDecimal < 10 && fptsAgainstDecimal > 0
          ? "0" + fptsAgainstDecimal
          : fptsAgainstDecimal
      }`
    );

    //get current rosterId to get current matchups
    const currentRosterId = currentLeagueRosters.find(
      (currentRoster) =>
        (currentRoster.co_owners.length > 0
          ? currentRoster.co_owners[0]
          : currentRoster.owner_id) === user.user_id
    )?.roster_id;

    return {
      previousRosterId: roster.roster_id,
      currentRosterId: currentRosterId,
      name: user.display_name || `Team ${roster.roster_id}`,
      owner: user.display_name || "Unknown Owner",
      userId: user.user_id,
      avatar: user.avatar,
      record: {
        wins: roster.settings?.wins || 0,
        losses: roster.settings?.losses || 0,
        ties: roster.settings?.ties || 0,
      },
      pointsFor: pointsFor,
      pointsAgainst: pointsAgainst,
      currentLeagueMatchups: currentLeagueMatchups.find(
        (matchup) => matchup.roster_id === currentRosterId
      ),
    };
  });

  // Sort teams by wins, then by points
  const sortedTeams = processedTeams.sort((a, b) => {
    if (a.record.wins !== b.record.wins) {
      return b.record.wins - a.record.wins;
    }
    return b.pointsFor - a.pointsFor;
  });

  return sortedTeams;
};

const createBracketSeeding = (
  div1TeamsPreviousSeasonProcessed,
  div2TeamsPreviousSeasonProcessed
) => {
  const bracketSeeding = {
    // Teams 1-4: Top 4 teams from Premier League
    1:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[0]) ||
      "Premier Team 1",
    2:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[1]) ||
      "Premier Team 2",
    3:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[2]) ||
      "Premier Team 3",
    4:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[3]) ||
      "Premier Team 4",

    // Teams 5-8: Top 4 teams from Championship
    5:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[0]) ||
      "Championship Team 1",
    6:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[1]) ||
      "Championship Team 2",
    7:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[2]) ||
      "Championship Team 3",
    8:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[3]) ||
      "Championship Team 4",

    // Teams 9-16: Teams 5-12 from Premier League
    9:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[4]) ||
      "Premier Team 5",
    10:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[5]) ||
      "Premier Team 6",
    11:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[6]) ||
      "Premier Team 7",
    12:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[7]) ||
      "Premier Team 8",
    13:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[8]) ||
      "Premier Team 9",
    14:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[9]) ||
      "Premier Team 10",
    15:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[10]) ||
      "Premier Team 11",
    16:
      processBracketTeam(div1TeamsPreviousSeasonProcessed[11]) ||
      "Premier Team 12",

    // Teams 17-24: Teams 5-12 from Championship
    17:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[4]) ||
      "Championship Team 5",
    18:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[5]) ||
      "Championship Team 6",
    19:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[6]) ||
      "Championship Team 7",
    20:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[7]) ||
      "Championship Team 8",
    21:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[8]) ||
      "Championship Team 9",
    22:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[9]) ||
      "Championship Team 10",
    23:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[10]) ||
      "Championship Team 11",
    24:
      processBracketTeam(div2TeamsPreviousSeasonProcessed[11]) ||
      "Championship Team 12",
  };

  return bracketSeeding;
};

const processBracketTeam = (team) => {
  return {
    userId: team.userId,
    rosterId: team.currentRosterId,
    name: team.name,
    currentLeagueMatchups: team.currentLeagueMatchups,
  };
};

const getBracketScore = (team, leg1week, leg2week) => {
  return (
    (team.currentLeagueMatchups.find((matchup) => matchup.week === leg1week) ||
      0) +
    (team.currentLeagueMatchups.find((matchup) => matchup.week === leg2week) ||
      0)
  );
};

async function run() {
  try {
    console.log("🔄 Starting FSL Cup Weekly Processor...");

    var div1CurrentLeagueInfo = await sleeperApiService.getLeagueInfo(
      DIV1_LEAGUE_ID
    );
    var div2CurrentLeagueInfo = await sleeperApiService.getLeagueInfo(
      DIV2_LEAGUE_ID
    );

    const div1CurrentWeek = div1CurrentLeagueInfo.settings.leg;
    const div2CurrentWeek = div2CurrentLeagueInfo.settings.leg;

    if (div1CurrentWeek === null || div2CurrentWeek === null) {
      if (div1CurrentWeek !== div2CurrentWeek) {
        console.error("❌ Current week is not the same for both leagues");
        process.exit(1);
      }
      console.error("❌ No current week found for either league");
      process.exit(1);
    }

    const currentWeek = div1CurrentWeek;
    const currentSeason = div1CurrentLeagueInfo.season;

    if (currentWeek < FSL_CUP_WEEK_START || currentWeek > FSL_CUP_WEEK_END) {
      console.error(
        "❌ Current week is not between FSL Cup Week Start and FSL Cup Week End. Exiting..."
      );
      process.exit(1);
    }

    console.log("📊 Getting matchups...");
    var div1Matchups = [];
    var div2Matchups = [];

    for (let week = FSL_CUP_WEEK_START; week <= currentWeek; week++) {
      if (week < FSL_CUP_WEEK_START || week > FSL_CUP_WEEK_END) {
        console.error(
          "❌ Week is not between FSL Cup Week Start and FSL Cup Week End. No need to process. Exiting..."
        );
        process.exit(1);
      }

      const div1WeekMatchups = await sleeperApiService.getLeagueMatchups(
        DIV1_LEAGUE_ID,
        week
      );
      const div2WeekMatchups = await sleeperApiService.getLeagueMatchups(
        DIV2_LEAGUE_ID,
        week
      );

      // Add week field to each matchup
      div1WeekMatchups.forEach((matchup) => (matchup.week = week));
      div2WeekMatchups.forEach((matchup) => (matchup.week = week));

      div1Matchups.push(div1WeekMatchups);
      div2Matchups.push(div2WeekMatchups);

      console.log(
        `📊 Matchups for week ${week}: ${div1WeekMatchups.length} div1, ${div2WeekMatchups.length} div2`
      );
    }

    if (div1Matchups.length === 0 || div2Matchups.length === 0) {
      console.error("❌ No matchups found for any week");
      process.exit(1);
    }

    console.log(`📊 Div1 Matchups: ${div1Matchups}`);
    console.log(`📊 Div2 Matchups: ${div2Matchups}`);

    console.log("📊 Getting previous season users and teams...");
    var div1UsersPreviousSeason = await sleeperApiService.getLeagueUsers(
      DIV1_PREVIOUS_SEASON_LEAGUE_ID
    );
    var div2UsersPreviousSeason = await sleeperApiService.getLeagueUsers(
      DIV2_PREVIOUS_SEASON_LEAGUE_ID
    );

    if (
      div1UsersPreviousSeason.length === 0 ||
      div2UsersPreviousSeason.length === 0
    ) {
      console.error("❌ No users found for either league");
      process.exit(1);
    }

    var div1RostersPreviousSeason = await sleeperApiService.getLeagueRosters(
      DIV1_PREVIOUS_SEASON_LEAGUE_ID
    );
    var div2RostersPreviousSeason = await sleeperApiService.getLeagueRosters(
      DIV2_PREVIOUS_SEASON_LEAGUE_ID
    );

    if (
      div1RostersPreviousSeason.length === 0 ||
      div2RostersPreviousSeason.length === 0
    ) {
      console.error(
        "❌ No rosters found for previous season for either league"
      );
      process.exit(1);
    }

    var div1RostersCurrentSeason = await sleeperApiService.getLeagueRosters(
      DIV1_LEAGUE_ID
    );
    var div2RostersCurrentSeason = await sleeperApiService.getLeagueRosters(
      DIV2_LEAGUE_ID
    );

    if (
      div1RostersCurrentSeason.length === 0 ||
      div2RostersCurrentSeason.length === 0
    ) {
      console.error("❌ No rosters found for current season for either league");
      process.exit(1);
    }

    var div1TeamsPreviousSeasonProcessed = processTeamData(
      div1UsersPreviousSeason,
      div1RostersPreviousSeason,
      div1RostersCurrentSeason,
      div1Matchups
    );
    var div2TeamsPreviousSeasonProcessed = processTeamData(
      div2UsersPreviousSeason,
      div2RostersPreviousSeason,
      div2RostersCurrentSeason,
      div2Matchups
    );

    if (
      div1TeamsPreviousSeasonProcessed.length === 0 ||
      div2TeamsPreviousSeasonProcessed.length === 0
    ) {
      console.error("❌ No teams found for either league after processing");
      process.exit(1);
    }

    console.log(
      `📊 Div1 Teams Previous Season Processed: ${div1TeamsPreviousSeasonProcessed}`
    );
    console.log(
      `📊 Div2 Teams Previous Season Processed: ${div2TeamsPreviousSeasonProcessed}`
    );

    // Create team names mapping based on standings
    const bracketSeeding = createBracketSeeding(
      div1TeamsPreviousSeasonProcessed,
      div2TeamsPreviousSeasonProcessed
    );

    const fslCupBracket = generateBracket(bracketSeeding, currentWeek);

    if (fslCupBracket.length === 0) {
      console.error("❌ No FSL Cup Bracket found");
      process.exit(1);
    }

    console.log(`📊 FSL Cup Bracket: ${fslCupBracket}`);

    const fslCupData = {
      season: currentSeason,
      bracket: fslCupBracket,
      div_1_league_id: DIV1_LEAGUE_ID,
      div_2_league_id: DIV2_LEAGUE_ID,
      current_week: currentWeek,
    };

    // Insert all records in one operation
    const { data, error } = await supabase.from("fsl_cup").insert(fslCupData);

    if (error) {
      console.error("❌ Error inserting records:", error);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${fslCupData.length} records`);
    console.log("Inserted data:", data);
  } catch (err) {
    console.error("❌ Job failed:", err);
    process.exit(1);
  }
}

// Call initialize to start the script
initialize().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
