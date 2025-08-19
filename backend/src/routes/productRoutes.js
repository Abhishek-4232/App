const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { sendStockAlert } = require('../services/emailService');

// @route   GET /api/products
// @desc    Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   POST /api/products
// @desc    Create a product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const savedProduct = await product.save();

        // Check initial stock level
        const minimumStockLevel = product.minimumStockLevel || 10;
        if (product.quantity <= minimumStockLevel) {
            await sendStockAlert({
                name: product.name,
                quantity: product.quantity,
                minimumStockLevel,
                sku: product.sku || 'N/A',
            });
        }

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if stock level is being updated
        if (req.body.quantity !== undefined) {
            const newQuantity = req.body.quantity;
            const minimumStockLevel = product.minimumStockLevel || 10; // Default minimum stock level

            // Send alert if stock is below minimum or out of stock
            if (newQuantity <= minimumStockLevel) {
                await sendStockAlert({
                    name: product.name,
                    quantity: newQuantity,
                    minimumStockLevel,
                    sku: product.sku || 'N/A',
                });
            }
        }
        
        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   GET /api/products/low-stock
// @desc    Get all low stock products
router.get('/low-stock', async (req, res) => {
    try {
        const products = await Product.find({
            isLowStock: true
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
