require('dotenv').config();
const { getSettings } = require('../lib/settings-store');
const adminPath = require('../api/admin/[...path].js');

(async () => {
    try {
        const req = {
            method: 'POST',
            cookies: { admin_session: 'fake' }, // This won't work because requireAdmin verifies cookie.
            body: {}
        };
        // We will just patch requireAdmin globally or temporarily skip it.
        // Actually, let's just copy the logic in settings() and run it!
        const { buildPaymentsConfig, mergePaymentSettings } = require('../lib/payment-gateway-config');
        const { saveSettings, defaultSettings, getSettings } = require('../lib/settings-store');
        
        function buildPushcutConfig(raw = {}) {
            return {
                ...raw,
                templates: { ...(raw.templates || {}) }
            };
        }
        
        const currentSaved = await getSettings().catch(() => ({}));
        
        const body = {}; // simular payload vazio do front-end
        const bodyPayments = {};
        const bodyGateways = {};
        const bodyAtivus = {};
        const bodyGhost = {};
        const bodyAtomopay = {};
        const bodySunize = {};
        const bodyParadise = {};
        const currentPushcut = currentSaved?.pushcut || {};
        const bodyUtmfy = {};
        const bodyPushcut = {};
        const bodyPixel = {};
        const bodyTikTokPixel = {};
        const currentUtmfy = currentSaved?.utmfy || {};

        const mergedPaymentsInput = {
            ...(bodyPayments || {}),
            gateways: {
                ...(bodyGateways || {}),
                ativushub: { ...bodyAtivus },
                ghostspay: { ...bodyGhost },
                atomopay: { ...bodyAtomopay },
                sunize: { ...bodySunize },
                paradise: { ...bodyParadise }
            }
        };

        const payload = {
            ...defaultSettings,
            ...body,
            pixel: {
                enabled: !!bodyPixel.enabled,
                id: String(bodyPixel.id || '').trim(),
                accessToken: bodyPixel.accessToken || currentSaved?.pixel?.accessToken || '',
                events: {
                    ...defaultSettings.pixel.events,
                    ...(bodyPixel?.events || {})
                }
            },
            tiktokPixel: {
                enabled: !!bodyTikTokPixel.enabled,
                id: String(bodyTikTokPixel.id || '').trim(),
                events: {
                    ...defaultSettings.tiktokPixel.events,
                    ...(bodyTikTokPixel?.events || {})
                }
            },
            utmfy: {
                ...defaultSettings.utmfy,
                ...bodyUtmfy,
                apiKey: bodyUtmfy.apiKey || currentUtmfy.apiKey || ''
            },
            pushcut: buildPushcutConfig({
                ...currentPushcut,
                ...bodyPushcut
            }),
            payments: mergePaymentSettings(currentSaved?.payments || defaultSettings.payments || {}, mergedPaymentsInput),
            features: {
                ...defaultSettings.features,
                ...(body.features || {})
            }
        };

        const result = await saveSettings(payload);
        console.log("saveSettings result:", result);
    } catch (e) {
        console.error("error:", e);
    }
})();
