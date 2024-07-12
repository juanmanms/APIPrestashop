const sellerservice = require('../services/sellersService');

exports.getSellers = async (req, res) => {
    try {
        const sellers = await sellerservice.getSellers();
        res.json(sellers);
    } catch (error) {
        res.status(500).send('Server error');
    }
};
