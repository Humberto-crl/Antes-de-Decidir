const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors()); //Esto permitira las peticiones desde Angular
app.use(express.json()); //Permitira leer los datos JSON cuando lleguen

//Esta ruta nos dara a saber si el sevidor funciona
app.get('api/health', (req, res) => {
    res.json({ok: true, mensaje: 'API Funcionando correctamente'});
});

module.exports = app;