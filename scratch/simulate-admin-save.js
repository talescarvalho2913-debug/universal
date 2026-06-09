const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
    try {
        const res = await fetch('http://localhost:3000/api/admin/settings', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer Leo12345!',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payments: {
                    activeGateway: "atomopay",
                    gateways: {
                        atomopay: {
                            enabled: true,
                            baseUrl: "",
                            apiToken: "",
                            offerHash: "",
                            webhookToken: ""
                        }
                    }
                }
            })
        });
        
        const data = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Response: ${data}`);
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
