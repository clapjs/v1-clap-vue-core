<template>
    <div>
        <template v-if="modal">
            <div v-if="editorTextNull"><a @click="visible = true" v-if="disabled">暂无</a><a @click="visible = true" v-else>编辑</a></div>
            <a-tooltip placement="top" v-else><template slot="title"><span>{{ editorText }}</span></template><span @click="visible = true">{{ editorText }}</span></a-tooltip>
            <a-modal :title="placeholder" :visible="visible" :width="768" @ok="visible = false" @cancel="visible = false">
                <div style="border: 1px solid #ccc;z-index: 10000" v-if="visible">
                    <!-- 工具栏 -->
                    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editor" :defaultConfig="toolbarConfig"/>
                    <!-- 编辑器 -->
                    <Editor style="height: 300px; overflow-y: hidden" :defaultConfig="editorConfig" v-model="currentValue" @onChange="onChange" @onCreated="onCreated"/>
                </div>
            </a-modal>
        </template>
        <div style="border: 1px solid #ccc;z-index: 10000;" v-else>
            <!-- 工具栏 -->
            <Toolbar style="border-bottom: 1px solid #ccc;" :editor="editor" :defaultConfig="toolbarConfig"/>
            <!-- 编辑器 -->
            <Editor style="height: 300px; overflow-y: hidden" :defaultConfig="editorConfig" v-model="currentValue" @onChange="onChange" @onCreated="onCreated" @customPaste="customPaste"/>
        </div>
    </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'

export default {
    name: 'CEditor',
    components: {Editor, Toolbar},
    data() {
        return {
            visible: false,
            currentValue: null,
            currentText:null,
            editor: null,
            toolbarConfig: {},
            editorConfig: {
                placeholder: this.placeholder,
                MENU_CONF:{
                    uploadImage:{
                        server: this.$clap.file.URL_UPLOAD,
                        customInsert:(res, insertFn)=> {
                            for (let record of res.records) {
                                insertFn(this.$clap.file.URL_PREVIEW + record._id,'',this.$core.url.file.preview + record._id)
                            }
                        },
                    },
                    uploadVideo:{
                        server: this.$clap.file.URL_UPLOAD,
                        customInsert:(res, insertFn)=> {
                            for (let record of res.records) {
                                insertFn(this.$clap.file.URL_PREVIEW + record._id)
                            }
                        },
                    }
                }
            },
        }
    },
    props: {
        value: {
            type: String,
        },
        placeholder: {
            type: String,
            default(){
                return '文档编辑'
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        modal: {
            type: Boolean,
            default: false
        }
    },
    created() {
        this.setCurrentValue(this.value);
    },
    computed:{
        editorText(){
            return this.value?this.value.replaceAll(/<[^>]+>/g,""):undefined
        },
        editorTextNull(){
            return this.value?this.value.replaceAll(/<[^>]+>/g,"").replaceAll(/\s*/g,"").length===0:true
        },
    },
    watch: {
        value: {
            async handler(val) {
                this.setCurrentValue(val)
            },
            deep: true //true 深度监听
        },
        disabled(disabled) {
            if(disabled){
                this.editor.disable()
            }else{
                this.editor.enable()
            }
        },
        visible(visible) {
            if(!visible){
                const editor = this.editor;
                if (editor == null) return;
                editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
            }
        }
    },
    methods: {
        setCurrentValue(val) {
            this.currentValue = val;
        },
        onCreated(editor) {
            this.editor = Object.seal(editor); // 【注意】一定要用 Object.seal() 否则会报错
            if(this.disabled){
                this.editor.disable()
            }else{
                this.editor.enable()
            }
        },
        onChange(editor) {
            const value = editor.getHtml();
            this.currentText=editor.getText();
            this.$emit('input', value)
            this.$emit('change', value)
        },
        customPaste(editor, event, callback) {
            // 返回 true ，继续默认的粘贴行为
            callback(true);
            this.onChange(editor);
        },
    },
    beforeDestroy() {
        const editor = this.editor;
        if (editor == null) return;
        editor.destroy(); // 组件销毁时，及时销毁 editor ，重要！！！
    }
}
</script>
