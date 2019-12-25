// 这是项目发布阶段需要用到的babel插件
const prodPlugins = []
if (process.env.NODE_ENv === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  'presets': [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins': [
    [
      'component',
      {
        'libraryName': 'element-ui',
        'styleLibraryName': 'theme-chalk'
      }
    ],
    // 发布产品时候要用的插件
    ...prodPlugins,
    // 使用组件懒加载时候需要的组件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
