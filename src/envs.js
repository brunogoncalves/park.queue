/**
 * Carregar um env key tratando o sufixo _ENV.
 * 
 * @param {string} key 
 * @param {any} adef 
 * @param {object} opts 
 * @returns {any}
 */
module.exports = (key, adef = null, opts = {}) => {
    // Tratar options padrao
    opts = Object.assign({}, {
        tentarSemSufixo: true
    }, opts);

    // Verificar se sufixo foi informado
    var sufix = process.env.ENV ? '_' + process.env.ENV : '';

    // Carregar primeiro teste
    var ret = process.env[key + sufix];

    // Verificar se deve testar sem sufixo
    if ((!ret) && (sufix != '') && (opts.tentarSemSufixo)) {
        ret = process.env[key];
    }

    return ret ? ret : adef;
};