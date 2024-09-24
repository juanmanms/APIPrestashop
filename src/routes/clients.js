const express = require('express')
const router = express.Router()

const { getClients, getAddresses } = require('../services/clientsService');


router.get('/', async (req, res) => {

    const clients = await getClients();
    res.json(clients);
});

router.get('/adresses/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const adresses = await getAddresses(id);
    res.json(adresses);
}
);


module.exports = router;

