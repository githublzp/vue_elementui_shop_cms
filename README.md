# vue3_elementui_shop
项目开发过程中遇到的一些难点和坑
```
1.登录成功后的token保存到客户端的sessionStorage中

2.路由懒加载，不同webpackChunkName下的组件会被封装到不同js文件中，当一个组件被访问,同一个webpackChunkName下的其他组件都会加载好等待访问，而其他组件此时不会加载

3.通过外部CDN的形式引入依赖项，减小项目体积

4.打包编译后table插件row-key属性不加会报错

5.表格组件可通过作用域插槽的slot-scope属性获取当前行的所有数据

6.通过tab按钮切换时，对于有相同结构的dia弹框，可考虑使用使用计算属性的方式动态渲染值，从而共用一套代码，达到代码复用的目的

7.elementUI没有直接提供滚动条插件，通过查看elementUI框架源码发现了el-scrollbar插件，用来代替浏览器默认滚动条

8.elementUI级联选择器组件 显示条bug 通过给el-cascader-menu__list类添加固定高可解决

9.通过在vue全局自定义时间过滤器来解决时间格式化问题

10.使用elementUI的上传组件时，需要设置headers绑定token，才能正常上传图片

11.通过深度监听el-tabs组件中的内容变化，然后将el-steps组件完成后显示图标名动态绑定，就可以实现通过el-tabs组件中的内容变化来动态改变el-steps的完成图标，可用于表单必填项

12.quill-editor富文本编辑器默认高度时随输入内容变化的，不会出现滚动条，防止内容撑开，可将高度设定成固定值

13.在vue.config.js配置文件中配置插件方式后，在主页面调用htmlWebpackPlugin对象的options属性获取标志值，就可根据不同开发模式决定是否加载外部的CDN资源

14.项目打包上线时，通过transform-remove-console插件移除开发模式下的console语句

15.vue组件化开发 style部分 添加scoped属性 来防止类名冲突问题
```
