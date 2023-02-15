import app from './modules/app'
import user from './modules/user'

const getters={
    layout: state => state.app.layout,
    menu: state => state.app.menu,
    theme: state => state.app.theme,
    multiTab: state => state.app.multiTab,
    lang: state => state.app.lang,

    user: state => state.user.user,
    role: state => state.user.role,
    token: state => state.user.token,
    group: state => state.user.group,
    organ: state => state.user.organ,
}

export {app,user,getters}
