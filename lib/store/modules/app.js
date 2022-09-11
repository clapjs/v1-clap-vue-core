import Vue from 'vue'
import {updateTheme} from "./app/theme";
import router from '../../router'
import i18n from '../../i18n'
import CLayout from "../../../components/CLayout";
const loadedLanguages = ['zh-CN'];
const loadLanguageAsync= (i18n,lang = 'zh-CN') =>{
    const setI18nLanguage= (lang) =>{
        i18n.locale = lang
        document.querySelector('html').setAttribute('lang', lang)
        return lang
    };
    return new Promise(resolve => {
        if (i18n.locale !== lang) {
            if (!loadedLanguages.includes(lang)) {
                import(`@/lib/i18n/lang/${lang}`).then(msg => {
                    const locale = msg.default
                    i18n.setLocaleMessage(lang, locale)
                    loadedLanguages.push(lang)
                })
            }
            return resolve(setI18nLanguage(lang))
        }
        return resolve(lang)
    })
}
const loadRouterAsync=async (Router,application)=>{
    if(!Router||!application){
        return;
    }
    const routes=(await Vue.prototype.$clap.http.get('/clap/authority/menu',{params:{application}})).data.records;
    const isFileExist=(path)=>{
        let exist=false;
        try {
            require.resolve(path);
            exist=true;
        }
        catch (e){
            exist=false;
        }
        return exist
    }
    const ifNotExist=(name)=>{
        return Router.getRoutes().filter(item=>item.name===name).length<1;
    }
    ifNotExist('index')&& Router.addRoute({name: 'index', path: '/', component: CLayout, redirect : () => {return 'dash'}});
    const path=isFileExist("@/views/dash")?'@/views/dash':'@clapjs/vue-core/views/dash';
    ifNotExist('dash') && Router.addRoute('index',{name: 'dash', path: '/dash', component: () => import(path)});
    for (let route of routes) {
        if (route.routePath) {
            let meta = route.meta ? JSON.parse(route.meta) : {};
            const RouterConfig={name: route.routeName, path: route.routePath, component: () => import('@/'+route.resolvePath), meta}
            switch (route.location) {
                case 'Layout':
                    ifNotExist(route.routeName)&& Router.addRoute('index',RouterConfig);
                    break;
                case'Root':
                    ifNotExist(route.routeName)&& Router.addRoute(RouterConfig);
                    break;
                default:
                    break;
            }
        }
    }
    ifNotExist('other')&&Router.addRoute({name:'other',path: '*', redirect: '/404'});
}

const app = {
    state: {
        applications:[],
        application:undefined,
        menu: {},
        layout:'',
        theme: '',
        multiTab: true,
        lang: 'zh-CN'
    },
    mutations: {
        TOGGLE_LAYOUT: (state, layout) => {
            Vue.ls.set('LAYOUT', layout);
            state.layout = layout;
        },
        TOGGLE_APPLICATIONS: (state, applications) => {
            Vue.ls.set('APPLICATIONS', applications);
            state.applications = applications
        },
        TOGGLE_APPLICATION: (state, application) => {
            Vue.ls.set('APPLICATION', application);
            state.application = application
        },
        TOGGLE_MENU: (state, menu) => {
            Vue.ls.set('MENU', menu);
            state.menu = menu
        },
        TOGGLE_LANG: (state, color) => {
            Vue.ls.set('LANG', color);
            state.lang = color;
        },
        TOGGLE_THEME: (state, theme) => {
            Vue.ls.set('THEME', theme);
            state.theme = theme;
        },
        TOGGLE_MULTI_TAB: (state, bool) => {
            Vue.ls.set('MULTI_TAB', bool);
            state.multiTab = bool
        }
    },
    actions: {
        ToggleLayout({commit}, layout) {
            commit('TOGGLE_LAYOUT', layout)
        },
        ToggleApplications({commit}, applications) {
            commit('TOGGLE_APPLICATIONS', applications)
        },
        ToggleApplication({commit}, application) {
            return new Promise((resolve, reject) => {
                commit('TOGGLE_APPLICATION', application);
                loadRouterAsync(router,application).then(() => {
                    resolve()
                }).catch((e) => {
                    reject(e)
                })
            })
        },
        ToggleMenu({commit,state,dispatch}, menu) {
            if(!menu){
                return;
            }
            if(menu.idApplication&&state.menu.idApplication!==menu.idApplication){
                dispatch('ToggleApplication',menu.idApplication)
            }
            commit('TOGGLE_MENU', menu);
            document.title = menu.title;
            router.push({name: menu.routeName, ...menu.query?{query:menu.query}:{}});
        },
        ToggleTheme({commit}, theme) {
            commit('TOGGLE_THEME', theme);
            updateTheme(theme);
        },
        ToggleMultiTab({commit}, bool) {
            commit('TOGGLE_MULTI_TAB', bool)
        },
        ToggleLang({commit}, lang) {
            return new Promise((resolve, reject) => {
                commit('TOGGLE_LANG', lang)
                loadLanguageAsync(i18n,lang).then(() => {
                    resolve()
                }).catch((e) => {
                    reject(e)
                })
            })
        },
    }
};

export default app
