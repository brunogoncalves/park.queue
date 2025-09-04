const arr = require('rhinojs/support/arr');

class JobMetadata
{
    constructor(data) {
        this.data = data ? data : {};
    }

    get(key, def = null) {
        return arr.get(this.data, key, def);
    }

    set(key, value) {
        this.data[key] = value;
    }

    get tentativa() {
        return this.get('tentativa', 1);
    }

    set tentativa(value) {
        this.set('tentativa', value);
    }

    get queueOriginal() {
        return this.get('_original_queue', '');
    }

    get errorMessage() {
        return this.get('_error_message', '');
    }

    toJSON() {
        return this.data;
    }
}

module.exports = JobMetadata;