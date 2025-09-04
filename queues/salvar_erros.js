const fs = require('fs');
const path = require('path');

module.exports = (job) => {
    var arquivo = path.join(job.worker.queueDirError, job.metadata.queueOriginal + '_' + job.filename);
    fs.writeFileSync(arquivo, JSON.stringify(job.toJSON(), null, 4), { encoding: 'ascii' });
}