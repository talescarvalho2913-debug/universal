module.exports = async (req, res) => {
    try {
        const { getSettings } = require('../../lib/settings-store');
        const { getPaymentsConfig } = require('../../lib/payments-config-store');
        const { resolveGatewayFromPayload } = require('../../lib/payment-gateway-config');
        
        const settings = await getSettings();
        const payments = await getPaymentsConfig();
        const gateway = resolveGatewayFromPayload({}, payments.activeGateway);

        res.status(200).json({
            status: "Debug Endpoint Active",
            env: {
                PAYMENTS_ACTIVE_GATEWAY: process.env.PAYMENTS_ACTIVE_GATEWAY,
                SUNIZE_API_KEY: process.env.SUNIZE_API_KEY ? 'Set' : 'Unset',
                SUNIZE_ENABLED: process.env.SUNIZE_ENABLED,
                SUPABASE_URL: process.env.SUPABASE_URL,
                SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Unset',
            },
            settingsGateway: settings.payments?.activeGateway,
            sunizeEnabledSupabase: settings.payments?.gateways?.sunize?.enabled,
            paymentsStoreConfig: payments,
            resolvedFallbackGateway: gateway
        });
    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
