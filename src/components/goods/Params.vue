<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
      <el-row class="cate_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedCatIdList"
            :options="cateList"
            :props="cascaderProps"
            @change="catIdChanged"
            clearable
            placeholder="请选择三级子类目"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab切换栏 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="small"
                :disabled="isAvailable"
                @click="showAddDia"
              >添加{{nameVal}}</el-button>
            </el-col>
          </el-row>
          <el-table :data="dataList" size="medium" max-height="340" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand" label="#">
              <template slot-scope="scope">
                <el-tag
                  :key="tag"
                  v-for="(tag, ind) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleColumTagClose(ind, scope.row)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisibleByTag"
                  v-model="scope.row.inputValueByTag"
                  ref="saveTagInputByTag"
                  size="small"
                  @keyup.enter.native="enterBlur($event)"
                  @blur="addByTag(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInputByTag(scope.row)"
                >+ 属性</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" :label="nameVal+'名称'"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDia(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="del(scope.row.cat_id, scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="small"
                :disabled="isAvailable"
                @click="showAddDia"
              >添加{{nameVal}}</el-button>
            </el-col>
          </el-row>
          <el-table :data="dataList" size="medium" max-height="340" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand" label="#">
              <template slot-scope="scope">
                <el-tag
                  class="dyn_tag"
                  :key="tag"
                  v-for="(tag, ind) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleColumTagClose(ind, scope.row)"
                >{{tag}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisibleByTag"
                  v-model="scope.row.inputValueByTag"
                  ref="saveTagInputByTag"
                  size="small"
                  @keyup.enter.native="enterBlur($event)"
                  @blur="addByTag(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInputByTag(scope.row)"
                >+ 属性</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column prop="attr_name" :label="nameVal+'名称'"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditDia(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="del(scope.row.cat_id, scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加动态参数、静态属性共用对话框 -->
        <el-dialog
          :title="'添加'+nameVal"
          :visible.sync="isAddDia"
          width="30%"
          :close-on-click-modal="false"
          @close="closeAddDia"
        >
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="120px">
            <el-form-item :label="nameVal+'名称'" prop="attr_name">
              <el-input v-model="addForm.attr_name" size="small"></el-input>
            </el-form-item>
            <el-form-item :label="nameVal+'值'">
              <el-tag
                :key="tag"
                v-for="tag in attrVal"
                closable
                :disable-transitions="false"
                @close="handleFormTagClose(tag)"
              >{{tag}}</el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValueAtDia"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="enterBlur($event)"
                @blur="handleInputConfirm"
              ></el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput">+ {{nameVal}}</el-button>
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button size="mini" type="info" @click="isAddDia = false">取 消</el-button>
            <el-button size="mini" type="primary" @click="add">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改动态参数、静态属性共用对话框 -->
        <el-dialog
          :title="'修改'+nameVal"
          :visible.sync="isEditDia"
          width="30%"
          :close-on-click-modal="false"
          @close="closeEditDia"
        >
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="120px">
            <el-form-item :label="nameVal+'名称'" prop="attr_name">
              <el-input v-model="editForm.attr_name" size="small" @keyup.enter.native="edit"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button size="mini" type="info" @click="isEditDia = false">取 消</el-button>
            <el-button size="mini" type="primary" @click="edit">确 定</el-button>
          </span>
        </el-dialog>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      /* ------------------------------ 级联选择器数据 ------------------------------ */
      // 级联选择器的数据源
      cateList: [],
      // 级联选择器的配置选项
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 级联选择器中选定的值，是个数组
      selectedCatIdList: [],
      /* ------------------------------ tabs标签页数据 ------------------------------ */
      // 默认选中的tab标签
      activeTabName: 'many',
      /* ------------------------------ table表格数据 ------------------------------ */
      // table表格数据源
      dataList: [],
      /* ------------------------------ 添加表单相关数据 ------------------------------ */
      // 控制添加动态参数、静态属性对话框的关闭
      isAddDia: false,
      // 添加动态参数、静态属性表单数据对象，
      // 每次添加数据之后，该对象要重置回来
      addForm: {
        attr_name: '',
        attr_sel: '',
        attr_vals: ''
      },
      // 添加动态参数、静态属性共用表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: `请输入名称`, trigger: 'blur' }]
      },
      // 添加表单中输入的参数值数组
      attrVal: [],
      // 控制添加表单中input和button组件的切换显示
      inputVisible: false,
      inputValueAtDia: '',
      /* ------------------------------ 修改表单相关数据 ------------------------------ */
      // 控制修改动态参数对话框的关闭
      isEditDia: false,
      // 修改表单数据对象
      editForm: {
        attr_id: '',
        attr_name: '',
        attr_vals: ''
      },
      // 修改动态参数、静态属性共用表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  // mounted () {},
  computed: {
    // 定义selectedCatIdList数组的长度
    cILL () {
      return this.selectedCatIdList.length
    },
    // 控制添加按钮的可用
    isAvailable () {
      if (this.cILL !== 3) return true
      return false
    },
    // 三级子类目的id
    thirdGraCatId () {
      if (this.cILL === 3) return this.selectedCatIdList[this.cILL - 1]
      return null
    },
    // 对话框表单的名称值
    nameVal () {
      if (this.activeTabName === 'many') return '动态参数'
      return '静态属性'
    }
  },
  watch: {
    // 监听添加表单操作后数组值的变化
    // 将表单中输入的数组值attrVal变成英文逗号分隔的字符串
    attrVal (newVal) {
      this.addForm.attr_vals = newVal.join(',')
    }
  },
  methods: {
    /* ------------------------------ 自定义功能方法 ------------------------------ */
    // 判断数组中是否有重复值
    isRepeat (arr) {
      let hash = {}
      for (let i in arr) {
        if (hash[arr[i]]) {
          return true
        }
        hash[arr[i]] = true
      }
      return false
    },
    /* ------------------------------ 获取所有商品分类 ------------------------------ */
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('商品分类获取失败！')
      this.cateList = res.data
    },
    /* ------------------------------ 获取参数 ------------------------------ */
    // 获取所有分类参数数据
    async getAllCatParas () {
      if (this.cILL !== 3) {
        this.selectedCatIdList = []
        return false
      }
      const { data: res } = await this.$http.get(`categories/${this.thirdGraCatId}/attributes`, { params: { sel: this.activeTabName } })
      if (res.meta.status !== 200) {
        return this.$message.error(`${this.nameVal}获取失败！`)
      }
      // 通过forEach循环数组，为数组每一项执行一些操作
      res.data.forEach(item => {
        // 如果字符串不为空串，将字符串变成数组，否则变为空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 控制input和button组件的切换显示，解决各个展开行input联动bug
        item.inputVisibleByTag = false
        item.inputValueByTag = ''
      })
      this.dataList = res.data
    },
    /* ------------------------------ 所有打开方法 ------------------------------ */
    // 打开添加表单中的输入框
    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 打开展开列中的输入框
    showInputByTag (row) {
      row.inputVisibleByTag = true
      // 通过inputVisibleByTag的Boolean值控制按钮和输入框的切换，
      // 点击之后变成true，如果紧接着获取输入框焦点，
      // 但是输入框还没有加载渲染到页面上，此时focus()就获取不到，报错
      // $nextTick就是等着input标签加载出来之后，再来focus()获得input焦点，保证程序顺利执行
      this.$nextTick(() => {
        // 让文本框自动获得焦点
        this.$refs.saveTagInputByTag.$refs.input.focus()
      })
    },
    // 打开添加动态参数、静态属性对话框
    showAddDia () {
      this.isAddDia = true
    },
    // 打开修改动态参数、静态属性对话框
    showEditDia (row) {
      this.editForm.attr_name = row.attr_name
      this.editForm.attr_id = row.attr_id
      this.editForm.attr_vals = row.attr_vals.join(',')
      this.isEditDia = true
    },
    /* ------------------------------ 所有关闭方法 ------------------------------ */
    // 监听添加动态参数对话框、静态属性对话框的关闭
    closeAddDia () {
      this.$refs.addFormRef.resetFields()
      this.attrVal = []
      this.addForm.attr_vals = this.addForm.attr_sel = this.addForm.attr_name = ''
    },
    // 关闭修改动态参数、静态属性对话框
    closeEditDia () {
      this.$refs.editFormRef.clearValidate()
    },
    /* ------------------------------ 所有改变方法 ------------------------------ */
    // 监听级联选择器值的变化
    catIdChanged () {
      if (this.cILL === 0) {
        this.selectedCatIdList = this.dataList = []
        return false
      }
      if (this.cILL !== 3) {
        this.selectedCatIdList = this.dataList = []
        return this.$message.warning('只允许为第三级分类设置相关参数')
      }
      this.getAllCatParas()
    },
    // 监听tab点击
    handleTabClick () {
      if (this.cILL !== 3) return this.$message.warning('请先选定三级子类目')
      this.getAllCatParas()
    },
    /* ------------------------------ 所有添加方法 ------------------------------ */
    // 通过tag标签添加动态参数值、静态属性值
    async addByTag (row) {
      let str = row.inputValueByTag.trim()
      if (str) {
        row.attr_vals.push(str)
        if (this.isRepeat(row.attr_vals)) {
          row.attr_vals.splice(row.attr_vals.length - 1, 1)
          row.inputValueByTag = ''
          row.inputVisibleByTag = false
          return this.$message.warning(`${this.nameVal}值必须唯一！`)
        }
        const { data: res } = await this.$http.put(`categories/${this.thirdGraCatId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        })
        if (res.meta.status !== 200) return this.$message.error(`${this.nameVal}值添加失败！`)
        this.$message.success(`${this.nameVal}值添加成功`)
      }
      row.inputValueByTag = ''
      row.inputVisibleByTag = false
    },
    // 通过表单添加动态参数、静态属性
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.addForm.attr_sel = this.activeTabName
        const { data: res } = await this.$http.post(`categories/${this.thirdGraCatId}/attributes`, this.addForm)
        if (res.meta.status !== 201) return this.$message.error(`${this.nameVal}添加失败！`)
        this.getAllCatParas()
        this.$message.success(`${this.nameVal}添加成功`)
        this.isAddDia = false
        console.log(res)
      })
    },
    // 监听按下enter键，会触发blur
    enterBlur (event) { event.target.blur() },
    // 监听blur事件，将添加表单中tag标签输入的值存入attrVal数组中
    handleInputConfirm () {
      if (this.inputValueAtDia.trim()) {
        this.attrVal.push(this.inputValueAtDia.trim())
        if (this.isRepeat(this.attrVal)) {
          this.attrVal.splice(this.attrVal.length - 1, 1)
          this.$message.warning(`${this.nameVal}值必须唯一！`)
        }
      }
      this.inputVisible = false
      this.inputValueAtDia = ''
    },
    /* ------------------------------ 所有删除方法 ------------------------------ */
    // 删除动态参数、静态属性
    del (cid, aid) {
      this.$confirm(`确定要永久删除该${this.nameVal}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        const { data: res } = await this.$http.delete(`categories/${cid}/attributes/${aid}`)
        if (res.meta.status !== 200) return this.$message.error(`${this.nameVal}}删除失败！`)
        this.getAllCatParas()
        this.$message.success(`${this.nameVal}删除成功`)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 通过展开列中tag标签的关闭从数据库删除对应值
    async handleColumTagClose (ind, row) {
      // 将原来的数组修改
      row.attr_vals.splice(ind, 1)
      const { data: res } = await this.$http.put(`categories/${this.thirdGraCatId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(',')
      })
      if (res.meta.status !== 200) return this.$message.error(`${this.nameVal}值删除失败！`)
      this.$message.success(`${this.nameVal}值删除成功`)
    },
    // 通过表单中tag标签的关闭从内存变量中移除对应值
    handleFormTagClose (tag) {
      this.attrVal.splice(this.attrVal.indexOf(tag), 1)
    },
    /* ------------------------------ 所有修改方法 ------------------------------ */
    // 修改动态参数、静态属性
    async edit () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.thirdGraCatId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeTabName,
          attr_vals: this.editForm.attr_vals
        })
        if (res.meta.status !== 200) return this.$message.error(`${this.nameVal}名称修改失败！`)
        this.getAllCatParas()
        this.isEditDia = false
        this.$message.success(`${this.nameVal}名称修改成功`)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cate_opt {
  margin: 15px 0;
}
.el-cascader {
  width: 50%;
}
.el-cascader-menu__list {
  height: 300px;
}
.el-tag {
  margin-right: 10px;
}
.button-new-tag {
  height: 32px;
  line-height: 30px;
  font-size: 13px;
  width: 100px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 100px;
  line-height: 30px;
  vertical-align: middle;
}
</style>
