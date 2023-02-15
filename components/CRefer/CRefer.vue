<template>
    <a-row type="flex">
        <a-col flex="auto" span="1">
            <a-select ref="select" allow-clear :disabled="disabled" :mode="this.multiple?'multiple':'default'" show-search :value="currentValue" labelInValue style="width: 100%" @focus="onFocus" :not-found-content="null" :show-arrow="false" :filter-option="false" @search="search" @change="onChange">
                <a-select-option v-for="item in records" :key="item._id" :value="item._id">
                    {{$clap.helper.getJsonValue(item, dataTextFields)}}
                </a-select-option>
            </a-select>
        </a-col>
        <a-col flex="32px" v-if="!disabled">
            <a-button type="dashed" icon="ellipsis" @click="onClick" />
        </a-col>
    </a-row>
</template>

<script>
export default {
    name: 'CRefer',
    props: {
        value: {
            type: [String, Array, Object],
            default() {
                return ''
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        loadData: {
            type: [Function, Boolean],
            default: false
        },
        loadDataById: {
            type: [Function, Boolean],
            default: false
        },
        multiple: {
            type: Boolean,
            default: false
        },
        refer: {
            type: String
        },
        controlType: {
            type: String,
            default: 'Global'
        },
        filter: {
            type: Array,
            default() {
                return []
            }
        },
        filterData: {
            type: Object,
            default() {
                return {}
            }
        },
        dataTextFields: {
            type: [String,Array],
            default(){
                return ['_id']
            }
        },
        beforeChange: {
            type: [Function, Boolean],
            default: () => {
                return true
            }
        },
        pkg: {
            type: String,
            default: () => {
                return '$clap'
            }
        },
    },
    data() {
        return {
            currentValue: {},
            currentRefer:{
                config: {}
            },
            visible: false,
            timer: null,
            records: [],
            selectedRowKeys: [],
            selectedRows: []
        }
    },
    async mounted() {
        this.instance = this.$clap.refer(this.refer, this.controlType,this.pkg)
        this.instance.loadData = !!this.loadData ? this.loadData : this.instance.loadData;
        await this.setCurrentValue(!this.multiple?[this.value]:this.value)
    },
    watch: {
        async value(val) {
            await this.setCurrentValue(!this.multiple?[val]:val)
        },
        async refer(refer) {
            if (refer) {
                this.instance = this.$clap.refer(refer, this.controlType,this.pkg)
                this.instance.loadData = this.loadData ? this.loadData : this.instance.loadData
            }
        }
    },
    methods: {
        inspectFilter() {
            let result = true;
            for (let child of this.filter) {
                for (let c of child) {
                    if(!['SYSTEM_ORGAN_USER','SYSTEM_USER'].includes(c.dField)){
                        if (c.dynamic && !this.filterData[c.dField]) {
                            this.$message({ content: '字段' + c.dName + '不能为空！' })
                            this.handleInput([], [])
                            result = false
                        }
                    }
                }
            }
            if (result) {
                for (let child of this.filter) {
                    for (let c of child) {
                        if(!['SYSTEM_ORGAN_USER','SYSTEM_USER'].includes(c.dField)){
                            if (c.dynamic && this.filterData[c.dField]) {
                                c.value = this.filterData[c.dField]
                            }
                        }
                        else
                        {
                            switch (c.dField){
                                case 'SYSTEM_ORGAN_USER':
                                    c.value = this.$store.getters.token
                                    break;
                                case 'SYSTEM_USER':
                                    c.value = this.$store.getters.user._id
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
            return result
        },
        async onClick() {
            if(!this.refer){
                this.$message.error('请先设置参照来源！');
                return;
            }
            if (this.disabled) {
                return
            }
            if (!this.inspectFilter()) {
                this.$refs.select.blur()
                return;
            }
            this.$refs.select.blur();
            if(await this.beforeChange()){
                await this.instance.modal({
                    query: {filter:await this.$clap.helper.resolveFilter(this.filter), likeBy: this.dataTextFields},
                    dataTextFields: this.dataTextFields,
                    multiple: this.multiple,
                    selectedRowKeys: this.selectedRowKeys,
                    selectedRows: this.selectedRows,
                    loadData: !!this.loadData ? this.loadData : this.instance.loadData,
                    loadDataById: !!this.loadDataById ? this.loadDataById : this.instance.loadDataById,
                    onOk: async (selectedRowKeys, selectedRows) => {
                        await this.setCurrentValue(selectedRowKeys, selectedRows);
                        await this.handleInput(selectedRowKeys, selectedRows);
                    }
                })
            }
        },
        async onFocus() {
            if(!this.refer){
                this.$message.error('请先设置参照来源！');
                return;
            }
            if (!this.inspectFilter()) {
                this.$refs.select.blur()
                return;
            }
            await this.loadDefaultData()
        },
        async search(like) {
            this.like = like;
            if (!this.inspectFilter()) {
                return
            }
            clearTimeout(this.timer)
            this.timer = setTimeout(async () => {
                if (like) {
                    const records = await this.instance.loadData({ filter:await this.$clap.helper.resolveFilter(this.filter), like, likeBy: this.dataTextFields }).then(res => res.records)
                    if(this.like===like){
                        this.records=records;
                    }
                } else {
                    await this.loadDefaultData()
                }
            }, 100)
        },
        async onChange(value) {
            await this.setCurrentValue(!this.multiple ? (value ? [value.key] : []) : value[0] ? value.map(item => item.key) : [])
            await this.handleInput(this.selectedRowKeys, this.selectedRows)
        },
        async loadDefaultData() {
            const query = {filter:await this.$clap.helper.resolveFilter(this.filter),limit : 20,page:1};
            if(!this.selectedRowKeys || !this.selectedRowKeys.length){
                const records = await this.instance.loadData({ ...query}).then(res => {
                    if (res) {
                        return res.records
                    } else {
                        this.$refs.select.blur()
                        return
                    }
                })
                if(!this.like){
                    this.records=records;
                }
            }else {
                if(!this.like){
                    this.records=this.selectedRows;
                }
            }
        },
        async setCurrentValue(selectedRowKeys,selectedRows) {
            if (selectedRowKeys && selectedRowKeys[0]) {
                this.selectedRowKeys=selectedRowKeys;
                this.selectedRows=selectedRows?selectedRows:await this.instance.loadDataById(selectedRowKeys);
                this.currentValue = !this.multiple ? { key: this.selectedRows[0]._id, label:this.$clap.helper.getJsonValue(this.selectedRows[0],this.dataTextFields)  } : this.selectedRows.map(item => {return { key: item._id, label: this.$clap.helper.getJsonValue(item, this.dataTextFields) }})
            } else {
                this.selectedRowKeys=[];
                this.selectedRows=[];
                this.currentValue = !this.multiple ? {} : []
            }
        },
        async handleInput(selectedRowKeys, selectedRows) {
            this.$emit('input', this.multiple?selectedRowKeys:selectedRowKeys[0])
            this.$emit('change', this.multiple?selectedRowKeys:selectedRowKeys[0], this.multiple?selectedRows:selectedRows[0])
        }
    }
}
</script>

<style scoped></style>
