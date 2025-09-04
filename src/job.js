const uuid = require('uuid');
const arr = require('rhinojs/support/arr');
const carbon = require('rhinojs/support/carbon');
const JobMetadata = require('./job_meta');

class Job
{
    constructor(worker, json, queue, data, metadata, filename) {
        this.id       = uuid.v4();
        this.worker   = worker;
        this.original = json;
        this.queue    = queue;
        this.data     = data;
        this.metadata = new JobMetadata(metadata);
        this.filename = filename;
    }

    async proc() {
        var event = 'event.queue.' + this.queue;
        this.worker.events.emit(event, this);
    }

    json(key, def = null) {
        return arr.get(this.data, key, def);
    }

    log(...args) {
        console.log(Job.prefixLog('LOG', this.queue, this.filename), ...args);
    }

    error(...args) {
        console.log(Job.prefixLog('ERRO', this.queue, this.filename), ...args);
    }

    static prefixLog(tipo, queue = '', filename = '') {
        var txt = ' - ' + tipo.trim().padEnd(5).toUpperCase() + '| ' + carbon.format(carbon.now(), 'YY-MM-DD HH:mm:ss') + ' | ';
        txt += filename ? filename.padEnd(30) + ' | ' : '';
        txt += queue ?  queue.padEnd(30) + ' | ' : '';

        return txt;
    }

    rejob(delay = 0) {
        this.metadata.tentativa += 1;
        this.sendJob(this.queue, this.data, delay, this.metadata.toJSON());
    }

    sendJob(queueName, data, delay = 0, metadata = {}) {
        delay = (delay < 100) ? 100 : delay;

        this.worker.input(queueName, data, delay, metadata);
    }

    toJSON() {
        return {
            id        : this.id,
            //original  : this.original,
            queue     : this.queue,
            data      : this.data,
            metadata  : this.metadata.toJSON(),
            filename  : this.filename,
        };
    }
}

module.exports = Job;