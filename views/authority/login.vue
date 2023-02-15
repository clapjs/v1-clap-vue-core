<template>
    <div class="login" :style="'background-image:url('+$clap.config.host+'/assets/login.png'+')'">
        <a-row style="height: 64px;-webkit-app-region: drag"><img :src="$clap.config.host+'/assets/logo/logo.png'" height="64" style="float: left;margin:24px 0 0 24px"/></a-row>
        <c-login class="login-form" style="-webkit-app-region: no-drag" @doLogin="doLogin" @resetPwd="showResetModal=true" @register="showRegisterModal=true"></c-login>
        <c-organ :visible.sync="showOrganModal" :organ-users="organUsers" @doAction="doAction"></c-organ>
        <c-organ-create :visible.sync="showOrganCreateModal" @done="getUserOrgans(user._id)"></c-organ-create>
        <c-register :visible.sync="showRegisterModal" @doRegister="doRegister"></c-register>
        <c-reset-pwd :visible.sync="showResetModal" forget @doResetPwd="doResetPwd" ></c-reset-pwd>
        <div style="width:100%;text-align:center;font-size: 14px;bottom: 12px;position: fixed;">© 2015-{{ new Date().getFullYear() }}</div>
    </div>
</template>
<script>
import {mapActions, mapGetters} from "vuex";

import CLogin from "./components/CLogin"
import CRegister from "./components/CRegister"
import CResetPwd from "./components/CResetPwd"
import COrgan from "./components/COrgan";
import COrganCreate from "./components/COrganCreate";

import login from './mixins/login'

export default {
    components: { CLogin, CRegister,CResetPwd,COrgan,COrganCreate,},
    mixins:[login],
    methods: {
        ...mapActions(['ToggleApplications','ToggleApplication']),
        doAction(event,extra){
            switch (event){
                case 'logout':
                    this.Logout();
                    break;
                case 'organCreate':
                    this.showOrganCreateModal=true;
                    break;
                case 'organ':
                    this.SetToken(extra._id);
                    this.SetGroup(extra.idOrgan.idGroupOrgan);
                    this.$clap.http.get('/clap/authority/application').then(async res => {
                        if (res.data.records[0]) {
                            this.ToggleApplications(res.data.records.map(item => {
                                item.idApplication.title = item.idApplication.name;
                                item.idApplication.key = item.idApplication._id;
                                return item.idApplication
                            }))
                            await this.ToggleApplication(res.data.records[0].idApplication._id);
                            this.ToggleMenu({key: 'dash', title: '首页', routeName: 'dash', controlType: 'Group', idOrgan: '', organs: [], closable: false});
                        } else {
                            this.$message.info('暂无可用权限，请联系您的的管理员！')
                        }
                    })
                    break;
                default:
                    break;
            }
        },
    }
};
</script>

<style lang="less">

@import "~ant-design-vue/es/style/themes/default.less";

.login {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;

    &-form {
        position: absolute;
        right: 120px;
        top: 55%;
        transform: translateY(-60%);
        width: 450px;

        .form {
            padding: 0 20px;
        }
    }
}

.user-login-other {
    text-align: center;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
        font-size: 24px;
        color: rgba(0, 0, 0, 0.2);
        margin-left: 16px;
        vertical-align: middle;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: @primary-color;
        }
    }
}

.text {
    display: inline-block;
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
