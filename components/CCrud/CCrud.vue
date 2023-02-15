<template>
    <a-card :bordered="false" style="height: 100%">
        <a-space slot="title">
            <slot name="title"></slot>
            <a-button v-if="buttons.length===0" :type="buttons[0].type" :icon="buttons[0].icon"  @click="onButtonClick(buttons[0].event,selectedRows)" :disabled="getButtonDisabled(buttons[0].event,selectedRows)">{{ buttons[0].name }}</a-button>
            <a-button-group v-else>
                <a-button v-for="button of buttons" :key="button.event" :type="button.type?button.type:'primary'" :icon="button.icon" @click="onButtonClick('onButtonClick',button.event,selectedRows)" :disabled="getButtonDisabled(button.event,selectedRows)">{{ button.name }}</a-button>
            </a-button-group>
        </a-space>
        <a-space slot="extra">
            <slot name="extra"></slot>
            <a-input-search allowClear  placeholder="请输入关键字" enter-button style="width: 200px" @search="onSearch"/>
            <a-alert :message="selectedRows.length>0?`已选中${selectedRows.length}条数据`:'未选中任何数据'" type="info" show-icon/>
        </a-space>
        <c-table :value="data" v-if="listCfg.mode==='Table'||listCfg.mode==='Tree'" :mode="listCfg.mode"  :buttons="rowButtons" :buttons-style="extraRowButtonsStyle" :buttons-disabled="buttonsDisabled" :columns="listColumns" :replaceFields="listCfg.replaceFields" :count="count" :loading="loading" :pagination="pagination" @pagingChange="onPagingChange" @buttonClick="onButtonClick" :customRow='customRow' @selectChange="onSelectChange"/>
        <c-list :value="data" v-else-if="listCfg.mode==='List'" :buttons="rowButtons" :buttons-disabled="buttonsDisabled" :icon="listCfg.icon" :grid="listCfg.grid" :replaceFields="listCfg.replaceFields" :count="count" :loading="loading" :pagination="pagination" @pagingChange="onPagingChange" @buttonClick="onButtonClick"/>
        <a-modal destroyOnClose v-if="editCfg.mode==='Modal'" :title="editData._id?'修改'+name:'新增'+name" v-model="visible" :width="editCfg.width" :maskClosable="false" destroyOnClose @ok="conserve(editData)" @cancel="resetForm">
            <c-form ref="form" v-model="editData" :columns="editColumns"/>
        </a-modal>
        <a-drawer destroyOnClose v-else :title="editData._id?'修改'+name:'新增'+name" placement="bottom" :visible="visible" @close="resetForm" :height="editCfg.width">
            <c-form ref="form" v-model="editData" :columns="editColumns"/>
            <div class="drawer-footer">
                <a-button :style="{ marginRight: '8px' }" @click="resetForm">取消</a-button>
                <a-button type="primary" @click="conserve(editData)">保存</a-button>
            </div>
        </a-drawer>
    </a-card>
</template>

