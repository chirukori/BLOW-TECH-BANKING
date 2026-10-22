const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification'); // NEW

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

// Auth Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });
    
    const token = authHeader.replace('Bearer ', '');
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log('Successfully connected to MongoDB'))
.catch(async (err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Falling back to local in-memory MongoDB...');
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('Successfully connected to local in-memory MongoDB');
    } catch (fallbackErr) {
        console.error('Failed to start in-memory MongoDB fallback:', fallbackErr);
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log(`[POST /api/auth/register] Received request`);
        const { fullName, email, password } = req.body;
        console.log(`[POST /api/auth/register] Body:`, { fullName, email });
        
        if (!fullName || !email || !password) {
            console.log(`[POST /api/auth/register] Missing fields`);
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log(`[POST /api/auth/register] Email already exists: ${email}`);
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = new User({ fullName, email, password, balance: 5000.0, savingsGoal: 5000.0, savingsAmount: 0.0 });
        await newUser.save();
        console.log(`[POST /api/auth/register] User saved successfully`);
        
        // Welcome notification
        await new Notification({ userId: newUser._id, title: 'Welcome!', message: 'Welcome to Blowtech Banking!' }).save();

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });
        const userObj = newUser.toObject();
        delete userObj.password;

        console.log(`[POST /api/auth/register] Sending 201 response`);
        res.status(201).json({ message: 'User created successfully', user: userObj, token });
    } catch (err) {
        console.error(`[POST /api/auth/register] Error:`, err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        const userObj = user.toObject();
        delete userObj.password;

        res.json({ message: 'Login successful', user: userObj, token });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- ACCOUNT ROUTES ---
app.post('/api/account/add-money', verifyToken, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid data' });
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        user.balance += amount;
        await user.save();
        
        const transaction = new Transaction({
            userId: user._id,
            merchant: 'Deposit',
            category: 'Income',
            amount: amount,
            icon: 'add-circle'
        });
        await transaction.save();
        
        res.json({ message: 'Money added successfully', balance: user.balance });
    } catch (err) {
        res.status(500).json({ error: 'Server error adding money' });
    }
});
app.get('/api/account/:userId/balance', verifyToken, async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ balance: user.balance, savingsGoal: user.savingsGoal, savingsAmount: user.savingsAmount });
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching balance' });
    }
});

app.get('/api/account/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

app.put('/api/account/profile', verifyToken, async (req, res) => {
    try {
        const { fullName, email } = req.body;
        if (!fullName || !email) return res.status(400).json({ error: 'Name and email are required' });
        
        const existingEmail = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existingEmail) return res.status(400).json({ error: 'Email already in use' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.fullName = fullName;
        user.email = email;
        await user.save();

        res.json({ message: 'Profile updated successfully', user: { fullName: user.fullName, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

app.put('/api/account/password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords are required' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error updating password' });
    }
});

// --- NOTIFICATION ROUTES (NEW) ---
app.get('/api/notifications/:userId', verifyToken, async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});

app.put('/api/notifications/:userId/read', verifyToken, async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        await Notification.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Server error marking notifications as read' });
    }
});

// --- TRANSACTION ROUTES ---
app.get('/api/transactions/:userId', verifyToken, async (req, res) => {
    try {
        if (req.params.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        const transactions = await Transaction.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Server error fetching transactions' });
    }
});

app.post('/api/transactions/send', verifyToken, async (req, res) => {
    console.log('[SERVER] Send transaction request received');
    
    // Add timeout to prevent hanging requests entirely
    req.setTimeout(10000);
    res.setTimeout(10000);

    const session = await mongoose.startSession();
    try {
        const { recipient, amount, note, category } = req.body; 
        const userId = req.user.id;
        
        console.log(`[SERVER] Authenticated user: ${userId}`);
        console.log(`[SERVER] Recipient email: ${recipient}`);

        const numAmount = Number(amount);
        if (!amount || numAmount <= 0) {
            session.endSession();
            return res.status(400).json({ error: 'Amount must be greater than zero' });
        }
        if (!recipient) {
            session.endSession();
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        const sender = await User.findById(userId);
        if (!sender) {
            session.endSession();
            return res.status(404).json({ error: 'Sender not found' });
        }
        
        console.log('[SERVER] Checking balance');
        if (sender.balance < numAmount) {
            session.endSession();
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        console.log('[SERVER] Finding recipient');
        const receiver = await User.findOne({ email: recipient });
        if (!receiver) {
            session.endSession();
            return res.status(404).json({ error: 'Recipient not found' });
        }
        console.log('[SERVER] Recipient found');

        if (sender.email === recipient) {
            session.endSession();
            return res.status(400).json({ error: 'You cannot send money to yourself' });
        }

        console.log('[SERVER] Starting database transaction');
        session.startTransaction();

        console.log('[SERVER] Updating sender');
        sender.balance -= numAmount;
        await sender.save({ session });

        console.log('[SERVER] Updating receiver');
        receiver.balance += numAmount;
        await receiver.save({ session });

        console.log('[SERVER] Creating transactions');
        const transferId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const senderTx = new Transaction({
            userId: sender._id, 
            merchant: receiver.fullName, 
            category: category || 'Transfer', 
            amount: -numAmount, 
            icon: 'send',
            type: 'sent',
            transferId: transferId
        });
        const receiverTx = new Transaction({
            userId: receiver._id, 
            merchant: sender.fullName, 
            category: 'Transfer', 
            amount: numAmount, 
            icon: 'arrow-down',
            type: 'received',
            transferId: transferId
        });
        await senderTx.save({ session });
        await receiverTx.save({ session });

        console.log('[SERVER] Creating notifications');
        const senderNotif = new Notification({
            userId: sender._id,
            title: 'Money Sent',
            message: `You sent ${formatCurrency(numAmount)} to ${receiver.fullName}.`
        });
        await senderNotif.save({ session });

        const receiverNotif = new Notification({
            userId: receiver._id,
            title: 'Payment Received',
            message: `You received ${formatCurrency(numAmount)} from ${sender.fullName}.`
        });
        await receiverNotif.save({ session });

        console.log('[SERVER] Committing transaction');
        await session.commitTransaction();
        session.endSession();

        console.log('[SERVER] Transfer successful');
        return res.status(200).json({ 
            success: true,
            message: 'Payment sent successfully', 
            transferId: transferId,
            sender: {
                id: sender._id,
                balance: sender.balance
            },
            receiver: {
                id: receiver._id,
                balance: receiver.balance
            }
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('[POST /api/transactions/send] Transaction error:', err);
        return res.status(500).json({ error: 'Server error during transaction' });
    }
});

app.post('/api/transactions/request', verifyToken, async (req, res) => {
    try {
        const { recipient, amount, note, category } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0 || !recipient) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const requester = await User.findById(userId);
        if (!requester) return res.status(404).json({ error: 'Requester not found' });

        const targetUser = await User.findOne({ email: recipient });
        if (!targetUser) return res.status(404).json({ error: 'Recipient email not found in system' });
        if (requester.email === recipient) return res.status(400).json({ error: 'Cannot request money from yourself' });

        // Create a notification for the recipient
        const notif = new Notification({
            userId: targetUser._id,
            title: 'Payment Request',
            message: `${requester.fullName} has requested ${formatCurrency(amount)} from you. Note: ${note || 'None'}`
        });
        await notif.save();

        res.status(201).json({ message: 'Request sent successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during money request' });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working correctly!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
