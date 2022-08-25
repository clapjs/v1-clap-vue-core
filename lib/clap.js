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
    async getPageConfig(refer) {
        const PageConfig = await this.model('cdp_page').get({params: {filter: /^[a-fA-F0-9]{24}$/.test(refer) ? { _id: refer } : { code: refer }, populate: 'idEntityList,idEntityCard,idEnum'}}).then(res => res.records[0])
        PageConfig.widgets = PageConfig._id ? await this.model('cdp_page_widget').get({ params: { filter: { idPage: PageConfig._id }, order: 'order', populate: 'idEnum' } }).then(res => res.records) : []
        PageConfig.populate = []
        for (let widget of PageConfig.widgets.filter(item => item.mode === 'listCard')) {
            if ('RadioRefer' === widget.widget) {
                const parent = PageConfig.widgets.filter(item => item._id === widget.p_id)[0]
                PageConfig.populate.push(parent.widget === 'Table' ? parent.field + '.' + widget.field : widget.field)
            } else if ('CheckboxRefer' === widget.widget) {
                const parent = PageConfig.widgets.filter(item => item._id === widget.p_id)[0]
                PageConfig.populate.push(parent.widget === 'Table' ? parent.field + '.' + widget.field + '.idObject' : widget.field + '.idObject')
            }
        }
        return new Promise(function (resolve, reject) {
            resolve(PageConfig)
        })
    }
}