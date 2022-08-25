import antd from 'ant-design-vue/es/locale-provider/zh_CN'

const components = {
  antLocale: antd,
}

const locale = {
  'layouts.usermenu.dialog.title': '消息',
  'layouts.usermenu.dialog.content': '确定退出登录吗？',
}

export default {
  ...components,
  ...locale
}
