///
/// Registrar filas
///
module.exports = (worker) => {

    /**
     * Queue: Split de pagamento do SafraPay.
     * @name: "safra_split_pagamento"
     */
     worker.queue('safra_split_pagamento', require('./safra_split_pagamento'));

    /**
     * Salvar as mensagens de erro.
     * @name: "salvar_erros"
     */
    worker.queue('salvar_erros', require('./salvar_erros'), { error_queue: null });

    /**
     * Fila de teste
     * @name: nome_da_fila
     */
    worker.queue('nome_da_fila', require('./teste'), { 
        error: {
            //queue: 'fila_erro',
            tentativas: {
                qtd: 3,
                intervalo: 3000
            }
        }
    });
    
}