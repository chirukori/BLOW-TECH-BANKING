const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    merchant: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: 'General',
    },
    amount: {
        type: Number,
        required: true,
    },
    icon: {
        type: String,
        default: 'credit-card',
    },
    type: {
        type: String,
        enum: ['sent', 'received', 'deposit', 'withdrawal', 'general'],
        default: 'general',
    },
    transferId: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);
