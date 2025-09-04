const app = require('sae-framework');

class QueueController
{
    /**
     * Enviar data para a fila.
     */
    static async send(req, res) {
        try {
            req.validate({
                queue : {  obrigatorio: true },
                body : {  obrigatorio: true }
            })

            // Calcular o menor delay
            var delay = req.json('delay', 0);
            delay = (delay < 1000) ? 1000 : delay;

            // Enviar mensagem para a fila
            var jobJSON = app.$worker.input(req.json('queue'), req.json('body', {}), delay);

            return res.json({ "status": true, job: jobJSON });
        } catch (err) {
            res.json({
                error: {
                    message: err
                }
            });
        }
    }
    /**
     * Register routes of controller.
     */
    static register(app) {
        app.post('/send', this.send, [ 'auth' ]);
    }
}QueueController

module.exports = QueueController;