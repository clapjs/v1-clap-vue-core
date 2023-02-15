<template>
    <div>
        <a-input v-if="widget === 'Input' || widget === 'ColorPicker'" :value="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)" class="fullWidth">
            <c-color-picker v-if="widget === 'ColorPicker'" :value="currentValue" :disabled="disabled" @change="(val) => handleChange(val)" slot="addonBefore" />
        </a-input>
        <c-icon-picker v-else-if="widget === 'IconPicker'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :bg-color="widgetConfig.bgColor" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)"></c-icon-picker>
        <a-input-number  v-else-if="widget === 'InputNumber'" :value="currentValue" :min="widgetConfig.min" :max="widgetConfig.max" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-select  v-else-if="widget==='InputArray'" :maxTagCount="2" mode="tags" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
            <a-select-option :value="option" v-for="option of currentValue" :key="option">{{ option }}</a-select-option>
        </a-select>
        <a-textarea  v-else-if="widget === 'Textarea'" :value="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-slider  v-else-if="widget === 'Slider'" :value="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <template v-else-if="widget === 'DatePicker'">
            <a-date-picker  v-if="!widgetConfig.hasOwnProperty('mode')||widgetConfig.mode === 'date'" format="YYYY-MM-DD HH:mm " :showTime="{ format: 'HH:mm' }" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
            <a-month-picker  v-else-if="widgetConfig.mode === 'month'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
            <a-range-picker  v-else-if="widgetConfig.mode === 'range'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
            <a-week-picker  v-else-if="widgetConfig.mode === 'week'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
            <a-time-picker  v-else-if="widgetConfig.mode === 'time'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        </template>
        <a-switch v-else-if="widget === 'Switch'" :checked="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" />
        <a-radio-group v-else-if="widget === 'Radio'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)">
            <a-radio :value="option.hasOwnProperty('code') ? option.code : option" v-for="(option,index) of widgetConfig.range" :key="index" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-radio>
        </a-radio-group>
        <a-checkbox-group v-else-if="widget === 'Checkbox'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)">
            <a-row><a-col :span="widgetConfig.column?24/widgetConfig.column:24"><a-checkbox :value="option.hasOwnProperty('code') ? option.code : option" v-for="(option,index) of widgetConfig.range" :key="index" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-checkbox></a-col></a-row>
        </a-checkbox-group>
        <template v-else-if="widget === 'Select'">
            <template v-if="!widgetConfig.hasOwnProperty('mode')||widgetConfig.mode==='list'">
                <a-select show-search  v-if="!widgetConfig.hasOwnProperty('multiple')||!widgetConfig.multiple" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
                    <a-select-option :value="option.hasOwnProperty('code') ? option.code : option" v-for="(option,index) of widgetConfig.range" :key="index" :disabled="option.hasOwnProperty('disabled')?option.disabled:false"><a-space><a-icon v-if="option.hasOwnProperty('icon')" :type="option.icon"/>{{ option.hasOwnProperty('name') ? option.name : option }}</a-space></a-select-option>
                </a-select>
                <a-select show-search v-else-if="widgetConfig.multiple" :maxTagCount="2" mode="multiple" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
                    <a-select-option :value="option.hasOwnProperty('code') ? option.code : option" v-for="(option,index) of widgetConfig.range" :key="index" :disabled="option.hasOwnProperty('disabled')?option.disabled:false"><a-space><a-icon v-if="option.hasOwnProperty('icon')" :type="option.icon"/>{{ option.hasOwnProperty('name') ? option.name : option }}</a-space></a-select-option>
                </a-select>
            </template>
            <a-tree-select v-else-if="widgetConfig.mode==='tree'" :multiple="widgetConfig.multiple"  :value="currentValue" :disabled="disabled" :treeData="widgetConfig.treeData" :replaceFields="widgetConfig.replaceFields?widgetConfig.replaceFields:{value:'_id'}" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="(val,label,extra) => handleChange(val,{label,extra})" @focus="e => handleFocus(e)" treeDefaultExpandAll treeNodeFilterProp="title" :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }" class="fullWidth" />
        </template>
        <c-refer v-else-if="widget === 'SelectRefer'" :value="currentValue" :disabled="disabled" :multiple="widgetConfig.multiple" :refer="widgetConfig.refer" :dataTextFields="widgetConfig.dataTextFields" :filter="widgetConfig.filter" :filterData="widgetConfig.filterData" :pkg="widgetConfig.pkg" @change="(val,extra) => handleChange(val,extra)" @focus="e => handleFocus(e)"></c-refer>
        <c-upload v-else-if="widget === 'Upload'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)"></c-upload>
        <c-editor v-else-if="widget === 'Editor'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :modal="widgetConfig.modal" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth"></c-editor>
        <c-filter-editor v-else-if="widget === 'FilterEditor'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :mode="widgetConfig.mode" :fields="widgetConfig.fields" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth"></c-filter-editor>
        <c-code-editor   v-else-if="widget === 'CodeEditor'" :value="currentValue" :placeholder="widgetConfig.placeholder" :modal="widgetConfig.modal" :disabled="disabled"   @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <c-form v-else-if="widget === 'Form'" :value="currentValue" :disabled="disabled" :columns="widgetConfig.columns" :compact="widgetConfig.compact" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)"></c-form>
        <c-table v-else-if="widget === 'Table'"  :value="currentValue" :disabled="disabled"  :buttons="widgetConfig.buttons" :buttons-disabled="widgetConfig.buttonsDisabled" :edit-buttons-disabled="widgetConfig.editButtonsDisabled" :placeholder="widgetConfig.placeholder" @change="(val) => handleChange(val)" @focus="e => handleFocus(e)" editable :mode="widgetConfig.mode?widgetConfig.mode:'Table'" :scroll="widgetConfig.scroll" :columns="widgetConfig.columns" class="fullWidth" :before-add="widgetConfig.before?widgetConfig.before['add']:false" :before-copy="widgetConfig.before?widgetConfig.before['copy']:false" :before-remove="widgetConfig.before?widgetConfig.before['remove']:false" @add="widgetConfig.on?widgetConfig.on['add']:()=>{}" @copy="widgetConfig.on?widgetConfig.on['copy']:()=>{}" @remove="widgetConfig.on?widgetConfig.on['remove']:()=>{}"></c-table>
        <component v-else :is="widget" :value="currentValue" :disabled="disabled" :widget-config="widgetConfig" :mode="widgetConfig.mode" @change="(val,extra) => handleChange(val,extra)" @focus="e => handleFocus(e)"></component>
    </div>
</template>

<script>
import CTable from "../CTable/CTable";
export default {
    name: "CWidget",
    components: {CTable},
    props:{
        value: {
            type: [String,Number,Array,Boolean,Object]
        },
        disabled:{
            type:Boolean,
            default:false
        },
        widget: {
            type: String,
            default:'Input'
        },
        widgetConfig:{
            type: Object,
            default:()=>{
                return {
                    size:'default',
                    placeholder:'',
                }
            }
        },
    },
    created() {
        this.setCurrentValue(this.value)
    },
    data(){
        return {
            currentValue:''
        }
    },
    watch: {
        value: {
            async handler(val) {
                this.setCurrentValue(val)
            },
            deep: true
        }
    },
    methods:{
        setCurrentValue(value){
            this.currentValue=value;
        },
        handleChange(value,extra){
            this.$emit('input',value);
            this.$emit('change',value,extra)
        },
        async handleFocus(e){
            if (this.widgetConfig.beforeChange&& !(await this.widgetConfig.beforeChange())) {
                e.srcElement.blur()
            }
        }
    }
}
</script>

<style scoped>
.fullWidth {
    width: 100%;
}
</style>