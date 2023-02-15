<template>
    <div>
        <span v-if="widget === 'Input' || widget === 'Textarea'" ><a-tooltip placement="top"><template slot="title"><span>{{ value }}</span></template><span>{{ value }}</span></a-tooltip></span>
        <span v-else-if="widget === 'Encrypt'" ><span>{{ value ? '******' : '' }}</span></span>
        <span v-else-if="widget === 'InputNumber'" ><a-tooltip placement="top"><template slot="title"><span>{{ value }}</span></template><span>{{ value ? value : 0 }}</span></a-tooltip></span>
        <span v-else-if="widget === 'InputArray'" ><a-tag v-for="item of value" :key="item">{{ item }}</a-tag></span>
        <span v-else-if="widget === 'Switch'" size="small" ><a-switch :checked="value || false" disabled/></span>
        <template v-else-if="widget === 'DatePicker'">
            <span v-if="!widgetConfig.hasOwnProperty('mode')||widgetConfig.mode === 'date'" >{{ value ? $clap.moment(value).format('YYYY-MM-DD') : '' }}</span>
            <span v-else-if="widgetConfig.mode === 'month'" >{{ $clap.moment(value).format('YYYY-MM') }}</span>
            <span v-else-if="widgetConfig.mode === 'range'" >{{value[0] && value[1] ? $clap.moment(value[0]).format('YYYY-MM') - $clap.moment(value[1]).format('YYYY-MM') : '' }}</span>
            <span v-else-if="widgetConfig.mode === 'week'" >{{ value }}</span>
            <span v-else-if="widgetConfig.mode === 'time'" >{{ $clap.moment(value).format('h:mm:ss a') }}</span>
        </template>
        <span v-else-if="widget === 'Radio'"  :style="{ color: range[0]&&range[0].color?range[0].color:'#000' }">{{range[0]&&range[0].name }}</span>
        <span v-else-if="widget === 'Checkbox'" ><span v-for="(tag,index) of range" :key="index" :style="{ color: tag.color?tag.color:'#000' }">{{ tag.name }}</span></span>
        <template v-else-if="widget === 'Select'">
            <span v-if="!widgetConfig.hasOwnProperty('multiple')||!widgetConfig.multiple"  :style="{ color: range[0]&&range[0].color?range[0].color:'#000' }"><a-space><a-icon v-if="range[0]?.icon" :type="range[0]?.icon"/>{{range[0]?.name}}</a-space></span>
            <span v-else><span v-for="(tag,index) of range" :key="index" :style="{ color: tag.color?tag.color:'#000' }"><a-space><a-icon v-if="tag.icon" :type="tag.icon"/>{{tag.name}}</a-space></span></span>
        </template>
        <span v-else-if="widget === 'Form'" ><a-tooltip placement="top"><template slot="title"><span>{{ value }}</span></template><span>{{ value }}</span></a-tooltip></span>
        <span v-else-if="widget === 'ColorPicker'" ><a-tag :color="value">{{ value }}</a-tag></span>
        <span v-else-if="widget === 'IconPicker'" ><c-icon :type="value"></c-icon></span>
        <span v-else-if="widget === 'SingleUpload'" ><a @click.stop="$core.file.fileViewer(value)" v-if="value">预览</a><span v-else>暂无</span></span>
        <span v-else-if="widget === 'MultiUpload'" ><a @click.stop="$core.file.filesViewer(value)" v-if="value.length > 0">预览</a><span v-else>暂无</span></span>
        <c-editor v-else-if="widget === 'RichTextEditor'" :value="value" disabled modal></c-editor>
    </div>
</template>

<script>
export default {
    name: "CWidgetDisplay",
    props:{
        value: {
            type: [String,Number,Array,Boolean,Object]
        },
        widget: {
            type: String,
            default:'String'
        },
        widgetConfig:{
            type: Object,
            default:()=>{
                return {
                    size:'default',
                    placeholder:''
                }
            }
        }
    },
    computed:{
        range(){
            if(['Radio','Checkbox','Select'].includes(this.widget)){
                if(!this.widgetConfig.hasOwnProperty('multiple')||!this.widgetConfig.multiple){
                    if(this.widgetConfig.range){
                        if(this.widgetConfig.range[0]&&this.widgetConfig.range[0].hasOwnProperty('code')){
                            return this.widgetConfig.range.filter(item=>item.code===this.value)
                        }else{
                            return this.widgetConfig.range.filter(item=>item===this.value).map(item=>{return {color:undefined,name:item}})
                        }
                    }
                }else {
                    if(this.widgetConfig.range){
                        if(this.widgetConfig.range[0]&&this.widgetConfig.range[0].hasOwnProperty('code')){
                            return this.widgetConfig.range.filter(item=>this.value.includes(item.code))
                        }else{
                            return this.widgetConfig.range.filter(item=>this.value.includes(item)).map(item=>{return {color:undefined,name:item}})
                        }
                    }
                }
            }
            return []
        }
    },
    methods:{

    }
}
</script>

<style scoped>

</style>