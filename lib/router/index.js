import Vue from 'vue'
import Router from 'vue-router'

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
    return originalPush.call(this, location).catch(err => err)
};

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/login')
        },
        {
            path: '/404',
            name: '404',
            component: {
                template: `<a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在。"><template #extra><a-button type="primary" @click="handleToHome">返回首页</a-button></template></a-result>`,
                methods: {
                    handleToHome () {
                        this.$router.push({ name: 'dash' })
                    }
                }
            }
        },
    ]
});

export default router
