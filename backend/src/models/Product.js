const mongoose = require('mongoose');
const { sendStockAlert } = require('../services/emailService');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    minimumStockLevel: {
        type: Number,
        required: true,
        min: 0
    },
    isLowStock: {
        type: Boolean,
        default: false
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to check if stock is low and send email notification
productSchema.pre('save', async function(next) {
    const previousIsLowStock = this.isLowStock;
    this.isLowStock = this.quantity <= this.minimumStockLevel;
    
    // Send email notification only when stock becomes low
    if (this.isLowStock && !previousIsLowStock) {
        await sendStockAlert(this);
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
