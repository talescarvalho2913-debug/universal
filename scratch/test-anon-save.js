const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SETTINGS_KEY = 'admin_config';

(async () => {
    try {
        const payload = {
            key: SETTINGS_KEY,
            value: { test: true },
            updated_at: new Date().toISOString()
        };

        const endpoint = `${SUPABASE_URL}/rest/v1/app_settings`;
        const response = await fetch(endpoint, {
            method: 'POST',
            cache: 'no-store',
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify([payload])
        });

        const data = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${data}`);
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
