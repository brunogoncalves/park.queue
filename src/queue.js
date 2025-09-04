const arr = require('rhinojs/support/arr');

class Queue
{
    constructor(name, callback, opts = {}) {
        this.name     = 'event.queue.' + name;
        this.callback = callback;
        this.opts     = opts;
    }

    run(job) {
        if (typeof this.callback != 'function') {
            return;
        }

        try {
            this.callback.call(null, job);
        } catch (err) {            
            job.error(err);

            // Verificar se deve executar uma nova tentativa
            if ((this.tentativaQtd > 0) && (job.metadata.tentativa < this.tentativaQtd)) {
                return job.rejob(this.tentativaIntervalo);
            }

            // Verificar de deve encaminhar o job para uma fila de erro 3s depois
            if (this.queueError != '') {
                return job.sendJob(this.queueError, job.data, 3000, {
                    _original_queue : job.queue,
                    _error_message  : err
                });
            }
        }

    }

    option(key, def = null) {
        return arr.get(this.opts, key, def);
    }

    get tentativaQtd() {
        return this.option('error_tentativas_qtd', 0);
    }

    get tentativaIntervalo() {
        return this.option('error_tentativas_intervalo', 30000);
    }

    get queueError() {
        return this.option('error_queue', '');
    }
}

module.exports = Queue;