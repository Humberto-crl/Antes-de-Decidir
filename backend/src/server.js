require('dotenv').config(); //Esto cargara los archivos que estan en el .env
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Servidor corrriendo en http://localhost:${PORT}');
})

