<template>
    <a-menu :mode="mode" :inlineCollapsed="collapsed" :theme="theme" @click="click" :selectedKeys="selectedKeys" :openKeys.sync="currentOpenKeys">
        <template v-for="item in menus">
            <a-menu-item v-if="!item.children" :key="item.key" :style="item.style?item.style:{}">
                <a-icon :type="item.icon" v-if="item.icon&&!iconPark"/>
                <a-icon type="folder" v-else-if="!item.icon&&!iconPark"/>
                <c-icon :type="item.icon" v-if="item.icon&&iconPark" class="anticon"/>
                <c-icon type="folder-close" v-else-if="!item.icon&&iconPark" class="anticon"/>
                <span>{{item.title}}</span>
            </a-menu-item>
            <c-sub-menu v-else :menu-info="item" :key="item.key" :iconPark="iconPark"/>
        </template>
    </a-menu>
</template>

<script>
    import CSubMenu from './CSubMenu'

    export default {
        name: "CMenu",
        components: {CSubMenu},
        props: {
            mode: {
                type: String,
                required: false,
                default: 'inline'
            },
            theme: {
                type: String,
                required: false,
                default: 'dark'
            },
            collapsible: {
                type: Boolean,
                required: false,
                default: false
            },
            collapsed: {
                type: Boolean,
                required: false,
                default: false
            },
            menus: {
                type: Array,
                required: true
            },
            selectedKeys: {
                type: [String, Array],
                required: false,
                default(){
                    return []
                }
            },
            openKeys: {
                type: [String, Array],
                required: false
            },
            iconPark:{
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                currentOpenKeys:[],
            }
        },
        watch:{
            openKeys(value){
                this.currentOpenKeys=value;
            },
            currentOpenKeys(value){
                this.$emit('update:openKeys',value);
            }
        },
        methods:{
            click(obj){
                this.$emit('menuSelect',obj)
            }
        }
    }
</script>

<style scoped>

</style>
