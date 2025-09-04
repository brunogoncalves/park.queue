const app = require('./src/app');

// Executar o boot da aplicação
app.boot();

// Register routes
require('./src/routes')(app);

app.run();