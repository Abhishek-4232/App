const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Create a new order
router.post('/', async (req, res) => {
    try {
        const { products, createdBy } = req.body;
        
        // Validate stock availability
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}`
                });
            }
        }

        // Create order
        const totalItems = products.reduce((sum, item) => sum + item.quantity, 0);
        const order = new Order({
            products,
            totalItems,
            createdBy
        });

        // Update product quantities
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/orders
// @desc    Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('products.product');
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/orders/staff/:staffId
// @desc    Get orders by staff member
router.get('/staff/:staffId', async (req, res) => {
    try {
        const orders = await Order.find({ createdBy: req.params.staffId })
            .populate('products.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
