<template>
    <a-layout id="basic-layout">
        <a-layout-sider collapsed :trigger="null" v-if="layout==='left'">
            <img src="../../assets/logo_mini.png" height="64" width="80"/>
            <c-menu theme="dark" mode="inline" :menus="applications" inlineCollapsed @menuSelect="({key})=>applicationSelect(key)" :selectedKeys="[application]" :openKeys="[application]" icon-park></c-menu>
        </a-layout-sider>
        <a-layout-header style="background: #fff; padding: 0;" v-else>
            <a-page-header :title="app.name" :sub-title="app.description" @backIcon="false" style="float: left"/>
            <c-menu style="float: right" theme="light" mode="horizontal" :menus="applications" @menuSelect="({key})=>applicationSelect(key)" :selectedKeys="[application]" :openKeys="[application]" icon-park></c-menu>
        </a-layout-header>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0;" v-if="layout==='left'">
                <a-page-header :title="app.name" :sub-title="app.description" @backIcon="false" style="float: left"/>
                <div style="float: right;height: 100%;margin-right: 24px;">
                    <c-user></c-user>
                    <c-language style="margin-left: 12px"></c-language>
                    <c-theme style="margin-left: 12px"></c-theme>
                    <c-minimize style="margin-left: 12px"></c-minimize>
                    <c-exit style="margin-left: 12px"></c-exit>
                </div>
            </a-layout-header>
            <a-layout>
                <a-layout-sider theme="light" v-model="collapsed" collapsible>
                    <c-menu theme="light" mode="inline" :menus="menus" :inlineCollapsed="collapsed" @menuSelect="(selected)=>{selected.key!==menu.key &&menuSelect(selected)}" :selectedKeys="[menu.key]" :openKeys.sync="menu.keyPath" icon-park></c-menu>
                </a-layout-sider>
                <a-layout>
                    <a-layout-header style="background: #f3f3f3; padding: 12px;" v-if="layout==='left'">
                        <c-multi-tab v-if="multiTab"></c-multi-tab>
                    </a-layout-header>
                    <a-layout>
                        <a-layout-content :style="{ margin: '0 12px 12px 12px', background: '#fff',maxHeight:innerHeight,overflow:'auto' }">
                            <keep-alive v-if="multiTab">
                                <router-view/>
                            </keep-alive>
                            <router-view v-else/>
                        </a-layout-content>
                    </a-layout>
                </a-layout>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script>
import CMenu from "./components/CMenu"
import CMultiTab from "./components/CMultiTab";
import CUser from "./components/CUser";
import CLanguage from "./components/CLanguage";
import CTheme from "./components/CTheme";
import CMinimize from "./components/CMinimize"
import CExit from "./components/CExit"
import {mapGetters, mapActions} from 'vuex'

export default {
    name: "basic",
    components: {CMenu,CMultiTab,CUser,CLanguage,CTheme,CMinimize,CExit},
    data() {
        return {
            innerHeight: window.innerHeight - 128 + 'px',
            collapsed: false,
            app: {},
            menus: [],
        };
    },
    created() {
        window.onresize = function () {
            this.innerHeight = window.innerHeight - 128 + 'px';
        }
        this.applicationSelect(this.application)
    },
    computed: {
        ...mapGetters(["layout", "applications", 'application', "menu", "multiTab"]),
    },
    watch: {
        async application(value) {
            if (value) {
                await this.loadApplicationMenus(value);
            }
        }
    },
    methods: {
        ...mapActions(['ToggleApplication', 'ToggleMenu']),
        async applicationSelect(application) {
            await this.loadApplicationMenus(application)
            await this.ToggleApplication(application);
        },
        async loadApplicationMenus(application) {
            this.app = await this.$clap.model('cdp_application').getByID(application).then(res => res.records[0]);
            const menusArray = (await this.$clap.http.get('/clap/authority/menu', {params: {application: application}})).data.records.map(item => {
                item.title = item.name;
                item.key = item._id;
                return item
            });
            this.menus = this.$clap.helper.listToTree(menusArray, 0)
        },
        async menuSelect(menu) {
          console.log(menu)
            const activeMenu = this.$clap.helper.getTreeNode(this.menus, menu.key);
            activeMenu.keyPath = menu.keyPath;
            await this.$clap.http.get('/clap/authority/button', {params: {menu: menu.key}}).then(el => {
                activeMenu.buttons = el.data.record.buttons
                activeMenu.organButtons = el.data.record.organButtons
                activeMenu.isOrganAuth = el.data.record.isOrganAuth
            });
            await this.$clap.http.get('/clap/authority/security', {params: {menu: menu.key}}).then(el => {
                activeMenu.organSecurity = el.data.record
            });
            activeMenu.organs = this.$clap.helper.listToTree((await this.$clap.http.get('/clap/authority/organ', {params: {menu: menu.key}})).data.records.map(item => {
                item.title = item.organName;
                item.key = item._id;
                item.value = item._id;
                return item
            }), 0);
            this.ToggleMenu(activeMenu);
        },
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
    padding: 0 32px;
    cursor: pointer;
    transition: color 0.3s;
}

#basic-layout .trigger:hover {
    color: #1890ff;
}
</style>


