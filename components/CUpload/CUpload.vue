<template>
    <div>
        <template v-if="mode==='Button'">
            <a-upload :multiple="multiple" :file-list="fileList" :action="$clap?.file.URL_UPLOAD" @change="change" :disabled="disabled">
                <a-button icon="file" v-if="disabled">查看文件</a-button>
                <a-button icon="upload" v-else>点击上传</a-button>
            </a-upload>
        </template>
        <template v-if="mode==='Dragger'">
            <a-button icon="file" v-if="disabled">查看文件</a-button>
            <a-button icon="upload" v-else @click="visible=true">点击上传</a-button>
            <a-modal title="拖拽上传" :visible="visible" forceRender :width="768" @ok="visible = false" @cancel="visible = false">
                <a-upload-dragger name="file" :multiple="multiple" :action="$clap?.file.URL_UPLOAD" :file-list="fileList" @change="change" :disabled="disabled">
                    <p class="ant-upload-drag-icon">
                        <a-icon type="inbox"/>
                    </p>
                    <p class="ant-upload-text">单击或拖动文件到此区域以上传</p>
                </a-upload-dragger>
            </a-modal>
        </template>
    </div>
</template>

<script>
export default {
    name: "CUpload",
    props: {
        value: {
            type: [Array, String],
            default() {
                return []
            }
        },
        mode: {
            type: String,
            default: () => {
                return 'Button'
            }
        },
        multiple: {
            type: Boolean,
            default: () => {
                return false
            }
        },
        disabled: {
            type: Boolean,
            default: () => {
                return false
            }
        },
    },
    data() {
        return {
            currentValue: [],
            fileList: [],
            visible: false
        }
    },
    watch: {
        value(val) {
            this.setCurrentValue(val)
        }
    },
    async created() {
        await this.setCurrentValue(this.value)
    },
    methods: {
        async setCurrentValue(val) {
            if(val.length===0){
                return;
            }
            const files = await this.$clap.model('sys_file').get({params: {filter: {_id: {$in: this.multiple ? this.value : [this.value]}}}}).then(res => res.records)
            this.fileList = files.map(item => {
                return {
                    uid : item._id,
                    name: item.fileName,
                    status: 'done',
                    url: this.$clap.file.URL_PREVIEW + item._id
                }
            });
        },
        change(info) {
            switch (info.file.status) {
                case 'removed':
                    if (this.multiple) {
                        const index = this.fileList.findIndex(item => {
                            return item === info.file.uid
                        })
                        this.fileList.splice(index, 1)
                    } else {
                        this.fileList = []
                    }
                    this.handleInput();
                    break;
                case 'error':
                    this.$message.error(`${info.file.name} 文件上传失败！`)
                    break;
                case 'done':
                    const fileList = info.file.response.records.map(item => {
                        return {
                            uid : item._id,
                            name: item.fileName,
                            status: 'done',
                            url: this.$clap.file.URL_PREVIEW + item._id
                        }
                    });
                    this.fileList=this.multiple?[...this.fileList,...fileList]:fileList
                    this.handleInput();
                    this.$message.success(`${info.file.name} 文件上传成功！`)
                    break;
                default:
                    break;
            }
        },
        handleInput() {
            const value = this.multiple?this.fileList.map(item=>item.uid):this.fileList[0].uid;
            this.$emit('change', value)
            this.$emit('input', value)
        }
    }
}
</script>

<style scoped>

</style>