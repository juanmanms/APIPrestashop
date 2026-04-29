const express = require('express')
const router = express.Router()

const {
    getClients,
    getAddresses,
    createCustomerAndAddress,
    updateCustomerAndAddress,
    consultClients,
    updateCustomerActiveStatus
} = require('../services/clientsService');
const { serializeBigInt } = require('../utils');


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

router.post('/add', async (req, res) => {
    console.log('add');
    const data = req.body; // Acceder directamente a req.body
    if (!data) {
        return res.status(400).json({ error: 'No data provided' });
    }

    createCustomerAndAddress(data)
        .then(() => {
            res.status(201).json({ message: 'Client created successfully' });
        }
        )
        .catch((error) => {
            console.error('Error creating client:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
        
})

router.put('/update/:id', async (req, res) => {
    const data = req.body;
    const { id } = req.params;
    if (!data) {
        return res.status(400).json({ error: 'No data provided' });
    }
    try {
        updateCustomerAndAddress(data, id);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/consultaClients', async (req, res) => {
    try {
        const clients = await consultClients();
        res.json(serializeBigInt(clients));
    } catch (error) {
        console.error('Error consulting clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/updateActive/:id', async (req, res) => {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Invalid active status' });
    }
    try {        await updateCustomerActiveStatus(id, active);
        res.json({ message: 'Client active status updated successfully' });
    } catch (error) {
        console.error('Error updating client active status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

