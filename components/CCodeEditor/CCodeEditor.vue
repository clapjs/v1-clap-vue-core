<template>
    <div>
        <template v-if="modal">
            <a-button @click="visible = true" ghost>编辑</a-button>
            <a-modal title="代码编辑" :visible="visible" :width="768" @ok="visible = false" @cancel="visible = false">
                <codemirror v-model="currentValue" @keyup.native.ctrl.83="save" :options="cmOption" style="font-size: 14px;" />
            </a-modal>
        </template>
        <codemirror v-else v-model="currentValue" @keyup.native.ctrl.83="save" :options="cmOption" style="font-size: 14px;" />
    </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'

import 'codemirror/lib/codemirror.css'
// language
import 'codemirror/mode/javascript/javascript.js'
// theme css
import 'codemirror/theme/monokai.css'
// require active-line.js
import'codemirror/addon/selection/active-line.js'
// styleSelectedText
import'codemirror/addon/selection/mark-selection.js'
import'codemirror/addon/search/searchcursor.js'
// hint
import'codemirror/addon/hint/show-hint.js'
import'codemirror/addon/hint/show-hint.css'
import'codemirror/addon/hint/javascript-hint.js'
import'codemirror/addon/selection/active-line.js'
// highlightSelectionMatches
import'codemirror/addon/scroll/annotatescrollbar.js'
import'codemirror/addon/search/matchesonscrollbar.js'
import'codemirror/addon/search/searchcursor.js'
import'codemirror/addon/search/match-highlighter.js'
// keyMap
import'codemirror/mode/clike/clike.js'
import'codemirror/addon/edit/matchbrackets.js'
import'codemirror/addon/comment/comment.js'
import'codemirror/addon/dialog/dialog.js'
import'codemirror/addon/dialog/dialog.css'
import'codemirror/addon/search/searchcursor.js'
import'codemirror/addon/search/search.js'
import'codemirror/keymap/sublime.js'
// foldGutter
import'codemirror/addon/fold/foldgutter.css'
import'codemirror/addon/fold/brace-fold.js'
import'codemirror/addon/fold/comment-fold.js'
import'codemirror/addon/fold/foldcode.js'
import'codemirror/addon/fold/foldgutter.js'
import'codemirror/addon/fold/indent-fold.js'
import'codemirror/addon/fold/markdown-fold.js'
import'codemirror/addon/fold/xml-fold.js'

const jsBeautify = require('js-beautify');

export default {
    name: 'CCodeEditor',
    components: {
        codemirror
    },
    props: {
        value: {
            type: String,
            default: () => {
                return ''
            }
        },
        modal: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            visible: false,
            currentValue: '',
            cmOption: {
                tabSize: 4,
                styleActiveLine: false,
                lineNumbers: true,
                styleSelectedText: false,
                line: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
                mode: 'text/javascript',
                // hint.js options
                hintOptions:{
                    // 当匹配只有一项的时候是否自动补全
                    completeSingle: false
                },
                //快捷键 可提供三种模式 sublime、emacs、vim
                keyMap: "sublime",
                matchBrackets: true,
                showCursorWhenSelecting: true,
                theme: "monokai",
                extraKeys: { "Ctrl": "autocomplete" }
            }
        }
    },
    watch: {
        value(value) {
            this.setCurrentValue(value);
        }
    },
    mounted() {
        this.setCurrentValue(this.value)
        this.$nextTick(()=>{
            this.cmOption.styleSelectedText = true;
            this.cmOption.styleActiveLine = true
        })
    },
    methods: {
        setCurrentValue(value){
             this.currentValue=jsBeautify.js(value)
        },
        save() {
            this.$emit('input', this.currentValue)
            this.$emit('change', this.currentValue)
        }
    }
}
</script>

<style></style>
