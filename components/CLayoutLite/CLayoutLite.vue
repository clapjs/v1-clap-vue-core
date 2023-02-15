<template>
    <a-layout id="basic-layout">
        <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
            <img :src="$clap.config.host+'/assets/logo/logo_white.png'" height="64" width="200" v-if="!collapsed"/>
            <img :src="$clap.config.host+'/assets/logo/logo_mini.png'" height="64" width="80" v-else/>
            <c-menu mode="inline" :menus="$clap.config.menu" :inlineCollapsed="collapsed" @menuSelect="menuSelect" :selectedKeys="[menu.key]" :openKeys.sync="menu.keyPath" iconPark></c-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0;-webkit-app-region: drag;">
                <a-icon class="trigger" style="-webkit-app-region: no-drag" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="() => (collapsed = !collapsed)"/>
                <div style="-webkit-app-region: no-drag;float: right;height: 100%;margin-right: 24px;">
                    <c-user></c-user>
                    <c-language style="margin-left: 12px"></c-language>
                    <c-theme style="margin-left: 12px"></c-theme>
                    <c-minimize style="margin-left: 12px"></c-minimize>
                    <c-exit style="margin-left: 12px"></c-exit>
                </div>
            </a-layout-header>
            <a-layout>
                <a-layout>
                    <a-layout-header style="background: #f3f3f3; padding: 12px;" v-if="multiTab">
                        <c-multi-tab></c-multi-tab>
                    </a-layout-header>
                    <a-layout-content :style="{ margin: multiTab?'0 12px 12px 12px':'12px', background: '#fff',maxHeight:innerHeight,overflow:'auto' }">
                        <keep-alive v-if="multiTab">
                            <router-view/>
                        </keep-alive>
                        <router-view v-else/>
                    </a-layout-content>
                </a-layout>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script>
import CMenu from "../CLayout/components/CMenu"
import CMultiTab from "../CLayout/components/CMultiTab";
import CUser from "../CLayout/components/CUser";
import CLanguage from "../CLayout/components/CLanguage";
import CTheme from "../CLayout/components/CTheme";
import CMinimize from "../CLayout/components/CMinimize"
import CExit from "../CLayout/components/CExit"
import {mapGetters, mapActions} from 'vuex'

export default {
    name: "CLayoutLite",
    components: {CMenu,CMultiTab,CUser,CLanguage,CTheme,CMinimize,CExit},
    data() {
        return {
            innerHeight:window.innerHeight - 120 +'px',
            collapsed: true,
        };
    },
    computed: {
        ...mapGetters(["menu","user",'theme','multiTab']),
    },
    async created() {
        window.onresize = ()=>{
            this.innerHeight =  window.innerHeight - 120 +'px';
        }
    },
    methods: {
        ...mapActions(['ToggleMenu']),
        async menuSelect(menu) {
            const activeMenu = this.$clap.helper.getTreeNode(this.$clap.config.menu, menu.key);
            activeMenu.keyPath = menu.keyPath;
            this.ToggleMenu(activeMenu);
        }
    }
}
</script>

<style scoped lang="less">
#basic-layout {
    height: 100%;
}

#basic-layout .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#basic-layout .trigger:hover {
    color: #1890ff;
}
</style>