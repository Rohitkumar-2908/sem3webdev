
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => console.log('MongoDB connection error:', error));

// Validate Product ID Middleware
function validateProductId(req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    next();
}

// 1. Create Product
app.post('/api/products', async (req, res, next) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        next(error);
    }
});

// 2. Get All Products with Filtering, Sorting and Pagination
app.get('/api/products', async (req, res, next) => {
    try {
        const { category, sortBy, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (category) filter.category = category;

        const sort = {};
        if (sortBy === 'price') sort.price = 1;
        else if (sortBy === 'quantity') sort.quantity = 1;

        const currentPage = Math.max(1, parseInt(page) || 1);
        const itemsPerPage = Math.min(100, Math.max(1, parseInt(limit) || 10));

        const products = await Product.find(filter)
            .sort(sort)
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.status(200).json({
            total: await Product.countDocuments(filter),
            page: currentPage,
            limit: itemsPerPage,
            products
        });
    } catch (error) {
        next(error);
    }
});

// 3. Low-Stock Report
app.get('/api/products/low-stock', async (req, res, next) => {
    try {
        const products = await Product.find({
            $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
        });

        res.status(200).json({
            count: products.length,
            lowStockProducts: products
        });
    } catch (error) {
        next(error);
    }
});

// 4. Category-Wise Inventory Summary
app.get('/api/products/summary/categories', async (req, res, next) => {
    try {
        const summary = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalProducts: { $sum: 1 },
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: {
                        $sum: { $multiply: ['$price', '$quantity'] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: '$_id',
                    totalProducts: 1,
                    totalQuantity: 1,
                    totalValue: 1
                }
            }
        ]);

        res.status(200).json(summary);
    } catch (error) {
        next(error);
    }
});

// 5. Update Product Details
app.put('/api/products/:id', validateProductId, async (req, res, next) => {
    try {
        const allowedFields = [
            'name', 'category', 'price', 'quantity', 'lowStockThreshold'
        ];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        next(error);
    }
});

// 6. Safely Adjust Stock (Restock or Sale)
app.patch('/api/products/:id/stock', validateProductId, async (req, res, next) => {
    try {
        const { action, amount } = req.body;

        if (!['increment', 'decrement'].includes(action)) {
            return res.status(400).json({
                error: 'Action must be increment or decrement'
            });
        }

        if (!Number.isInteger(amount) || amount <= 0) {
            return res.status(400).json({
                error: 'Amount must be a positive whole number'
            });
        }

        const filter = { _id: req.params.id };

        if (action === 'decrement') {
            filter.quantity = { $gte: amount };
        }

        const product = await Product.findOneAndUpdate(
            filter,
            { $inc: { quantity: action === 'increment' ? amount : -amount } },
            { new: true, runValidators: true }
        );

        if (!product) {
            const exists = await Product.exists({ _id: req.params.id });

            if (!exists) {
                return res.status(404).json({ error: 'Product not found' });
            }

            return res.status(400).json({
                error: 'Insufficient stock for this adjustment'
            });
        }

        res.status(200).json({
            message: 'Stock adjusted successfully',
            product
        });
    } catch (error) {
        next(error);
    }
});

// 7. Get Single Product by ID
app.get('/api/products/:id', validateProductId, async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
});

// 8. Delete Product
app.delete('/api/products/:id', validateProductId, async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            message: 'Product deleted successfully',
            product
        });
    } catch (error) {
        next(error);
    }
});

// Centralized Error Handling Middleware
app.use((error, req, res, next) => {
    console.error(error.message);

    if (error.name === 'ValidationError' ||
        error.name === 'CastError' ||
        error.code === 11000) {
        return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});