
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ltrzbddfhyowcdozdbnm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0cnpiZGRmaHlvd2Nkb3pkYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTgyNDgsImV4cCI6MjA4Njg3NDI0OH0.U4a31ntknRDTrJDQKkNZ9Iasv8OVbaTY52X_LcXbu4s";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runDiagnostic() {
    console.log('--- Supabase Diagnostic ---');
    console.log('Project URL:', SUPABASE_URL);

    const tables = ['profiles', 'daily_content', 'daily_content_library', 'journey_progress'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`[ERROR] Table "${table}":`, error.message);
        } else {
            console.log(`[OK] Table "${table}": ${count} rows found.`);
        }
    }

    // Check version 49 specifically
    const { data: v49, error: vErr } = await supabase.from('daily_content_library').select('step_number').eq('version_id', 49).limit(1);
    if (vErr) {
        console.log('[ERROR] Version 49 Check:', vErr.message);
    } else if (v49 && v49.length > 0) {
        console.log('[OK] Version 49 has data.');
    } else {
        console.log('[FAIL] Version 49 is EMPTY.');
    }
}

runDiagnostic();
