<template>
    <a-table :id="id" :columns="currentColumns" tableLayout="fixed" :scroll="currentScroll" rowKey="_key" defaultExpandAllRows :dataSource="dataSource" :rowSelection="editable?null:rowSelection" size="small" :pagination="editable?false:currentPagination" :loading="loading" @change="(pagination, filters, sorter)=>$emit('pagingChange',pagination, filters, sorter)" :customHeaderRow='customHeaderRow' :customRow='customRow'>
        <template slot="leftActions" slot-scope="text, record, index">
            <a-space>
                <a-tooltip><template slot="title"> 复制 </template><a-button icon="copy" size="small" :disabled="getEditButtonsDisabled('copy',record)"  @click="handleCopy(record)" /></a-tooltip>
                <a-tooltip><template slot="title"> 增行 </template><a-button icon="plus" size="small" :disabled="getEditButtonsDisabled('add',record)" @click="handleAdd(record)" /></a-tooltip>
                <a-tooltip><template slot="title"> 删行 </template><a-button icon="minus" size="small" :disabled="getEditButtonsDisabled('remove',record)"  @click="handleRemove(record)" /></a-tooltip>
                <a-tooltip v-if="mode==='Tree'"><template slot="title"> 增行(子节点) </template><a-button icon="plus-circle" size="small" :disabled="getEditButtonsDisabled('addChild',record)"  @click="handleAddChild(record)" /></a-tooltip>
            </a-space>
        </template>
        <template v-for="(column,columnIndex) in columns" :slot="column.field + 'Render'+columnIndex" slot-scope="text, record, index">
            <c-widget v-if="editable&&getColumnVisible(column,record)" :value="text" :widget="column.widget" :widget-config="getWidgetConfig(column,record)" :disabled="getColumnDisabled(column,record)" @change="(val,extra)=>handleCellChange(val,extra,record,column)"></c-widget>
            <c-widget-display v-else-if="!editable&&getColumnVisible(column,record)" :value="text" :widget="column.widget" :widget-config="getWidgetConfig(column,record)" :disabled="getColumnDisabled(column,record)"></c-widget-display>
        </template>
        <template slot="rightActions" slot-scope="value,record,index">
            <a-space v-if="buttonsStyle==='ButtonGroup'">
                <a-button v-for="button of buttons" :key="button.event" type="primary" ghost size="small" :icon="button.icon" @click="()=>{$emit('buttonClick',button.event,record)}" :disabled="getButtonDisabled(button.event,record)">{{ button.name }}</a-button>
            </a-space>
            <a-dropdown v-else-if="buttonsStyle==='Dropdown'">
                <a-icon type="ellipsis"/>
                <a-menu slot="overlay" @click="({key})=>{$emit('buttonClick',JSON.parse(key).event,JSON.parse(key).record)}">
                    <template v-for="(button,index) of buttons"><a-menu-item :disabled="getButtonDisabled(button.event,record)" :key="JSON.stringify({event:button.event,record})"><a-icon :type="button.icon"></a-icon>{{button.name}}</a-menu-item><a-menu-divider v-if="index<=buttons.length-2"></a-menu-divider></template>
                </a-menu>
            </a-dropdown>
        </template>
    </a-table>
</template>

<script>

