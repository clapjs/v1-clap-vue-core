import Vue from 'vue'
import {updateTheme} from "./app/theme";
import i18n from '../../i18n'
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
const app = {
    state: {
        layout:'left',
        menu: {},
        theme: '',
        multiTab: true,
        lang: 'zh-CN'
    },
    mutations: {
        TOGGLE_LAYOUT: (state, layout) => {
            Vue.ls.set('LAYOUT', layout)
            state.layout = layout
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
        ToggleLayout({ commit }, layout) {
            commit('TOGGLE_LAYOUT', layout)
        },
        ToggleMenu({commit,state,dispatch}, menu) {
            if(!menu){
                return;
            }
            commit('TOGGLE_MENU', menu);
            document.title = menu.title
            Vue.prototype.$clap.router.push({name: menu.routeName, ...menu.query?{query:menu.query}:{}});
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
