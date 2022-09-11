import Vue from 'vue'
import {Modal} from "ant-design-vue";
import i18n from '../../i18n'

const getSession=()=>{
    return Vue.prototype.$global.platform==='web'?{session:Vue.$cookies,expires:24 * 60 * 60}:{session:Vue.ls,expires:24 * 60 * 60 * 1000};
}

const user = {
    state: {
        user:undefined,
        token: undefined,
        group:undefined,
        organ:undefined,
    },

    mutations: {
        SET_USER: (state, user) => {
            state.user = user
        },
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_GROUP: (state, group) => {
            state.group = group
        },
        SET_ORGAN: (state, organ) => {
            state.organ = organ
        },
    },
    actions:{
        Logout(){
            Modal.confirm({
                title: i18n.t('layouts.usermenu.dialog.title'),
                content: i18n.t('layouts.usermenu.dialog.content'),
                onOk: () => {
                    const {session}=getSession();
                    session.remove('ACCESS_TOKEN')
                    session.remove('LOGIN_USER')
                    session.remove('LOGIN_GROUP')
                    session.remove('LOGIN_ORGAN')

                    Vue.ls.remove('APPLICATIONS');
                    Vue.ls.remove('APPLICATION');
                    Vue.ls.remove('MENU');
                    location.reload();
                }
            })
        },
        SetToken({commit}, token) {
            const {session,expires}=getSession();
            session.set('ACCESS_TOKEN', token,expires)
            commit('SET_TOKEN', token)
        },
        SetUser({commit}, user) {
            const {session,expires}=getSession();
            session.set('LOGIN_USER', user,expires)
            commit('SET_USER', user)
        },
        SetGroup({commit}, group) {
            const {session,expires}=getSession();
            session.set('LOGIN_GROUP', group,expires)
            commit('SET_GROUP', group)
        },
        SetOrgan({commit}, organ) {
            const {session,expires}=getSession();
            session.set('LOGIN_ORGAN', organ,expires)
            commit('SET_ORGAN', organ)
        }
    }
};

export default user
