const express = require('express')
const router = express.Router()

const {
    getClients,
    getAddresses,
    createCustomerAndAddress,
    updateCustomerAndAddress
} = require('../services/clientsService');


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

    // console.log(`address1: ${data.address1}`);
    // console.log(`alias: ${data.alias}`);
    // console.log(`city: ${data.city}`);
    // console.log(`email: ${data.email}`);
    // console.log(`firstname: ${data.firstname}`);
    // console.log(`gender: ${data.gender}`);
    // console.log(`id_country: ${data.id_country}`);
    // console.log(`id_state: ${data.id_state}`);
    // console.log(`lastname: ${data.lastname}`);
    // console.log(`newsletter: ${data.newsletter}`);
    // console.log(`optin: ${data.optin}`);
    // console.log(`passwd: ${data.passwd}`);
    // console.log(`phone: ${data.phone}`);
    // console.log(`phone_mobile: ${data.phone_mobile}`);
    // console.log(`postcode: ${data.postcode}`);

    createCustomerAndAddress(data)


    // createCustomerAndAddress(customerData)
    //     .then(customerId => {
    //         console.log('Customer and address created with customer ID:', customerId);
    //     })
    //     .catch(error => {
    //         console.error('Error creating customer and address:', error);
    //     });
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


module.exports = router;

