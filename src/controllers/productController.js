// controllers/productController.js
const productService = require('../services/productService');

exports.getProductsBySeller = async (req, res) => {
    try {
        const products = await productService.getProductsBySeller();
        res.json(products);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

exports.updateProductPrice = async (req, res) => {
    try {
        const { id, price } = req.body;
        await productService.updateProductPrice(id, price);
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
