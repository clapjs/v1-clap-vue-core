import antdEnUS from 'ant-design-vue/es/locale-provider/en_US'

const components = {
  antLocale: antdEnUS,
}

const locale = {
  'layouts.usermenu.dialog.title': 'Message',
  'layouts.usermenu.dialog.content': 'Do you really log-out.',
}

export default {
  ...components,
  ...locale
}
