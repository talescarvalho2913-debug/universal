
const crypto = require('crypto');
const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function hash(value) {
    if (!value) return null;
    const clean = String(value).trim().toLowerCase();
    if (!clean) return null;
    return crypto.createHash('sha256').update(clean).digest('hex');
}

function normalizePhone(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return null;
    // FB expects phone with country code
    return digits.length <= 11 ? `55${digits}` : digits;
}

function buildCapiPayload(eventName, payload = {}, pixelConfig = {}) {
    const personal = payload.personal || {};
    const utm = payload.utm || {};
    
    // Attempt to resolve eventId for deduplication
    const eventId = payload.purchaseEventId || payload.eventId || payload.txid || payload.orderId || null;

    const userData = {
        em: [hash(personal.email)],
        ph: [hash(normalizePhone(personal.phoneDigits || personal.phone))],
        zp: [hash(payload.address?.cep)],
        client_ip_address: payload.client_ip || null,
        client_user_agent: payload.user_agent || null,
        fbc: payload.fbc || utm.fbclid ? `fb.1.${Date.now()}.${utm.fbclid}` : null,
        fbp: payload.fbp || null
    };

    // Remove nulls from userData
    Object.keys(userData).forEach(key => {
        if (userData[key] === null || (Array.isArray(userData[key]) && userData[key][0] === null)) {
            delete userData[key];
        }
    });

    const customData = {
        currency: 'BRL',
        value: Number(payload.amount || 0)
    };

    return {
        data: [{
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: 'website',
            event_id: eventId,
            event_source_url: payload.sourceUrl || null,
            user_data: userData,
            custom_data: customData
        }]
    };
}

async function sendFacebookPixel(eventName, payload) {
    const { getSettings } = require('./settings-store');
    const settings = await getSettings().catch(() => ({}));
    const cfg = settings.pixel || {};

    // CAPI requires an Access Token. If missing, we can't send.
    if (!cfg.enabled || !cfg.id || !cfg.accessToken) {
        return { ok: false, reason: 'disabled_or_missing_token' };
    }

    const fbEventName = eventName === 'pix_confirmed' || eventName === 'purchase' || eventName === 'upsell_pix_confirmed' ? 'Purchase' : 
                        eventName === 'pix_created' || eventName === 'checkout' || eventName === 'upsell_pix_created' ? 'InitiateCheckout' : 
                        eventName === 'personal_submitted' ? 'Lead' : 'PageView';

    const capiPayload = buildCapiPayload(fbEventName, payload, cfg);
    const url = `https://graph.facebook.com/v17.0/${cfg.id}/events?access_token=${cfg.accessToken}`;

    try {
        const res = await fetchFn(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(capiPayload)
        });

        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            return { ok: false, reason: 'facebook_error', detail, status: res.status };
        }

        return { ok: true };
    } catch (error) {
        return { ok: false, reason: 'network_error', detail: error.message };
    }
}

module.exports = {
    sendFacebookPixel
};
