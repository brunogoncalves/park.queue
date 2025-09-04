const envs = require('../src/envs');

/**
 * Job SafraPay - Split da Gregpay
 * @param {*} job 
 */
module.exports = async (job) => {
    job.log('safar teste');    

    //job.sendJob('teste', job.data, 3000);

    //throw 'deu erro';
}

const greg_request = async () =>{
    var hdrs = {
        'Accept'        : 'application/json',
        'Cache-Control' : 'no-cache'
    };
    //Object.assign(hdrs, this.headersDefault, headers);

    var req = {
        method  : 'POST',
        url     : 'https://xxxxx',
        headers : hdrs
    };

    // Tratar accesstoken
    req.headers['Authorization'] = envs('SAFRAPAY_GERPAY_ACCESS_TOKEN', '');

    //if ((method == 'post') || (method == 'put')) {
    //    req.data = params;
    //    req.params = queryInPost;
    //} else {
    //    req.params = params;
    //}

    try {
        // Executar requisicao
        var res = await axios(req);

        //return res.data;
    } catch (err) {
        throw err;
    }        
}