const { toText } = require('./payment-gateway-config');

const fetchFn = global.fetch
    ? global.fetch.bind(global)
    : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function parseResponseData(response) {
    const text = await response.text().catch(() => '');
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch (_error) {
        return { message: text };
    }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchFn(url, {
            ...options,
            signal: controller.signal
        });
        const data = await parseResponseData(response);
        return { response, data };
    } finally {
        clearTimeout(timeout);
    }
}

function resolveHostAndProtocol(req) {
    const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || 'localhost:3000').trim();
    const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').trim().toLowerCase();
    const protocol = forwardedProto === 'http' || forwardedProto === 'https' ? forwardedProto : 'https';
    return { host, protocol };
}

function resolvePostbackUrl(req, config = {}) {
    if (toText(config.postbackUrl)) return toText(config.postbackUrl);
    const { host, protocol } = resolveHostAndProtocol(req);
    const token = toText(config.webhookToken);
    const params = new URLSearchParams();
    params.set('gateway', 'atomopay');
    if (token) params.set('token', token);
    return `${protocol}://${host}/api/pix/webhook?${params.toString()}`;
}

async function requestCreateTransaction(config = {}, payload = {}) {
    const baseUrl = String(config.baseUrl || 'https://api.atomopay.com.br/v1').replace(/\/+$/, '');
    const apiToken = toText(config.apiToken || config.apiKey);
    
    const endpoint = `${baseUrl}/transactions?api_token=${encodeURIComponent(apiToken)}`;
    const timeoutMs = Number(config.timeoutMs || 12000);
    
    const headers = {
        'Content-Type': 'application/json'
    };

    console.log("Atomopay requestCreateTransaction inputs - payload:", JSON.stringify(payload, null, 2));
    console.log("Atomopay requestCreateTransaction inputs - config:", JSON.stringify(config, null, 2));

    // Handle amount safely (detect if already in cents)
    const rawAmount = Number(payload.amount || 0);
    const amountInCents = rawAmount > 500 && Number.isInteger(rawAmount) ? rawAmount : Math.round(rawAmount * 100);
    
    const offerHash = toText(payload.offer_hash) || toText(config.offerHash) || '6qiwtppuic';
    
    const name = toText(payload.customer?.name || payload.personal?.name);
    const email = toText(payload.customer?.email || payload.personal?.email);
    const document = toText(payload.customer?.document || payload.customer?.cpf || payload.personal?.document || payload.personal?.cpf);
    const phone = toText(payload.customer?.phone || payload.personal?.phone);

    const atomopayPayload = {
        amount: amountInCents,
        offer_hash: offerHash,
        payment_method: 'pix',
        cart: [
            {
                title: payload.rewardName || 'Kit Bíblico',
                product_hash: offerHash,
                operation_type: 1,
                quantity: 1,
                price: amountInCents
            }
        ],
        customer: {
            name,
            email,
            document,
            phone
        }
    };

    console.log("Atomopay requestCreateTransaction outgoing atomopayPayload:", JSON.stringify(atomopayPayload, null, 2));

    let last = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await fetchWithTimeout(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(atomopayPayload)
        }, timeoutMs);
        last = result;
        if (result.response?.ok) return result;

        const status = Number(result.response?.status || 0);
        const retryable = status === 408 || status === 429 || status >= 500 || !status;
        if (!retryable || attempt === 2) return result;
        await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
    }

    return last || { response: { ok: false, status: 500 }, data: { error: 'request_failed' } };
}

async function requestTransactionById(config = {}, transactionId = '') {
    const txid = String(transactionId || '').trim();
    if (!txid) {
        return { response: { ok: false, status: 400 }, data: { error: 'missing_transaction_id' } };
    }
    const baseUrl = String(config.baseUrl || '').replace(/\/+$/, '');
    const apiToken = toText(config.apiToken || config.apiKey);
    
    const endpoint = `${baseUrl}/transactions/${encodeURIComponent(txid)}?api_token=${encodeURIComponent(apiToken)}`;
    const timeoutMs = Number(config.timeoutMs || 12000);
    const headers = {
        'Content-Type': 'application/json'
    };

    let last = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
        const result = await fetchWithTimeout(endpoint, {
            method: 'GET',
            headers
        }, timeoutMs);
        last = result;
        if (result.response?.ok || Number(result.response?.status || 0) === 404) return result;

        const status = Number(result.response?.status || 0);
        const retryable = status === 408 || status === 429 || status >= 500 || !status;
        if (!retryable || attempt === 2) return result;
        await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
    }

    return last || { response: { ok: false, status: 500 }, data: { error: 'status_failed' } };
}

module.exports = {
    requestCreateTransaction,
    requestTransactionById,
    resolvePostbackUrl
};

