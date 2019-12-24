<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert title="添加商品信息" type="info" :closable="false" show-icon center></el-alert>
      <!-- 步骤条区 -->
      <el-steps
        :active="+stepActiveInd"
        align-center
        finish-status="success"
        process-status="success"
      >
        <el-step title="基本信息" :status="stepIcon"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成" :status="stepEndIcon"></el-step>
      </el-steps>
      <!-- 表单区 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-position="top">
        <!-- tabs区 -->
        <el-tabs
          tab-position="left"
          v-model="stepActiveInd"
          @tab-click="handleTabClick"
          :before-leave="beforeTabLeave"
        >
          <!-- tab1 -->
          <el-tab-pane label="基本信息" name="0" style="height: 450px;">
            <el-scrollbar style="height: 100%;">
              <div style="width: 50%;">
                <el-form-item label="商品分类" required>
                  <!-- 级联选择器 -->
                  <el-cascader
                    v-model="goodsCat"
                    :options="cateList"
                    :props="cascaderProps"
                    @change="catIdChanged"
                    placeholder="请选择三级子类目"
                  ></el-cascader>
                </el-form-item>
                <el-form-item label="商品名称" prop="goods_name">
                  <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格(元)" prop="goods_price">
                  <el-input v-model="goodsPric"></el-input>
                </el-form-item>
                <el-form-item label="商品重量(克)" prop="goods_weight">
                  <el-input v-model="goodsWeig"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                  <el-input v-model.number="addForm.goods_number"></el-input>
                </el-form-item>
              </div>
            </el-scrollbar>
          </el-tab-pane>
          <!-- tab2 -->
          <el-tab-pane label="商品参数" name="1" style="height: 450px;">
            <el-scrollbar style="height: 100%;">
              <el-form-item
                :label="item.attr_name"
                v-for="item in dynParaInfoList"
                :key="item.attr_id"
              >
                <el-checkbox-group v-model="item.attr_vals" size="medium" @change="checkboxChange">
                  <el-checkbox :label="zitem" v-for="zitem in item.attr_vals" :key="zitem" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-scrollbar>
          </el-tab-pane>
          <!-- tab3 -->
          <el-tab-pane label="商品属性" name="2" style="height: 450px;">
            <el-scrollbar style="height: 100%;">
              <el-form-item
                :label="item.attr_name"
                v-for="item in statPropInfoList"
                :key="item.attr_id"
                style="width: 50%"
              >
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-scrollbar>
          </el-tab-pane>
          <!-- tab4 -->
          <el-tab-pane label="商品图片" name="3" style="height: 450px;">
            <!-- action 图片上传到的一个完整后台API地址
                 on-preview 监听图片的预览
                 on-remove 监听图片的删除
                 on-success 监听图片上传成功
                 list-type 列表的类型
                 headers 为上传图片请求的请求头设置我们自己的token值
            -->
            <el-scrollbar style="height: 100%;">
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj"
                :on-success="handleSuccess"
                style="width: 50%;"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-scrollbar>
          </el-tab-pane>
          <!-- tab5 -->
          <el-tab-pane label="商品内容" name="4" style="height: 450px;">
            <!-- 富文本编辑器组件 -->
            <quill-editor
              v-model="addForm.goods_introduce"
              :options="editorOption"
              style="width: 80%;"
            ></quill-editor>
            <el-button type="primary" @click="add" style="margin-top: 15px;">点击添加</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="isPicPreview" width="50%">
      <img :src="previewURL" alt="大图预览" style="width: 100%;" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    // 校验小数
    const validateFloat = (rul, val, cb) => {
      // 包含小数的数字
      const reg = /^[+-]?(0|([1-9]\d*))(\.\d+)?$/g
      if (!reg.test(val)) {
        cb(new Error('请输入数字'))
      }
      cb()
    }
    return {
      // 步骤条激活的索引
      // tabs中tab的name值
      stepActiveInd: '0',
      // 表单对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 用来传输级联选择器选定的值
        goods_cat: '',
        // 商品所有参数，包含动态参数和静态属性
        attrs: [],
        // 存放图片上传的临时路径
        pics: [],
        // 商品详情介绍
        goods_introduce: ''
      },
      // 用来接收级联选择器选定的值
      goodsCat: [],
      // 商品价格的字符串值
      goodsPric: '',
      // 商品重量的字符串值
      goodsWeig: '',
      // 表单验证规则对象
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { validator: validateFloat, trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { validator: validateFloat, trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', message: '请输入整数', trigger: 'blur' }
        ]
      },
      // 级联选择器属性配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        // checkStrictly: 'true',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器数据源
      cateList: [],
      // 用来区分获取的是动态参数还是静态属性
      attr_sel: '',
      // 步骤条图标
      stepIcon: '',
      // 步骤条结束图标
      stepEndIcon: '',
      // 用来接收查询出来的动态参数列表
      dynParaInfoList: [],
      // 用来接收查询出来的静态属性列表
      statPropInfoList: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片预览URL地址
      previewURL: '',
      // 控制图片预览对话框的关闭
      isPicPreview: false,
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 富文本编辑器的配置对象
      editorOption: {
        placeholder: '请输入商品的详细信息',
        theme: 'snow'
      }
    }
  },
  created () {
    this.getCateList()
  },
  // mounted () {},
  computed: {
    // goodsCat数组的长度
    gcL () {
      return this.goodsCat.length
    },
    // 三级子类目的id
    thirdGraCatId () {
      if (this.gcL === 3) return this.goodsCat[this.gcL - 1]
      return null
    },
    // 一个会根据条件改变的name值
    nameVal () {
      let sel = this.attr_sel
      return sel === '' ? null : sel === 'many' ? '参数' : '属性'
    }
  },
  watch: {
    // 监听所有商品参数的修改变化
    dynParaInfoList (newVal) {
      newVal.forEach(item => {
        this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(',') })
      })
    },
    statPropInfoList (newVal) {
      newVal.forEach(item => {
        this.addForm.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
      })
    },
    /* ------------------------------ 改造成表单所需值 ------------------------------ */
    // 监听级联选择器选定值的变化
    goodsCat (newVal) {
      this.addForm.goods_cat = newVal.join(',')
    },
    // 监听商品价格，将其由字符串变成number类型
    goodsPric (newVal) {
      this.addForm.goods_price = newVal ? +newVal : ''
    },
    // 监听商品重量，将其由字符串变成number类型
    goodsWeig (newVal) {
      this.addForm.goods_weight = newVal ? +newVal : ''
    },
    // steps步骤条图标
    addForm: {
      immediate: true,
      deep: true,
      handler (val) {
        if (
          val.goods_name !== '' &&
          this.goodsPric !== '' &&
          this.goodsWeig !== '' &&
          val.goods_number !== '' &&
          this.goodsCat.length !== 0
        ) {
          this.stepIcon = 'success'
        } else {
          this.stepIcon = 'process'
        }
      }
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('商品分类获取失败！')
      this.cateList = res.data
      console.log(res)
    },
    // 监听级联选择器选择器值的改变
    catIdChanged () {
      console.log(this.goodsCat)
      if (this.goodsCat.length !== 3) {
        this.goodsCat = []
        return this.$message.warning('只允许选择第三级分类')
      }
    },
    // tab页切换之前的钩子
    // 返回 false 或者返回 Promise 且被 reject，则阻止切换
    beforeTabLeave (activeTabName, oldTabName) {
      if (oldTabName === '0' && this.goodsCat.length === 0) {
        this.$message.warning('请填写所有必填项')
        return false
      }
    },
    // 监听tabs页的点击切换
    handleTabClick () {
      if (this.stepActiveInd === '1' && this.dynParaInfoList.length === 0) {
        this.attr_sel = 'many'
        this.getCatAttr()
        return false
      } else if (this.stepActiveInd === '2' && this.statPropInfoList.length === 0) {
        this.attr_sel = 'only'
        this.getCatAttr()
      } else if (this.stepActiveInd === '4') {
        this.stepEndIcon = 'success'
      } else if (this.stepActiveInd !== '4') {
        this.stepEndIcon = 'wait'
      }
    },
    // 监听CheckBox选定值的改变
    checkboxChange (val) {
      console.log(val)
      console.log(this.dynParaInfoList)
      console.log(this.statPropInfoList)
    },
    /* ------------------------------ 图片上传 ------------------------------ */
    // 监听图片的预览
    handlePreview (file) {
      this.previewURL = file.response.data.url
      this.isPicPreview = true
    },
    // 监听图片的删除
    handleRemove (file) {
      this.addForm.pics.splice(this.addForm.pics.indexOf(file.response.data.tmp_path), 1)
    },
    // 监听图片上传成功
    handleSuccess (resp) {
      console.log(resp)
      // 开头加\
      let path = '\\' + resp.data.tmp_path
      // 去除.jpg等后缀
      path = path.substring(0, path.indexOf('.'))
      // 将所有\换成/
      path = path.replace(/\\/g, '/')
      console.log(path)
      this.addForm.pics.push({ pic: path })
    },
    // 获取商品分类动态参数、静态属性列表
    async getCatAttr () {
      const { data: res } = await this.$http.get(`categories/${this.thirdGraCatId}/attributes`, { params: { sel: this.attr_sel } })
      if (res.meta.status !== 200) return this.$message.error(`${this.nameVal}获取失败！`)
      if (this.attr_sel === 'many') {
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.dynParaInfoList = res.data
        return
      }
      this.statPropInfoList = res.data
    },
    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          this.stepIcon = 'error'
          // 修改tabs标签页的name值，标签页会移动到该name值处
          this.stepActiveInd = '0'
          return this.$message.error('请填写所有必填项！')
        }
        const { data: res } = await this.$http.post('goods', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('商品添加失败！')
        this.$message.success('商品添加成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin-top: 15px;
}
.el-tabs {
  margin-top: 15px;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
</style>
