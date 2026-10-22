const API_URL = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    
    const res = await fetch(`${API_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
}

async function runTest() {
    try {
        console.log("Registering User A...");
        let userA;
        try {
            userA = await request('/auth/register', 'POST', { fullName: 'User A', email: 'usera@test.com', password: 'password123' });
        } catch (e) {
            console.log("User A might already exist, logging in...");
            userA = await request('/auth/login', 'POST', { email: 'usera@test.com', password: 'password123' });
        }

        console.log("Registering User B...");
        let userB;
        try {
            userB = await request('/auth/register', 'POST', { fullName: 'User B', email: 'userb@test.com', password: 'password123' });
        } catch (e) {
            console.log("User B might already exist, logging in...");
            userB = await request('/auth/login', 'POST', { email: 'userb@test.com', password: 'password123' });
        }

        console.log(`User A token: ${userA.token.substring(0, 10)}...`);
        console.log(`User B token: ${userB.token.substring(0, 10)}...`);

        console.log("Adding initial money to User A (10000) and User B (5000)...");
        await request('/account/add-money', 'POST', { amount: 10000 }, userA.token);
        await request('/account/add-money', 'POST', { amount: 5000 }, userB.token);

        const balA = await request(`/account/${userA.user._id}/balance`, 'GET', null, userA.token);
        const balB = await request(`/account/${userB.user._id}/balance`, 'GET', null, userB.token);
        console.log(`Initial balances -> A: ${balA.balance}, B: ${balB.balance}`);

        console.log("Sending 1000 from A to B...");
        const send1 = await request('/transactions/send', 'POST', {
            recipient: 'userb@test.com',
            amount: 1000,
            category: 'Transfer'
        }, userA.token);
        console.log("Response:", send1);

        const newBalA = await request(`/account/${userA.user._id}/balance`, 'GET', null, userA.token);
        const newBalB = await request(`/account/${userB.user._id}/balance`, 'GET', null, userB.token);
        console.log(`After send1 -> A: ${newBalA.balance}, B: ${newBalB.balance}`);

        console.log("Sending 500 from B to A...");
        const send2 = await request('/transactions/send', 'POST', {
            recipient: 'usera@test.com',
            amount: 500,
            category: 'Transfer'
        }, userB.token);
        console.log("Response:", send2);

        const finalBalA = await request(`/account/${userA.user._id}/balance`, 'GET', null, userA.token);
        const finalBalB = await request(`/account/${userB.user._id}/balance`, 'GET', null, userB.token);
        console.log(`Final balances -> A: ${finalBalA.balance}, B: ${finalBalB.balance}`);

        // Fetch notifications
        console.log("Fetching notifications...");
        const notifsA = await request(`/notifications/${userA.user._id}`, 'GET', null, userA.token);
        const notifsB = await request(`/notifications/${userB.user._id}`, 'GET', null, userB.token);
        
        console.log("User A latest notification:", notifsA[0]?.message);
        console.log("User B latest notification:", notifsB[0]?.message);

    } catch (error) {
        console.error("Error:", error.message || error);
    }
}

runTest();
