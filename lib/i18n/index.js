import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zhCN from '@/lib/i18n/lang/zh-CN'

export const defaultLang = 'zh-CN'

Vue.use(VueI18n)

const i18n = new VueI18n({silentTranslationWarn: true, locale: defaultLang, fallbackLocale: defaultLang, messages:{'zh-CN': {...zhCN}}})

export default i18n