import CWidgetDisplay from "../CWidgetDisplay/CWidgetDisplay";
export default {
    name: "CTable",
    components: {CWidgetDisplay},
    props:{
        value: {
            type: [Array],
            default:()=>{
                return []
            }
        },
        disabled:{
            type:Boolean,
            default:false
        },
        mode: {
            type: String,
            default: () => {
                return 'Table'
            }
        },
        buttons:{
            type:Array,
            default:()=>{
                return []
            }
        },
        buttonsDisabled: {
            type: Object,
            default() {
                return {}
            }
        },
        buttonsStyle: {
            type: String,
            default() {
                return 'ButtonGroup'
            }
        },
        editButtonsDisabled: {
            type: Object,
            default() {
                return {}
            }
        },
        loading:{
            type:Boolean,
            default(){
                return false
            }
        },
        columns:{
            type:Array,
            default:()=>{
                return []
            }
        },
        replaceFields:{
            type:Object,
            default:()=>{
                return {
                    key:'key',
                    value: 'value',
                    title: 'title'
                }
            }
        },
        editable:{
            type:Boolean,
            default:()=>{
                return false
            }
        },
        pagination: {
            type:Object,
            default:()=>{
                return {
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '50', '100', '500']
                }
            }
        },
        count:{
            type:Number,
            default:()=>{
                return 0
            }
        },
        scroll:{
            type:[Object],
            default(){
                return {}
            }
        },
        customRow: {
            type: [Function,Boolean],
            default:()=>{
                return false
            }
        },
        customHeaderRow: {
            type: [Function,Boolean],
            default:()=>{
                return false
            }
        },
        selectType:{
            type:String,
            default:()=>{
                return 'checkbox'
            }
        },
        selectedRowKeys:{
            type:Array,
            default:()=>{
                return []
            }
        },
        selectedRows:{
            type:Array,
            default:()=>{
                return []
            }
        },
        beforeAdd: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeAddChild: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeCopy: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeRemove: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
    },
    data() {
        return {
            id:this.$clap.helper.uuid(),
            currentValue: [],
            currentSelectedRowKeys:[],
            currentSelectedRows:[],
        }
    },
    computed: {
        currentPagination(){
            return {
                total:this.count,
                ...this.pagination
            }
        },
        currentColumns(){
            let columns=[{
                title: '行号',
                align: 'center',
                fixed:'left',
                width: 100,
                customRender: (text, record, index) => {
                    return index + 1
                },
            }];
            if(this.editable){
                columns=[...columns,{
                    title: '行操作',
                    align: 'center',
                    fixed:'left',
                    width: 150,
                    scopedSlots: {customRender: 'leftActions'},
                }]
            }
            columns=[...columns,...this.columns.reduce((preColumns,column,index)=>{
                if(!column.hasOwnProperty('visible')||column.visible===true){
                    return [...preColumns,{
                        title: column.name ? column.name : column.field,
                        align: 'center',
                        key: column.field+index,
                        dataIndex: column.field,
                        width: column.width,
                        ellipsis: true,
                        scopedSlots: {customRender: column.field + 'Render'+index}
                    }];
                }else{
                    return preColumns
                }
            },[])]
            if(this.buttons.length>0){
                const rightAction={
                    title: '操作',
                    align: 'center',
                    fixed:'right',
                    scopedSlots: {customRender: 'rightActions'},
                }
                if(this.buttonsStyle==='ButtonGroup'){
                    rightAction.width=this.buttons.length*80
                }
                columns.push(rightAction)
            }
            return columns;
        },
        currentScroll(){
            return {
                x:this.scroll.x?this.scroll.x:this.currentColumns.reduce((pre,cur)=>{return pre+cur.width},0),
                y:this.scroll.y?this.scroll.y:500
            }
        },
        dataSource(){
            const data=JSON.parse(JSON.stringify(this.currentValue));
            if(this.mode==='Tree'){
                const replaceFields = this.replaceFields ? {
                    key: this.replaceFields.key ? this.replaceFields.key : 'key',
                    value: this.replaceFields.value ? this.replaceFields.value : 'value',
                    title: this.replaceFields.title ? this.replaceFields.title : 'title',
                } : {key:'key', value: 'value',title: 'title' }
                return this.$clap.helper.listToTree(data,0,{key:'_key',pKey:'p_key',replaceFields})
            }
            return data;
        },
        rowSelection() {
            return {
                fixed:true,
                type:this.selectType,
                selectedRowKeys:this.currentSelectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                    this.currentSelectedRowKeys=selectedRowKeys;
                    this.currentSelectedRows=[...this.currentSelectedRows.filter(item=>!selectedRows.map(item=>item._key).includes(item._key)),...selectedRows].filter(item=>selectedRowKeys.includes(item._key));
                    this.$emit('selectChange',this.currentSelectedRowKeys,this.currentSelectedRows)
                },
                getCheckboxProps: record => ({
                    props: {
                        disabled: record._disabled, // Column configuration not to be checked
                    },
                }),
            };
        },
    },
    watch: {
        value: {
            async handler(value) {
                await this.setCurrentValue(value)
            },
            deep: true //true 深度监听
        },
        selectedRowKeys: {
            async handler(value) {
                await this.setCurrentSelectedRowKeys(value)
            },
            deep: true //true 深度监听
        },
        selectedRows: {
            async handler(value) {
                await this.setCurrentSelectedRows(value)
            },
            deep: true //true 深度监听
        }
    },
    created() {
        this.setCurrentValue(this.value);
        this.setCurrentSelectedRowKeys(this.selectedRowKeys);
        this.setCurrentSelectedRows(this.selectedRows)
    },
    methods: {
        getEditButtonsDisabled(event,record){
            if(this.editButtonsDisabled.hasOwnProperty(event)){
                return typeof this.editButtonsDisabled[event]==='function'?this.editButtonsDisabled[event](record):this.editButtonsDisabled[event]
            }
            return false
        },
        getButtonDisabled(event,record){
            if(this.buttonsDisabled.hasOwnProperty(event)){
                return typeof this.buttonsDisabled[event]==='function'?this.buttonsDisabled[event](record):this.buttonsDisabled[event]
            }
            return false
        },
        getColumnDisabled(column,record) {
            if(this.disabled){
                return true
            }
            if(column.hasOwnProperty('disabled')){
                return typeof column.disabled === 'function' ? column.disabled(record) : column.disabled
            }
            return false;
        },
        getColumnVisible(column,record) {
            if(column.hasOwnProperty('rowVisible')){
                return typeof column.rowVisible === 'function' ? column.rowVisible(record) : column.rowVisible
            }
            return true;
        },
        getWidgetConfig(column,record) {
            const widgetConfig={...typeof column.widgetConfig === 'function'?column.widgetConfig(record):column.widgetConfig};
            widgetConfig.range= typeof widgetConfig.range === 'function' ? widgetConfig.range(record) : widgetConfig.range;
            widgetConfig.beforeChange=()=>{
                return widgetConfig.beforeChange ? async (params = record) => {await widgetConfig.beforeChange(params)} : true
            }
            return widgetConfig;
        },
        async setCurrentValue(value) {
            this.currentValue=value.map((item)=>{return this.mode==='Tree'?{...item,_key:item._key?item._key:(item._id?item._id:this.$clap.helper.uuid()),p_key:item.p_key?item.p_key:(item.p_id?item.p_id:'0')}:{...item,_key:item._key?item._key:(item._id?item._id:this.$clap.helper.uuid())}});
            if(this.editable&&this.currentValue.length===0){
                let record = this.mode==='Tree'?{ _key: this.$clap.helper.uuid(),p_key:0 }: { _key: this.$clap.helper.uuid() };
                if (this.beforeAdd) {
                    record=await this.beforeAdd(record,{record,index:0})
                }
                this.currentValue=[record];
            }
            this.handleInput()
        },
        async setCurrentSelectedRowKeys(value){
            this.currentSelectedRowKeys=value
        },
        async setCurrentSelectedRows(value){
            this.currentSelectedRows=value
        },
        handleInput() {
            const value=JSON.stringify(this.currentValue);
            if(JSON.stringify(this.value)!==value){
                this.$emit('input',JSON.parse(value));
                this.$emit('change',JSON.parse(value))
            }
        },
        async handleAdd(record) {
            let Record=this.mode==='Tree'?{ _key: this.$clap.helper.uuid(),p_key:record.p_key }: { _key: this.$clap.helper.uuid() };
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeAdd) {
                Record=await this.beforeAdd(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index+1, 0, Record)
            this.handleInput()
            this.$emit('add',Record)
        },
        async handleAddChild(record) {
            let Record=this.mode==='Tree'?{ _key: this.$clap.helper.uuid(),p_key:record._key }: { _key: this.$clap.helper.uuid() };
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeAddChild) {
                Record=await this.beforeAddChild(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index+1, 0, Record)
            this.handleInput()
            this.$emit('addChild',Record)
        },
        async handleCopy(record) {
            let Record={...record,_key:this.$clap.helper.uuid()}
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeCopy) {
                Record=await this.beforeCopy(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index + 1, 0, Record)
            this.handleInput()
            this.$emit('copy',record, index)
        },
        async handleRemove(record) {
            if(this.currentValue.length===1){
                this.$message.error('已经是最后一行数据了！');
                return;
            }
            if(this.mode==='Tree'&&this.currentValue.filter(item=>item.p_key===record._key).length>0){
                this.$message.error('请先删除子节点！');
                return;
            }
            let Record=record;
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeRemove) {
                Record=await this.beforeRemove(record);
            }
            if(!Record)return;
            this.currentValue.splice(index, 1);
            this.handleInput()
            this.$emit('remove',record, index)
        },
        handleCellChange(value,extra, record, column) {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                //创建一个定时器，一秒钟执行一次
                const index=this.currentValue.findIndex(item=>item._key===record._key)
                this.currentValue[index][column.field] = value;
                this.handleInput();
                column.onChange&&column.onChange(value,extra,{record:this.currentValue[index],index},column);
            }, 100)
        }
    }
}
</script>

<style scoped>

</style>
