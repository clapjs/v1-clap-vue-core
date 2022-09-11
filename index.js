import { IconPark } from '@icon-park/vue/es/all'
import {
    ConfigProvider,
    Layout,
    Input,
    InputNumber,
    Button,
    Switch,
    Radio,
    Checkbox,
    Select,
    Card,
    Form,
    FormModel,
    Row,
    Col,
    Modal,
    Table,
    Tabs,
    Icon,
    Badge,
    Popover,
    Dropdown,
    List,
    Avatar,
    Breadcrumb,
    Steps,
    Spin,
    Menu,
    Drawer,
    Tooltip,
    Alert,
    Tag,
    Divider,
    DatePicker,
    TimePicker,
    Upload,
    Progress,
    Skeleton,
    Popconfirm,
    Cascader,
    TreeSelect,
    Tree,
    Space,
    message,
    notification,
    Pagination,
    Collapse,
    Empty,
    Descriptions,
    Comment,
    Timeline,
    Calendar,
    PageHeader,
    Result,

} from 'ant-design-vue'

import VueLs from 'vue-ls';
import VueCookies from 'vue-cookies'
import moment from 'moment'
import clap from './lib/clap'
import clap_file from "./lib/clap_file";
import clap_helper from "./lib/clap_helper";

const components = []

const install = function (Vue, options) {
    options.platform=options.platform?options.platform:'web'
    if (install.installed) return
    install.installed = true;
    Vue.use(ConfigProvider);
    Vue.use(Layout);
    Vue.use(Input);
    Vue.use(InputNumber);
    Vue.use(Button);
    Vue.use(Switch);
    Vue.use(Radio);
    Vue.use(Checkbox);
    Vue.use(Select);
    Vue.use(Card);
    Vue.use(Form);
    Vue.use(FormModel);
    Vue.use(Row);
    Vue.use(Col);
    Vue.use(Modal);
    Vue.use(Table);
    Vue.use(Tabs);
    Vue.use(Icon);
    Vue.use(Badge);
    Vue.use(Popover);
    Vue.use(Dropdown);
    Vue.use(List);
    Vue.use(Avatar);
    Vue.use(Breadcrumb);
    Vue.use(Steps);
    Vue.use(Spin);
    Vue.use(Menu);
    Vue.use(Drawer);
    Vue.use(Tooltip);
    Vue.use(Alert);
    Vue.use(Tag);
    Vue.use(Divider);
    Vue.use(DatePicker);
    Vue.use(TimePicker);
    Vue.use(Upload);
    Vue.use(Progress);
    Vue.use(Skeleton);
    Vue.use(Popconfirm);
    Vue.use(Cascader);
    Vue.use(TreeSelect);
    Vue.use(Space);
    Vue.use(Tree);
    Vue.use(Pagination);
    Vue.use(Collapse);
    Vue.use(Empty);
    Vue.use(Descriptions);
    Vue.use(Comment);
    Vue.use(Timeline);
    Vue.use(Calendar);
    Vue.use(PageHeader);
    Vue.use(Result);
    Vue.prototype.$message = message;
    Vue.prototype.$confirm = Modal.confirm;
    Vue.prototype.$info = Modal.info;
    Vue.prototype.$success = Modal.success;
    Vue.prototype.$error = Modal.error;
    Vue.prototype.$warning = Modal.warning;
    Vue.prototype.$notification = notification;

    Vue.prototype.$global = {platform:options.platform};
    Vue.use(VueLs, {namespace: 'CLEAR_', name: 'ls', storage: 'local'});
    if(options.platform==='web'){Vue.use(VueCookies)}
    if(options.platform==='electron'){import('electron').then((electron)=>{ Vue.prototype.$electron = electron})}
    Vue.prototype.$clap = new clap(options.axios);
    Vue.prototype.$clap.http=options.axios;
    Vue.prototype.$clap.moment=moment;
    Vue.prototype.$clap.file=new clap_file(options.axios);
    Vue.prototype.$clap.helper=clap_helper;
    components.map(component => {
        Vue.component(component.name, component)
    })
    Vue.component('c-icon', IconPark)
}

export default {
    install,
    clap,
    clap_file,
    clap_helper,
}