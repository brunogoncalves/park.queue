const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const Job = require('./job');
const Queue = require('./queue');
const uuid = require('uuid')
const EventEmitter = require('events');

class Worker
{
    constructor (queueDir, defaults = {}) {
        this.queueDir      = queueDir;
        this.queueDirIn    = path.join(queueDir, 'in');
        this.queueDirProc  = path.join(queueDir, 'proc');
        this.queueDirError = path.join(queueDir, 'error');

        this.defaults = Object.assign({}, {
            queue_error                 : null,
            error_tentativas_qtd        : 1,
            error_tentativas_intervalot : 30 * 1000, // 30s
        }, defaults);

        this.events = new EventEmitter();
    }

    /**
     * Executar serviço de filas.
     */
    async run()
    {
        console.log('Netforce Queue');
        console.log('Queues: ', this.queueDir);
        console.log('-----------------------------------');

        // Carregar arquivos no tanque        
        var olds_arquivos = this.getOldFilesInputs();

        // Ativar monitoramente        
        const watcher = fs.watch(this.queueDirIn, { persistent: true }, async (eventType, filename) => {
            if (!filename) {
                return;
            }

            if ((eventType == 'rename') || (eventType == 'change')) {
                await utils.sleep(100);

                var filePath = path.join(this.queueDirIn, filename);
                var extFile = path.extname(filePath).toLowerCase();

                // Se arquivo não tiver mais, ignorar
                if (!fs.existsSync(filePath)) {
                    return;
                }

                // Se não for o arquivo de entrada (.json)
                if (extFile != '.json') {
                    return;
                }

                // Processar o arquivo
                await this.processarArquivo(filePath, filename);
            }
        });
        
        watcher.on('error', (err) => {
            console.error('[ERRO] Watcher:', err.message);
        });

        // Agendar encerramento
        const shutdown = () => {
            watcher.close();
            console.log('\nQueue Worker - Encerrado.');
            process.exit(0);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Enviar arquivos OLDS
        this.updateFilesOlds(olds_arquivos)
    }

    /**
     * Processar arquivo.
     * @param {string} arquivo 
     */
    async processarArquivo(arquivo, filename) {
        var arquivoProc = path.join(this.queueDirProc, uuid.v4() + '.json');

        // Renomear arquivo
        fs.renameSync(arquivo, arquivoProc);
        console.log(Job.prefixLog('EXEC', '', filename));

        try {
            // Carregar arquivo
            var json = JSON.parse( fs.readFileSync(arquivoProc, { encoding: 'ascii'}) );

            // Validar arquivo
            this.validarArquivo(json);

            // Criar job e executar
            var job = new Job(this, json, json.queue, json.body, json.metadata, filename);
            job.proc();

        } catch (err) {
            console.log(' -X ', filename, ' erro interno: ', err);
        } finally {
            if (fs.existsSync(arquivoProc)) {
                fs.unlinkSync(arquivoProc);
            }
        }
    }

    validarArquivo(json) {
        if (typeof json.type != 'string') {
            throw 'arquivo invalido (type)';
        }
        
        if (json.type != 'queue.job') {
            throw 'arquivo invalido (type)';
        }

        if (typeof json.queue != 'string') {
            throw 'arquivo invalido (queue)';
        }

        if (typeof json.body != 'object') {
            throw 'arquivo invalido (body)';
        }

        return true;
    }

    queue(queueName, callback, opts = {}) {

        opts = Object.assign({}, this.defaults, opts);

        var queue = new Queue(queueName, callback, opts);
        this.events.on(queue.name, (job) => {
            queue.run(job);
        });
    }

    input(queueName, data, delay = 0, metadata = {}) {
        var json = {
            id    : uuid.v4(),
            type  : 'queue.job',
            queue : queueName,
            body  : data,
            metadata
        }

        var text = JSON.stringify(json);
        var arquivo = path.join(this.queueDirIn, json.id + '.json');

        // Aguardar o delay e postar o arquivo na fila
        setTimeout(() => {
            fs.writeFileSync(arquivo, text, { encoding: 'ascii'});
        }, delay);        

        return json;
    }

    getOldFilesInputs() {
        // Carregar arquivos do diretorio in
        var arquivos = fs.readdirSync(this.queueDirIn);

        // Filtrar os arquivos json
        return arquivos.filter(file => path.extname(file).toLowerCase() === ".json");
    }

    updateFilesOlds(arquivos) {
        const agora = new Date();
        for (var i = 0; i < arquivos.length; i++) {
            fs.utimesSync(path.join(this.queueDirIn, arquivos[i]), agora, agora);
        }        
    }
}

module.exports = Worker;