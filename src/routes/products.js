// routes/products.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
    updateProductPrice,
    getProductsBySeller,
    updateProductIVA,
    getCombinations,
    activeProduct,
    updateProductName,
    getProductsNoCombinations,
    createCombination,
    updateCombinationPrice,
    deleteCombination,
    getImagenes,
    deleteImage,
    getCategories,
    addCategoryToProduct,
    deleteCategoryFromProduct,
    getCategoryBySeller,
    createProductBySellet,
    descatalogProduct,
    changeAttributeCombination
} = require('../services/productService');

const verifyToken = require('../middleware/middleware');

router.use(verifyToken);
const getIdFromToken = (req) => {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.cookie_key);
    return decoded.id;
};




router.use((req, res, next) => {
    //req.userId = getIdFromToken(req);
    const token = req.headers['authorization'];
    if (token.startsWith('eyJ')) {
        const decoded = jwt.verify(token, process.env.cookie_key);
        req.userId = decoded.id;
    } else {
        req.userId = null;
    }
    next();
});


router.get('/', async (req, res) => {
    const id = getIdFromToken(req);
    console.log("vendedor", id);
    const sellerProducts = await getProductsNoCombinations(id);
    res.json(sellerProducts);
});

router.put('/', async (req, res) => {
    const { id, price } = req.body;
    console.log("Producto ", id, "precio ", price);
    await updateProductPrice(id, price);
    res.json({ message: 'Product price updated' });
});

router.put('/iva', async (req, res) => {
    const { id, iva } = req.body;
    console.log("Producto ", id, "IVA ", iva);
    await updateProductIVA(id, iva);
    res.json({ message: 'IVA updated' });
});

router.get('/combinations', async (req, res) => {
    const id = getIdFromToken(req);
    console.log("combinaciones", id);
    const sellerProducts = await getCombinations(id);
    res.json(sellerProducts);
});

router.put('/active', async (req, res) => {
    const { id, active } = req.body;
    console.log("Producto ", id, "activo ", active);
    await activeProduct(id, active);
    res.json({ message: 'Product active updated' });
});

router.put('/name', async (req, res) => {
    const { id, name } = req.body;
    console.log("Producto ", id, "nombre ", name);
    await updateProductName(id, name);
    res.json({ message: 'Product name updated' });
});

router.post('/combinations/create', async (req, res) => {
    const { id, atributo } = req.body;
    try {
        const combination = await createCombination(id, atributo);
        console.log("combinacion", combination);
        res.json({ message: 'Combination created', combination });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'Duplicate entry for key product_default' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

router.put('/combinations/price', async (req, res) => {
    const { id, price } = req.body;
    console.log("Combinacion ", id, "precio ", price);
    try {
        await updateCombinationPrice(id, price);
        res.json({ message: 'Combination price updated' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/combinations/active', async (req, res) => {
    const { id, active } = req.body;
    console.log("Combinacion ", id, "activo ", active);
});

router.delete('/combinations', async (req, res) => {
    const { id } = req.body;
    try {
        await deleteCombination(id);
        res.json({ message: 'Combination deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});

router.get('/imagenes', async (req, res) => {
    const id = getIdFromToken(req);
    console.log("imagenes", id);
    const sellerProducts = await getImagenes(id);
    res.json(sellerProducts);
});

router.delete('/imagenes', async (req, res) => {
    const { id_product, id_image } = req.body;
    console.log("Producto eliminado", id_product, "imagen ", id_image);
    try {
        await deleteImage(id_product, id_image);
        res.json({ message: 'Imagen deleted' });
    } catch (error) {
        res.status(500).json({ message: 'No se pudo eliminar imagen' });
    }
});

router.post('/productos', async (req, res) => {
    const { id } = req.body
    console.log("vendedor", id);
    const sellerProducts = await getProductsBySeller(id);
    res.json(sellerProducts);
});

router.get('/categorias', async (req, res) => {
    const id = getIdFromToken(req);
    const categories = await getCategories(id);
    res.json(categories);
});
router.post('/categorias-add-product', async (req, res) => {
    const { id_product, id_category } = req.body
    console.log("Producto: ", id_product, "Categoria: ", id_category, "add");
    try {
        await addCategoryToProduct(id_product, id_category);
        res.json({ message: 'Category added' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});
router.delete('/categorias-delete-product', async (req, res) => {
    const { id_product, id_category } = req.body
    console.log("Producto: ", id_product, "Categoria: ", id_category, "delete");
    try {
        await deleteCategoryFromProduct(id_product, id_category);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/add-product', async (req, res) => {
    const id = getIdFromToken(req);
    const { name, price, taxRate, netPrice } = req.body
    const category = await getCategoryBySeller(id);
    console.log("vendedor", id);
    try {
        //console.log("Producto: ", id, name, price, taxRate, category[0].id_category);
        await createProductBySellet(category[0].categoria, netPrice, taxRate, name, name, category[0].vendedor, category[0].proveedor);
        res.json({ message: 'Product created' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/descatalogar', async (req, res) => {
    const { id } = req.body;
    console.log("Producto ", id);
    await descatalogProduct(id);
    res.json({ message: 'Product descatalogado' });
});

router.put('/change-attribute', async (req, res) => {
    const { id_product, id_attribute } = req.body;
    console.log("Producto ", id_product, "Atributo ", id_attribute);
    await changeAttributeCombination(id_product, id_attribute);
    res.json({ message: 'Product attribute changed' });
});

module.exports = router;