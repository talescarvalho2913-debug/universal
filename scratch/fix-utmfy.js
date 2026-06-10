require('dotenv').config();
const { getSettings, saveSettings } = require('../lib/settings-store');

(async () => {
    try {
        const settings = await getSettings();
        const currentUtmfy = settings.utmfy || {};
        
        let apiKey = currentUtmfy.apiKey || '';
        
        // Extract token if it's a URL
        if (apiKey.includes('token=')) {
            const urlObj = new URL(apiKey);
            apiKey = urlObj.searchParams.get('token') || apiKey;
        }

        const newSettings = {
            ...settings,
            utmfy: {
                ...currentUtmfy,
                enabled: true,
                apiKey: apiKey
            }
        };

        const result = await saveSettings(newSettings);
        if (result.ok) {
            console.log("UTMfy fixed and enabled! Token:", apiKey);
        } else {
            console.error("Failed to save:", result);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
