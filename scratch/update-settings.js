const { getSettings, saveSettings } = require('../lib/settings-store');

(async () => {
    try {
        const settings = await getSettings();
        settings.pixel = settings.pixel || {};
        settings.pixel.enabled = true;
        settings.pixel.id = '973768458692846';
        settings.pixel.accessToken = 'EAAVnBHa2r9cBRhwpOcZBHWZCyCxvi5fXuI05w7yE7OCxeqZBBwKscsjBQUwtQyMh8WG4jQjFX9uZC5nt5PdBsCg2jt8OqVVr4yOAaqsIm8YN3CA0ua1pzOPMHRbrAldQSZAwZBVunR24pbZCX7JSN9zjhAZB63nBNBQLTFZBAUw0ZA94mbnQkVkTqyNwWMk12yfAZDZD';
        settings.pixel.events = {
            pageView: true,
            lead: true,
            checkout: true,
            purchase: true
        };
        
        await saveSettings(settings);
        console.log("Settings updated successfully!");
    } catch (e) {
        console.error("Error:", e);
    }
})();
