module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
        status: "ok",
        version: "1.0.3",
        gateway: "atomopay-hardcoded-test-1",
        time: new Date().toISOString()
    });
};
