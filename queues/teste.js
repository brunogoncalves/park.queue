module.exports = (job) => {
    job.log('Teste de JOB');    

    //job.sendJob('teste', job.data, 3000);

    throw 'deu erro';
}