require('dotenv').config();
const { getSettings, saveSettings } = require('../lib/settings-store');
(async () => {
    try {
        const settings = await getSettings();
        
        // Ensure payments object exists
        settings.payments = settings.payments || {};
        settings.payments.gateways = settings.payments.gateways || {};
        settings.payments.gateways.atomopay = settings.payments.gateways.atomopay || {};
        
        // Enable Atomopay and set it as active
        settings.payments.gateways.atomopay.enabled = true;
        settings.payments.activeGateway = 'atomopay';
        
        const result = await saveSettings(settings);
        if (result.ok) {
            console.log("Atomopay gateway set successfully!");
        } else {
            console.error("Failed to save settings:", result);
        }
    } catch (e) {
        console.error("Error setting atomopay:", e);
    }
})();
