const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function testRegistration() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blowtech-banking');
        
        // Remove them if they already exist
        await User.deleteMany({ email: { $in: ['testA@example.com', 'testB@example.com'] } });

        // Now register via API simulation (or just create here directly, but the requirement was "In the registration endpoint, explicitly create...").
        // Since we want to test the endpoint, let's use fetch against localhost:5000.
        
        console.log("Registering testA@example.com...");
        const resA = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: 'Test A', email: 'testA@example.com', password: 'Test@123' })
        });
        const dataA = await resA.json();
        
        console.log("Registering testB@example.com...");
        const resB = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName: 'Test B', email: 'testB@example.com', password: 'Test@123' })
        });
        const dataB = await resB.json();

        // Verify from DB directly
        const dbUserA = await User.findOne({ email: 'testA@example.com' });
        const dbUserB = await User.findOne({ email: 'testB@example.com' });

        console.log("Expected: User A balance = 5000, got: ", dbUserA?.balance);
        console.log("Expected: User B balance = 5000, got: ", dbUserB?.balance);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

testRegistration();
