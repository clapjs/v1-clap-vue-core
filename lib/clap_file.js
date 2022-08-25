import Vue from "vue";
import 'viewerjs/dist/viewer.css'
import Viewer from 'viewerjs'
import clap from "./clap";
export default class clap_file extends clap{
    constructor(axios) {
        super(axios)
    }
    get URL_DOWNLOAD(){
        return this.axios.defaults.baseURL + '/core/file/download/'
    }
    get URL_PREVIEW(){
        return this.axios.defaults.baseURL + '/core/file/preview/'
    }
    get URL_UPLOAD(){
        return this.axios.defaults.baseURL + '/core/file/upload'
    }
    async fileViewer(idFile){
        const file = await this.model('sys_file').getByID(idFile).then(res => res.records[0])
        if (file.fileType.indexOf('image/') > -1) {
            let dom = document.querySelector('#app')
            if (document.querySelector('#viewer')) {
                document.querySelector('#viewer').remove()
            }
            let div = document.createElement('div')
            div.setAttribute('id', 'viewer')
            div.innerHTML = "<img src='" + this.URL_PREVIEW + idFile + "' style='display: none'/>"
            dom.appendChild(div)
            const viewer = new Viewer(document.querySelector('#viewer'), {})
            viewer.show()
        } else {
            Modal.confirm({
                title: '提示',
                content: '暂不支持该文件类型在线预览，是否下载查看?',
                onOk: async () => {
                    window.open(this.axios.getUri({ url: this.URL_DOWNLOAD + idFile }))
                }
            })
        }
    }
    async filesViewer(idFiles){
        const files = await this.model('sys_file').get({ params: { filter: { _id: { $in: idFiles.map(item => item.idFile) } } } }).then(res => res.records)
        const constructor = Vue.extend({
            template: `<a-modal title="文件列表" v-model="visible" :maskClosable="false" destroyOnClose @ok="ok()" @cancel="visible=false"><a @click="fileViewer(file._id)" v-for="file of files" :key="file._id">{{ file.fileName }}<br></a></a-modal>`,
            data() {
                return {
                    visible: false,
                    files: []
                }
            },
            methods: {
                async ok() {
                    this.visible = false
                }
            }
        })
        const instance = new constructor({ data: { files } })
        instance.vm = instance.$mount()
        instance.vm.visible = true
        instance.vm.fileViewer = this.fileViewer
        document.getElementById('app').appendChild(instance.vm.$el) // 将dom插入body
    }
}