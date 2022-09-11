<template>
    <a-tooltip placement="bottom" title="最小化" v-if="IS_ELECTRON">
        <a-icon type="minus" @click="minus"/>
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
            minus(){
                if(!this.$electron) return;
                this.$electron.ipcRenderer.invoke("minimize");
            }
        }
    }
</script>

<style scoped>

</style>