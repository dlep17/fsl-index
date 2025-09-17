const sleeperApiService = require("./sleeperApiService.cjs");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DIV1_LEAGUE_ID = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV1;
const DIV2_LEAGUE_ID = process.env.CURRENT_SLEEPER_LEAGUE_ID_DIV2;

// Check for required environment variables
const missingVars = [];
if (!supabaseUrl) missingVars.push("SUPABASE_URL");
if (!supabaseKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
if (!DIV1_LEAGUE_ID) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV1");
if (!DIV2_LEAGUE_ID) missingVars.push("CURRENT_SLEEPER_LEAGUE_ID_DIV2");

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars.join(", "));
  console.error("Please ensure all required environment variables are set.");
  process.exit(1);
}

console.log("✅ All environment variables are set");
console.log(`📊 Division 1 League ID: ${DIV1_LEAGUE_ID}`);
console.log(`📊 Division 2 League ID: ${DIV2_LEAGUE_ID}`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to transform league data
function transformLeagueData(league) {
  return {
    league_id: league.league_id,
    previous_season_league_id: league.previous_league_id,
    league_name: league.name,
    season: league.season,
    draft_id: league.draft_id,
    league_winner_roster_id: league.metadata.latest_league_winner_roster_id,
    league_settings: league.settings,
    playoff_bracket_id: league.bracket_id,
    losers_bracket_id: league.losers_bracket_id,
    active: league.status !== "complete",
    scoring_settings: league.scoring_settings,
  };
}

// Helper function to process a single division
async function processDivision(leagueId, divisionName) {
  console.log(`🔄 Processing ${divisionName}...`);

  const leagueInfo = await sleeperApiService.getLeagueInfo(leagueId);

  console.log(`📊 Found league info for ${divisionName}: ${leagueInfo.name}`);

  const transformedData = transformLeagueData(leagueInfo);

  console.log(`📝 Prepared record for ${divisionName}`);
  console.log(`Sample ${divisionName} data:`, transformedData);

  return transformedData;
}

async function run() {
  try {
    console.log("🔄 Starting league info generation...");

    // Process both divisions in parallel
    const [div1Data, div2Data] = await Promise.all([
      processDivision(DIV1_LEAGUE_ID, "Division 1"),
      processDivision(DIV2_LEAGUE_ID, "Division 2"),
    ]);

    // Combine all data
    const allLeagueData = [div1Data, div2Data];

    console.log(`📝 Total records to insert: ${allLeagueData.length}`);

    // Insert all records in one operation
    const { data, error } = await supabase
      .from("league_history")
      .insert(allLeagueData);

    if (error) {
      console.error("❌ Error inserting records:", error);
      process.exit(1);
    }

    console.log(`✅ Successfully inserted ${allLeagueData.length} records`);
    console.log("Inserted data:", data);
  } catch (err) {
    console.error("❌ Job failed:", err);
    process.exit(1);
  }
}

run();
