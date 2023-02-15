import {mapActions, mapGetters} from "vuex";
export default {
    data() {
        return {
            showOrganModal: false,
            showOrganCreateModal: false,
            showRegisterModal: false,
            showResetModal: false,
            organUsers: [],
        };
    },
    created() {
        document.title = '系统登录';
        if (this.user) {
            this.getUserOrgans(this.user);
            this.showOrganModal = true;
        } else {
            this.$ls.remove('MENU');
        }
    },
    computed: {
        ...mapGetters(['user']),
    },
    methods: {
        ...mapActions(['Logout', 'SetUser','SetRole', 'SetToken', 'SetGroup', 'SetOrgan', 'ToggleMenu']),
        async getUserOrgans(idUser) {
            this.organUsers = await this.$clap.model('org_organ_user').get({
                params: {
                    filter: {idUser},
                    populate: 'idOrgan',
                    order: 'idOrgan'
                }
            }).then(res => {
                return res.records
            });
        },
        async doLogin(user) {
            user.userCode = user.userCode.trim();
            user.userPwd = user.userPwd.trim();
            const result = await this.$clap.http.post(this.$clap.config.url.login, user);
            if (result.data.error.code === '0') {
                this.SetUser(result.data.record);
                await this.getUserOrgans(result.data.record._id);
                this.showOrganModal = true
            }
        },
        async doRegister(user) {
            const result = await this.$clap.http.post(this.$clap.config.url.register, user);
            if (result.data.error.code === '0') {
                this.$confirm({
                    title: '确认',
                    content: '恭喜,注册成功!是否立即登录？',
                    centered: true,
                    onOk: async () => {
                        this.SetUser(result.data.record);
                        await this.getUserOrgans(result.data.record._id);
                        this.showRegisterModal = false;
                        this.showOrganModal = true
                    }
                });
            }
        },
        async doResetPwd(user) {
            const result = await this.$clap.http.post(this.$clap.config.url.changePwd, user);
            if (result.data.error.code === '0') {
                this.$success({
                    title: '密码修改成功,请重新登录!', onOk: () => {
                        this.showResetModal = false;
                    }
                });
            }
        },
    }
};