<script>
import CWidget from "../CWidget/CWidget";
import CWidgetDisplay from "../CWidgetDisplay/CWidgetDisplay";
export default {
    name: "CCrud",
    components: {CWidgetDisplay, CWidget},
    props: {
        name: {
            type: String,
            default: () => {
                return ''
            }
        },
        listConfig: {
            type: Object,
            default: () => {
                return {}
            }
        },
        editConfig: {
            type: Object,
            default: () => {
                return {}
            }
        },
        extraButtons: {
            type: Array,
            default: () => {
                return []
            }
        },
        extraRowButtons: {
            type: Array,
            default: () => {
                return []
            }
        },
        extraRowButtonsStyle: {
            type: String,
            default: () => {
                return 'ButtonGroup'
            }
        },
        buttonsDisabled: {
            type: Object,
            default() {
                return {}
            }
        },
        core: {
            type: String,
            default: () => {
                return '$clap'
            }
        },
        model: {
            required: true,
            type: String,
        },
        defaultQuery: {
            type: [Object, Boolean],
            default() {
                return false
            }
        },
        columns: {
            type: Array,
            default: () => {
                return []
            }
        },
        customRow: {
            type: Function,
        },
        beforeShowCreate: {
            type: [Boolean, Function],
            default: () => {
                return false
            }
        },
        beforeShowModify: {
            type: [Boolean, Function],
            default: () => {
                return false
            }
        },
        beforeCreate: {
            type: [Boolean, Function],
            default: () => {
                return false
            }
        },
        beforeModify: {
            type: [Boolean, Function],
            default: () => {
                return false
            }
        },
        beforeRemove: {
            type: [Boolean, Function],
            default: () => {
                return false
            }
        }
    },
    data() {
        return {
            visible: false,
            loading: false,
            data: [],
            count: 0,
            query: {
                page: 1,
                limit: 10,
                order: '_id',
            },
            editData: {},
            selectedRowKeys:[],
            selectedRows:[]
        }
    },
    watch: {
        defaultQuery: {
            async handler(query) {
                this.setQuery(query);
                !this.getButtonDisabled('loadData',{})&&await this.loadData();
            },
            deep: true //true 深度监听
        },
        editData: {
            async handler(data) {
                this.$emit('edit',data)
            },
            deep: true //true 深度监听
        }
    },
    computed: {
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
        editCfg() {
            let config = {};
            config.mode = this.editConfig.hasOwnProperty('mode') ? this.editConfig.mode : 'Modal';
            config.grid = this.editConfig.hasOwnProperty('grid') ? this.editConfig.grid : false;
            config.width = this.editConfig.hasOwnProperty('width') ? this.editConfig.width : 768;
            return config;
        },
        listColumns() {
            const columns= this.columns.map(item => {
                return {...item, ...item.listConfig}
            }).map(item => {
                delete item.listConfig;
                delete item.editConfig;
                return item
            })
            return columns;
        },
        editColumns() {
            const columns= this.columns.map(item => {
                return {...item, ...item.editConfig}
            }).map(item => {
                delete item.listConfig;
                delete item.editConfig;
                return item
            })
            columns.map(column=>{
                if (!column.span) {
                    column.span=24
                    if (this.editCfg.grid && this.editCfg.grid.hasOwnProperty('column')) {
                        column.span= 24 / this.editCfg.grid.column
                    }
                }
                return column;
            })
            return columns;
        },
        likeBy() {
            let likeBy = [];
            for (let column of this.columns) {
                if (column.fuzzy) {
                    likeBy.push(column.field)
                }
            }
            return likeBy.toString()
        },
        buttons() {
            return [{event: 'create', name: '新增', icon: 'plus'}, {
                event: 'loadData',
                name: '重载',
                icon: 'sync'
            }, ...this.extraButtons]
        },
        rowButtons() {
            return [{event: 'modify', name: '修改', icon: 'edit'}, {
                event: 'remove',
                name: '删除',
                icon: 'delete'
            }, ...this.extraRowButtons]
        },
        pagination() {
            const limit = this.defaultQuery.hasOwnProperty('limit') ? this.defaultQuery.limit : (this.listCfg.mode === 'Table' ? 10 : 12)
            return {
                showSizeChanger: true,
                showQuickJumper: true,
                defaultPageSize:Number(limit),
                pageSizeOptions: [String(limit), String(limit * 5), String(limit * 10), String(limit * 50)]
            }
        },
    },
    created() {
        this.setQuery(this.defaultQuery);
    },
    mounted() {
        !this.getButtonDisabled('loadData',{})&&this.loadData();
    },
    methods: {
        async setFormData(cb) {
            this.editData = JSON.parse(JSON.stringify(typeof cb==='function'?await cb(this.editData):await cb));
        },
        setQuery(query) {
            if(!query)return;
            this.query = {...this.query, ...query};
        },
        getButtonDisabled(event, records) {
            if (this.buttonsDisabled.hasOwnProperty(event)) {
                return typeof this.buttonsDisabled[event] === 'function' ? this.buttonsDisabled[event](records) : this.buttonsDisabled[event]
            }
            return false
        },
        onButtonClick(event, record) {
            if (this.extraButtons.findIndex(item => item.event === event) > -1) {
                this.$emit('buttonClick', event, record);
                return;
            }
            if (this.extraRowButtons.findIndex(item => item.event === event) > -1) {
                this.$emit('buttonClick', event, record);
                return;
            }
            this[event](record)
        },
        async create() {
            this.editData = this.beforeShowCreate ? await this.beforeShowCreate() : {};
            this.visible = true;
        },
        async modify(record) {
            this.editData = JSON.parse(JSON.stringify(this.beforeShowModify ? await this.beforeShowModify(record) : record));
            this.visible = true;
        },
        async remove(record) {
            record = this.beforeRemove ? await this.beforeRemove(record) : record;
            if (!record) return;
            this.$confirm({
                title: '提示',
                content: this.$t('operate.notice.remove'),
                onOk: async () => {
                    await this[this.core].model(this.model).delete(record._id);
                    this.$emit('onRemove', record)
                    await this.loadData();
                }
            });
        },
        async loadData() {
            this.$nextTick(async ()=>{
                this.loading = true;
                const {records, count} = await this[this.core].model(this.model).get({params: this.query});
                this.data = records;
                this.count = count;
                this.loading = false;
                this.$emit('loaded', this.data)
            })
        },
        async onSearch(value) {
            this.query.likeBy = this.likeBy;
            if (value) {
                this.query.like = value;
            } else {
                delete this.query.like
            }
            await this.loadData()
        },
        async onPagingChange(pagination, filters, sorter) {
            this.query.page = pagination.current;
            if (this.query.limit !== pagination.pageSize) {
                this.query.limit = pagination.pageSize;
                this.query.page = 1;
            }
            if (sorter && sorter.field) {
                const order = sorter.order === 'ascend' ? sorter.field : '-' + sorter.field;
                if (this.query.order !== order) {
                    this.query.order = order;
                    this.query.page = 1;
                }
            }
            await this.loadData();
        },
        async conserve(data) {
            this.$refs.form.validate(async valid => {
                if (valid) {
                    if (data._id) {
                        data = this.beforeModify ? await this.beforeModify(data) : data;
                        if (data) {
                            const oldData = await this[this.core].model(this.model).getByID(data._id).then(res => res.records[0])
                            await this[this.core].model(this.model).put(data._id, data);
                            this.$emit('onModify', data, oldData);
                        }else{
                            return false
                        }
                    } else {
                        data = this.beforeCreate ? await this.beforeCreate(data) : data;
                        if (data) {
                            const record = await this[this.core].model(this.model).post(data).then(res => res.records[0]);
                            this.$emit('onCreate', record ,data)
                        }
                        else{
                            return false
                        }
                    }
                    this.resetForm();
                    await this.loadData();
                } else {
                    return false;
                }
            });
        },
        resetForm() {
            this.$refs.form.resetFields();
            this.visible = false;
        },
        onSelectChange(selectedRowKeys, selectedRows){
            this.selectedRowKeys=selectedRowKeys;
            this.selectedRows=selectedRows;
            this.$emit('selectChange',this.selectedRowKeys,this.selectedRows)
        }
    }
}
</script>

<style scoped>
.drawer-footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
    border-top: 1px solid #e9e9e9;
    padding: 10px 16px;
    background: #fff;
    text-align: right;
    z-index: 1;
}
</style>
