export default class clap {
    constructor(axios) {
        this.axios=axios;
        this.prefix='/clap';
    }
    setPrefix(Prefix){
        this.prefix = Prefix
    }
    model(name){
        const url = [this.prefix, 'model'].join('/')
        return {
            get: async params => {
                return (await this.axios.get([url, name].join('/'), params)).data
            },
            getByID: async (id, params) => {
                if (!id) {
                    return {
                        error: {
                            code: '9999',
                            message: 'param id missing'
                        }
                    }
                }
                return (await this.axios.get([url, name, id].join('/'), params)).data
            },
            getByPost: async params => {
                return (await this.axios.post([prefix, 'getByPost', name].join('/'), params)).data
            },
            post: async data => {
                return (await this.axios.post([url, name].join('/'), data)).data
            },
            patch: async (id, data) => {
                if (!id || (Array.isArray(id) && id.length === 0)) {
                    return {
                        error: {
                            code: '9999',
                            message: 'param id missing'
                        }
                    }
                }
                return (await this.axios.patch([url, name, id].join('/'), data)).data
            },
            put: async (id, data) => {
                if (!id || (Array.isArray(id) && id.length === 0)) {
                    return {
                        error: {
                            code: '9999',
                            message: 'param id missing'
                        }
                    }
                }
                return (await this.axios.put([url, name, id].join('/'), data)).data
            },
            delete: async id => {
                if (!id || (Array.isArray(id) && id.length === 0)) {
                    return {
                        error: {
                            code: '9999',
                            message: 'param id missing'
                        }
                    }
                }
                return (await this.axios.delete([url, name, id].join('/'))).data
            },
            aggregate: async params => {
                return (await this.axios.post([this.prefix, 'getByAggregate', name].join('/'), params)).data
            }
        }
    }
}