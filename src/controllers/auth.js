const auth = require('sae-framework/src/auth');
const arr = require('rhinojs/support/arr');
const path = require('path');
const fs = require('fs');

// Carregar tokens
var arquivoTokens = path.join(process.cwd(), 'tokens.json');
const tokens = fs.existsSync(arquivoTokens) ? JSON.parse(fs.readFileSync(arquivoTokens, { encoding: "utf8" })) : {};

module.exports = (app) => {
    // Atribuir o APP no auth
    auth.setApp(app);

     // Função para carregar usuario pleo token do contexto.
    auth.setCallGetToken(async (token) => {

        // Procurar usuario pelo token
        return arr.get(tokens, token);

    });

    return auth;
};