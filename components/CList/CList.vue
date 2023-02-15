<template>
    <a-list :data-source="currentValue" :grid="grid" :pagination="currentPagination" :loading="loading">
        <a-list-item slot="renderItem" slot-scope="record, index">
            <a-card v-if="grid">
                <a-card-meta :title="$clap.helper.getJsonValue(record,replaceFields.title?replaceFields.title:'title')?$clap.helper.getJsonValue(record,replaceFields.title?replaceFields.title:'title'):'---'" :description="$clap.helper.getJsonValue(record,replaceFields.description?replaceFields.description:'description')?$clap.helper.getJsonValue(record,replaceFields.description?replaceFields.description:'description'):'---'">
                    <a-avatar shape="square" slot='avatar' :size="50" :style="{backgroundColor:record.iconColor?record.iconColor:iconColor}">
                        <div style="margin:8px" slot="icon">
                            <c-icon :type="record.icon?record.icon:icon" slot="icon" :size="34" :strokeWidth="4" />
                        </div>
                    </a-avatar>
                </a-card-meta>
                <template slot="actions">
                    <a-tooltip v-for="button of buttons" :key="button.event"><template slot="title">{{button.name}}</template><a-button :disabled="getButtonDisabled(button.event,record)" ghost @click="$emit('buttonClick',button.event,record)" :type="button.type?button.type:'primary'" :icon="button.icon" size="small"/></a-tooltip>
                </template>
            </a-card>
            <template v-else>
                <a-list-item-meta :title="$clap.helper.getJsonValue(record,replaceFields.title?replaceFields.title:'title')?$clap.helper.getJsonValue(record,replaceFields.title?replaceFields.title:'title'):'---'" :description="$clap.helper.getJsonValue(record,replaceFields.description?replaceFields.description:'description')?$clap.helper.getJsonValue(record,replaceFields.description?replaceFields.description:'description'):'---'">
                    <a-avatar shape="square" slot='avatar' :size="50" :style="{backgroundColor:record.iconColor?record.iconColor:iconColor}">
                        <div style="margin:8px" slot="icon">
                            <c-icon :type="record.icon?record.icon:icon" slot="icon" :size="34" :strokeWidth="4" />
                        </div>
                    </a-avatar>
                </a-list-item-meta>
                <template slot="actions">
                    <a-tooltip v-for="button of buttons" :key="button.event"><template slot="title">{{button.name}}</template><a-button :disabled="getButtonDisabled(button.event,record)" ghost @click="$emit('buttonClick',button.event,record)" :type="button.type?button.type:'primary'" :icon="button.icon" size="small"/></a-tooltip>
                </template>
            </template>
        </a-list-item>
    </a-list>
</template>

<script>
export default {
    name: "CList",
    props:{
        value: {
            type: [Array],
            default:()=>{
                return []
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
        loading:{
            type:Boolean,
            default(){
                return false
            }
        },
        icon:{
            type:String,
            default:'file-display-one'
        },
        iconColor:{
            type:String,
            default:'#1890ff'
        },
        grid: {
            type:[Boolean,Object],
            default:()=>{
                return false
            }
        },
        replaceFields:{
            type:Object,
            default:()=>{
                return {
                    title:'title',
                    description:'description'
                }
            }
        },
        pagination: {
            type:Object,
            default:()=>{
                return {
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['12', '60', '120', '600']
                }
            }
        },
        count:{
            type:Number,
            default:()=>{
                return 0
            }
        },
    },
    data(){
      return {
          currentValue:[]
      }
    },
    watch: {
        value: {
            async handler(value) {
                this.setCurrentValue(value)
            },
            deep: true //true 深度监听
        }
    },
    computed: {
        currentPagination(){
            return {
                onChange:(current, pageSize)=>{
                    this.$emit('pagingChange',{current, pageSize})
                },
                onShowSizeChange:(current, pageSize)=>{
                    this.$emit('pagingChange',{current, pageSize})
                },
                total:this.count,
                ...this.pagination
            }
        },
    },
    methods: {
        getButtonDisabled(event,record){
            if(this.buttonsDisabled.hasOwnProperty(event)){
                return typeof this.buttonsDisabled[event]==='function'?this.buttonsDisabled[event](record):this.buttonsDisabled[event]
            }
            return false
        },
        setCurrentValue(value) {
            this.currentValue=value;
        },
    }
}
</script>

<style scoped>

</style>
