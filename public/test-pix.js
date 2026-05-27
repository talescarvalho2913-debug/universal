const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '.env.oficial'), 'utf8');

envContent.split('\n').forEach(line => {
    const clean = line.trim();
    if (clean && !clean.startsWith('#')) {
        const [k, ...v] = clean.split('=');
        if (k && v) {
            process.env[k] = v.join('=').replace(/^"|"$/g, '');
        }
    }
});

const crypto = require('crypto');
const s = require('./lib/settings-store.js');

s.getSettings().then(cfg => {
    console.log('[CONFIG] Payments Active Gateway:', cfg.payments.activeGateway);
    console.log('[CONFIG] Payments Gateway Configs:', JSON.stringify(cfg.payments.gateways, null, 2).substring(0, 300) + '...');

    const GUARD_SECRET = process.env.APP_GUARD_SECRET || 'change-this-secret-in-production';
    function sign(input) {
        return crypto.createHmac('sha256', GUARD_SECRET).update(input).digest('base64url');
    }

    const uaHash = crypto.createHash('sha256').update('curl').digest('hex').slice(0, 32);
    const payload = { h: 'localhost', ua: uaHash, t: Date.now() };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = encoded + '.' + sign(encoded);

    const req = {
        method: 'POST',
        headers: {
            'x-forwarded-host': 'localhost',
            'user-agent': 'curl',
            'cookie': 'ifb_session=' + encodeURIComponent(token)
        },
        body: {
            sessionId: 'test_' + Date.now(),
            gateway: cfg.payments.activeGateway,
            amount: 28.9,
            personal: { name: 'Teste Comprador', cpf: '444.444.444-44', email: 'teste@teste.com', phone: '11999999999' },
            address: { cep: '01001-000', street: 'Praca da Se', number: '123', neighborhood: 'Se', city: 'Sao Paulo', state: 'SP' },
            shipping: { id: 'frete', name: 'Frete Expresso', price: 0, basePrice: 0, originalPrice: 0 },
            bump: { selected: true, title: 'Seguro Bag', price: 10.9 },
            utm: { utm_source: 'test' }
        }
    };

    const res = {
        setHeader: () => { },
        status: (status) => ({
            json: (data) => {
                console.log(`[PIX RESPONSE] STATUS: ${status}`);
                console.log(`[PIX RESPONSE] DATA:`, JSON.stringify(data, null, 2));
            }
        }),
        json: (data) => {
            console.log(`[PIX RESPONSE] STATUS: 200`);
            console.log(`[PIX RESPONSE] DATA:`, JSON.stringify(data, null, 2));
        }
    };

    require('./api/pix/create.js')(req, res).catch(e => console.error('[FATAL]', e));
}).catch(e => console.error('[SETTINGS ERROR]', e));
