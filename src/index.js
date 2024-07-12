const express = require('express');
const { asyncFunction } = require('./controllers/prestashopConector');
const app = express();
app.use(express.json());

//abrir cors para que se pueda acceder desde cualquier lugar
const cors = require('cors');
app.use(cors());



//const subscribersRouter = require('./routes/subscribers');

//app.use('/subscribers', subscribersRouter);
app.get('/', (req, res) => {
    res.send(process.env.UsuarioDB);
}
);

app.get('/api', (req, res) => {
    const url = 'https://botiga.mercattorreblanca.cat/api/customers/2?output_format=JSON';
    const auth = {
        username: 'BCTIHYJU9M18KP48WS7FWAFJ4RYRAAE2',
        password: ''
    };
    //llamar a webservice de prestashop añadiendo la api key WebServiceKey en la cabecera
    const axios = require('axios');
    axios.get(url, {
        auth
    })
        .then(response => {
            res.json(response.data);
        })
        .catch(error => {
            console.log(error);
        });

}
);



async function main() {
    try {
        const result = await asyncFunction();
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();



app.listen(3000, () => {
    console.log('Server is running in localhost:' + 3000);

});