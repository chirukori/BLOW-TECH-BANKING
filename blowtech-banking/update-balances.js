const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blowtech-banking');
        const res = await User.updateMany({ $or: [{ balance: 0 }, { balance: null }] }, { $set: { balance: 5000.0 } });
        console.log('Updated users:', res.modifiedCount);
    } catch(err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}
run();
