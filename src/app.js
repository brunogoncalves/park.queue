const app = require('sae-framework');
const path = require('path');
const Worker = require('./worker');
const config = require('../package.json');

// Carregar envs
require('dotenv').config();

// Preparar Worker do Queue
const worker = new Worker(path.resolve(process.cwd(), 'queues'), {
    error_queue: 'salvar_erros'
});

// Registrar filas
require('../queues')(worker);

// Registrar no app o worker
app.$worker = worker;

// Registrar controle de auth
require('./controllers/auth')(app);

// Registrar função para iniciar os servers
app.run = function() {
    console.log(config.name.toUpperCase(), '-', config.version);
    app.$worker.run();
    app.listen(8090);
}

module.exports = app;