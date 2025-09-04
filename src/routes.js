const path = require('path');

module.exports = (app) => {

    // Register app version route
    app.version(path.resolve(__dirname, '..', 'package.json'), '/version');

    require('./controllers/QueueController').register(app);        
}