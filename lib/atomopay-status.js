function getAtomopayTxid(payload = {}) {
    const root = payload || {};
    return String(root.transaction_id || root.id || '').trim();
}

function getAtomopayExternalId(payload = {}) {
    const root = payload || {};
    const metadata = root.metadata || {};
    return String(
        root.external_id ||
        root.reference ||
        metadata.orderId ||
        metadata.externalreference ||
        ''
    ).trim();
}

function getAtomopayStatus(payload = {}) {
    const root = payload || {};
    return String(root.status || root.raw_status || '').trim().toLowerCase();
}

function getAtomopayUpdatedAt(payload = {}) {
    const root = payload || {};
    return root.updated_at || root.paid_at || root.created_at || null;
}

function getAtomopayAmount(payload = {}) {
    const root = payload || {};
    const rawAmount = Number(root.amount || 0);
    // Atomopay amount is usually in cents
    return rawAmount > 1000 ? rawAmount / 100 : rawAmount;
}

function isAtomopayPaidStatus(status) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'paid' || s === 'approved' || s === 'concluida' || s === 'pago';
}

function isAtomopayRefundedStatus(status) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'refunded' || s === 'reversed' || s === 'estornado' || s === 'devolvido';
}

function isAtomopayRefusedStatus(status) {
    const s = String(status || '').trim().toLowerCase();
    return s === 'refused' || s === 'failed' || s === 'canceled' || s === 'cancelled' || s === 'cancelada';
}

function mapAtomopayStatusToUtmify(status) {
    if (isAtomopayPaidStatus(status)) return 'paid';
    if (isAtomopayRefundedStatus(status)) return 'refunded';
    if (isAtomopayRefusedStatus(status)) return 'refused';
    return 'waiting_payment';
}

module.exports = {
    getAtomopayTxid,
    getAtomopayExternalId,
    getAtomopayStatus,
    getAtomopayUpdatedAt,
    getAtomopayAmount,
    isAtomopayPaidStatus,
    isAtomopayRefundedStatus,
    isAtomopayRefusedStatus,
    mapAtomopayStatusToUtmify
};
