import sleeperApiService from '../services/sleeperApiService';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const PREMIER_LEAGUE_ID = '1118356697246031872';

        console.log("🔄 Fetching league data...");
        const [usersData, rostersData] = await Promise.all([
            sleeperApiService.getLeagueUsers(PREMIER_LEAGUE_ID),
            sleeperApiService.getLeagueRosters(PREMIER_LEAGUE_ID),
        ]);

        console.log(`📊 Found ${usersData.length} users and ${rostersData.length} rosters`);

        const fullUsersData = rostersData.map(roster => {
            const user = usersData.find(user => user.user_id === roster.owner_id) || {};
            return {
                owner: user.display_name || 'Unknown Owner',
                owner_id: roster.owner_id,
                wins: roster.settings.wins,
                losses: roster.settings.losses,
            };
        });

        console.log(`📝 Prepared ${fullUsersData.length} records for insertion`);
        console.log("Sample data:", fullUsersData.slice(0, 2));

        // Insert the entire array in one operation
        const { data, error } = await supabase.from('test_sleeper').insert(fullUsersData);

        if (error) {
            console.error("❌ Error inserting records:", error);
            process.exit(1);
        }

        console.log(`✅ Successfully inserted ${fullUsersData.length} records`);
        console.log("Inserted data:", data);

    } catch (err) {
        console.error("❌ Job failed:", err);
        process.exit(1);
    }
}

run();