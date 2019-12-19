import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入自定义的全局样式表
import './assets/css/global.css'
// 导入阿里矢量库字体图标样式表
import './assets/fonts/iconfont.css'
// 导入treetable插件
import TreeTable from 'vue-table-with-tree-grid'
import axios from 'axios'

// 设置发送网络请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截
//   通过axios请求拦截器添加token，保证请求拥有获取数据的权限
axios.interceptors.request.use(config => {
  // 为请求头对象添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 将axios挂载到vue原型对象的$http属性上，全局可用
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 注册为全局组件，全局范围内可用
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
