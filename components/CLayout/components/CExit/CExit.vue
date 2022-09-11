<template>
    <a-tooltip placement="bottom" title="退出系统" v-if="IS_ELECTRON">
        <a-icon type="close" @click="quit"/>
    </a-tooltip>
</template>

<script>
    export default {
        name: "exit",
        computed: {
            IS_ELECTRON() {
                return process.env.IS_ELECTRON
            }
        },
        methods:{
            quit(){
                if(!this.$electron) return;
                this.$electron.ipcRenderer.invoke("quit");
            }
        }
    }
</script>

<style scoped>

</style>