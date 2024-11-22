const express = require('express')
const router = express.Router()

const { getClients, getAddresses, createCustomerAndAddress } = require('../services/clientsService');


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
    const customerData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country
    };

    createCustomerAndAddress(customerData)
        .then(customerId => {
            console.log('Customer and address created with customer ID:', customerId);
        })
        .catch(error => {
            console.error('Error creating customer and address:', error);
        });
})


module.exports = router;

