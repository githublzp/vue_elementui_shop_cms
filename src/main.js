import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入自定义的全局样式表
import './assets/css/global.css'
// 导入阿里矢量库字体图标样式表
import './assets/fonts/iconfont.css'
// 设置发送网络请求的根路径
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
