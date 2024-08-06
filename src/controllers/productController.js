// controllers/productController.js
const productService = require('../services/productService');

exports.getProductsBySeller = async (req, res) => {
    const sellerId = req.userId; // Accede al ID del usuario directamente
    const sellerProducts = await getProductsBySeller(sellerId);
    res.json(sellerProducts);
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
