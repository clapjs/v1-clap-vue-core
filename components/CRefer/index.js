import i18n from '../../lib/i18n'
import CRefer from './CRefer'

const Refer= (Vue)=>{
    const Constructor=Vue.extend({
        template: `
    <a-config-provider :locale="locale">
        <a-modal v-model="visible" :title="title" :width="1024"  :maskClosable="false" :bodyStyle="{padding:'6px 12px'}" :dialog-style="{ top: '20px' }" destroyOnClose @ok="ok()" @cancel="visible=false">
            <a-input-search style="margin-bottom: 6px;width: 200px" placeholder="请输入关键字" enter-button="搜索"  @search="onSearch"/>
            <a-row style="margin-bottom: 6px;">
                <span>已选中{{selectedRows.length}}项:</span>
                <template v-for="row in selectedRows">
                    <a-tag color="blue" closable @close="onTagClose(row._id)" style="margin: 0 6px 6px 0" :key="row._id">
                        {{$clap.helper.getJsonValue(row, dataTextFields)}}
                    </a-tag>
                </template>
            </a-row>
            <c-table :value="records" :mode="listCfg.mode"  :columns="listConfig.columns" :replaceFields="listCfg.replaceFields" :count="count" :loading="loading" :scroll="{y:400}" :customRow='customRow' :select-type="multiple ? 'checkbox' : 'radio'" :selected-rows="selectedRows" :selected-row-keys="selectedRowKeys" :pagination="pagination"  @pagingChange="onPagingChange"  @selectChange="onSelectChange"/>
            <template slot="footer" style="padding: 6px 12px">
                <a-button type="default" @click="visible=false" >
                    取消
                </a-button>
                <a-button type="primary" @click="ok" >
                    确定
                </a-button>
            </template>
        </a-modal>
    </a-config-provider>
    `,
        data() {
            return {
                visible: false,
                loading: false,
                listConfig: {},
                dataTextFields: '_id',
                query: {},
                count: 0,
                records: [],
                multiple:false,
                selectedRowKeys: [],
                selectedRows: []
            }
        },
        computed: {
            locale() {
                return i18n.getLocaleMessage(Vue.prototype.$store.getters.lang).antLocale
            },
            listCfg() {
                let config = {};
                config.mode = this.listConfig.mode ? this.listConfig.mode : 'Table';
                if (config.mode === 'Tree') {
                    config.replaceFields = this.listConfig.replaceFields ? {
                        key: this.listConfig.replaceFields.key ? this.listConfig.replaceFields.key : 'key',
                        value: this.listConfig.replaceFields.value ? this.listConfig.replaceFields.value : 'value',
                        title: this.listConfig.replaceFields.title ? this.listConfig.replaceFields.title : 'title',
                    } : {key:'key', value: 'value',title: 'title', }
                }
                if (config.mode === 'List') {
                    config.icon = this.listConfig.icon ? this.listConfig.icon : 'file-display-one';
                    config.grid = this.listConfig.grid ? this.listConfig.grid : false;
                    config.replaceFields = this.listConfig.replaceFields ? {
                        title: this.listConfig.replaceFields.title ? this.listConfig.replaceFields.title : 'title',
                        description: this.listConfig.replaceFields.description ? this.listConfig.replaceFields.description : 'description'
                    } : {title: 'title', description: 'description'}
                }
                return config;
            },
            pagination() {
                let limit=10;
                switch (this.listCfg.mode){
                    case 'Table':
                        limit=10;
                        break;
                    case 'Tree':
                        limit=500;
                        break;
                    case 'List':
                        limit=12;
                        break;
                    default:
                        break;
                }
                return {
                    showSizeChanger: true,
                    showQuickJumper: true,
                    defaultPageSize:Number(limit),
                    pageSizeOptions: [String(limit), String(limit * 5), String(limit * 10), String(limit * 50)]
                }
            },
        },
        methods: {
            customRow(record) {
                return {
                    on: {
                        click: () => {
                            if(this.multiple){
                                const keyIndex=this.selectedRowKeys.indexOf(record._id);
                                const rowIndex=this.selectedRows.findIndex(item=>item._id===record._id);
                                if(keyIndex>-1){
                                    this.selectedRowKeys.splice(keyIndex, 1);
                                    if(rowIndex>-1){
                                        this.selectedRows.splice(rowIndex, 1);
                                    }
                                }else{
                                    this.selectedRowKeys.push(record._id);
                                    if(rowIndex<0){
                                        this.selectedRows.push(record);
                                    }
                                }
                            }else{
                                this.selectedRowKeys=[record._id];
                                this.selectedRows=[record];
                            }
                        },
                        dblclick: () => {
                            this.ok()
                        }
                    }
                }
            },
            onSearch() {},
            onPagingChange() {},
            onSelectChange(keys, rows) {
                this.selectedRows = rows
                this.selectedRowKeys = keys
            },
            onTagClose(key) {
                this.selectedRowKeys = this.selectedRowKeys.filter(item => item !== key)
                this.selectedRows = this.selectedRows.filter(item => item._id !== key)
            },
            ok() {
                this.visible = false
                this.onOk(this.selectedRowKeys, this.selectedRows)
            }
        }
    })
    return (pageIdOrName,controlType,clap)=>{
        const $clap=Vue.prototype[clap?clap:'$clap'];
        const $store=Vue.prototype.$store;
        let config;
        const getDefaultQuery = async (config, query) => {
            const filter=await $clap.page.getPageCtrlFilter(config.code,controlType,$store.getters.organ,$store.getters.group);
            query = query?query:{};
            query.pipeline=config.pipeline?JSON.parse(config.pipeline):[];
            query.page = query.page === void 0 ? 1 : query.page;
            query.limit = query.limit === void 0 ? 10 : query.limit;
            query.limit = config.listConfig.mode==='tree'? 500 : query.limit;
            query.order = !query.order ? '-_id' : query.order
            query.filter = query.filter ? { $and: [query.filter, filter] } : filter;
            query.likeBy = query.likeBy ? query.likeBy : '';
            query.likeBy = [...new Set([...Array.isArray(query.likeBy)?query.likeBy:query.likeBy.split(','), ...config.listConfig.columns.filter(el => el.field !== 'p_id' && el.widget === 'String' && el.fuzzyQuery).map(el => el.field)])].join(',');
            return query;
        }
        let loadData = async query => {
            config = config ? config : await $clap.page.getPageConfig(pageIdOrName)
            return await $clap.model(config.idEntity.dsCollection).aggregate(await getDefaultQuery(config, query ? query : {}))
        }
        let loadDataById = async (ids) => {
            config = config ? config : await $clap.page.getPageConfig(pageIdOrName);
            return await $clap.model(config.idEntity.dsCollection).aggregate({ pipeline:config.pipeline?JSON.parse(config.pipeline):[], filter:{_id:{$in:ids}} }).then(res => res.records)
        }
        const modal = async options => {
            options=options?options:{};
            config = config ? config : await $clap.page.getPageConfig(pageIdOrName);
            options.query = await getDefaultQuery(config, options.query?options.query:{})
            const instance = new Constructor({
                data: {
                    title: config.name,
                    listConfig:config.listConfig,
                    query: options.query,
                    multiple: options.multiple,
                    dataTextFields: options.dataTextFields,
                    selectedRowKeys: options.selectedRowKeys ? options.selectedRowKeys : [],
                    selectedRows: options.selectedRows ? options.selectedRows : [],
                    onOk: options.onOk ? options.onOk : () => {},
                    onCancel: options.onCancel ? options.onCancel : () => {}
                }
            })
            instance.vm = instance.$mount() // 挂载但是并未插入dom，是一个完整的Vue实例
            loadDataById = options.loadDataById ? options.loadDataById : loadDataById
            if (options.selectedRowKeys && options.selectedRowKeys.length > 0) {
                await loadDataById(options.selectedRowKeys).then(item => {
                    instance.vm.selectedRows = item
                })
            }
            loadData = options.loadData ? options.loadData : loadData
            const loadDataDefault = async () => {
                instance.vm.loading = true
                instance.vm.query = options.query
                await loadData(options.query, config).then(res => {
                    instance.vm.records = res.records
                    instance.vm.count = res.count
                })
                instance.vm.loading = false
            }
            if (options.onSelectChange) {
                let onSelectChangeDefault = instance.vm.onSelectChange
                instance.vm.onSelectChange = async (keys, rows) => {
                    await onSelectChangeDefault(keys, rows)
                    const { selectedRowKeys, selectedRows,query } = await options.onSelectChange(keys, rows, { query: instance.vm.query })
                    instance.vm.selectedRowKeys = selectedRowKeys;
                    instance.vm.selectedRows = selectedRows
                    query && (await instance.vm.onPagingChange(query))
                }
            }
            instance.vm.onPagingChange = (pagination, filters, sorter)=> {
                options.query.page = pagination.current;
                if (options.query.limit !== pagination.pageSize) {
                    options.query.limit = pagination.pageSize;
                    options.query.page = 1;
                }
                if (sorter && sorter.field) {
                    const order = sorter.order === 'ascend' ? sorter.field : '-' + sorter.field;
                    if (options.query.order !== order) {
                        options.query.order = order;
                        options.query.page = 1;
                    }
                }
                loadDataDefault();
            };
            instance.vm.onSearch = val => {
                options.query.page = 1
                options.query.like = val
                return loadDataDefault()
            }
            instance.vm.visible = true
            document.getElementById('app').appendChild(instance.vm.$el) // 将dom插入body
            await loadDataDefault()
        }

        return { loadData,  loadDataById,  modal }
    }
}

export {CRefer,Refer}

