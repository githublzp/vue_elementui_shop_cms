import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 将Message组件挂载到vue原型对象上，这样在每个vue实例中都可以通过this来使用Message组件
Vue.prototype.$message = Message
