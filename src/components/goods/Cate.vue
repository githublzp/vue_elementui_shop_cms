<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-button type="primary" size="medium" @click="showAddCateDia">添加分类</el-button>
      </el-row>
      <!-- 分类列表区 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :show-index="true"
        :selection-type="false"
        :expand-type="false"
        border
        :show-row-hover="false"
      >
        <!-- isOk模板 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-error" v-if="scope.row.cat_deleted === true"></i>
          <i class="el-icon-success" v-else></i>
        </template>
        <!-- order模板 -->
        <template slot="level" slot-scope="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- opt模板 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDia(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="delCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
      <!-- 修改分类对话框 -->
      <el-dialog
        title="修改分类"
        :visible.sync="isEditCate"
        width="30%"
        :close-on-click-modal="false"
        @close="closeEditCateDia"
      >
        <el-form
          :model="editCateForm"
          :rules="addCateFormRules"
          ref="editCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" type="info" @click="isEditCate = false">取 消</el-button>
          <el-button size="mini" type="primary" @click="editCate">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 添加分类对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="isAddCate"
        width="30%"
        :close-on-click-modal="false"
        @close="closeAddCateDia"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <!-- options指定数据源 props指定配置对象 v-model指定选中项绑定给一个数组类型数据 -->
            <el-cascader
              v-model="selectedParentIdList"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentIdChanged"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" type="info" @click="isAddCate = false">取 消</el-button>
          <el-button size="mini" type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      // 商品分类数据列表
      cateList: [],
      // 查询商品分类列表所用的数据对象
      queryInfo: {
        // 分类列表的层数
        type: 3,
        // 默认当前页码
        pagenum: 1,
        // 默认当前每页最多显示条数
        pagesize: 5
      },
      // 商品分类总条数
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 指定使用isOk插槽模板
          template: 'isOk'
        },
        {
          label: '分类级别',
          // 表示将当前列定义为模板列
          type: 'template',
          // 指定使用level插槽模板
          template: 'level'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 指定使用opt插槽模板
          template: 'opt'
        }
      ],
      // 控制添加分类对话框
      isAddCate: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: '',
        // 指定默认添加一级分类
        cat_pid: 0,
        cat_level: 0
      },
      // 表单验证规则
      //   定义规则时，各个节点名要和表单数据对象的属性名一样，一样了才能监测到
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 级联选择器prop属性对象
      cascaderProps: {
        expandTrigger: 'hover',
        checkStrictly: 'true',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父分类id列表
      selectedParentIdList: [],
      // 控制修改分类对话框
      isEditCate: false,
      // 修改分类表单数据对象
      editCateForm: {
        // 该类目的id值
        id: '',
        cat_name: ''
      }
    }
  },
  created () {
    this.getCateList()
  },
  // mounted () {},
  computed: {},
  watch: {},
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('商品分类获取失败！')
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听size的改变
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    // 监听页码的改变
    handleCurrentChange (newpage) {
      this.getCateList()
      this.queryInfo.pagenum = newpage
    },
    // 打开添加分类对话框
    showAddCateDia () {
      this.getParentCates()
      this.isAddCate = true
    },
    // 获取父级分类数据
    async getParentCates () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('父级分类获取失败！')
      this.parentCateList = res.data
    },
    // 监听级联选择器变化
    parentIdChanged () {
      if (this.selectedParentIdList.length > 0) {
        this.addCateForm.cat_pid = this.selectedParentIdList[this.selectedParentIdList.length - 1]
        this.addCateForm.cat_level = this.selectedParentIdList.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.addCateForm)
    },
    // 添加分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('分类添加失败！')
        this.getCateList()
        this.isAddCate = false
        this.$message.success('分类添加成功')
      })
    },
    // 监听关闭添加分类对话框
    closeAddCateDia () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedParentIdList = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 打开修改分类对话框
    async showEditCateDia (catid) {
      const { data: res } = await this.$http.get('categories/' + catid)
      if (res.meta.status !== 200) return this.$message.error('分类信息获取失败！')
      this.editCateForm.id = res.data.cat_id
      this.editCateForm.cat_name = res.data.cat_name
      this.isEditCate = true
    },
    // 修改分类
    editCate () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.id}`, { cat_name: this.editCateForm.cat_name })
        if (res.meta.status !== 200) return this.$message.error('分类修改失败！')
        this.getCateList()
        this.isEditCate = false
        this.$message.success('分类修改成功')
      })
    },
    // 监听修改分类对话框关闭
    closeEditCateDia () {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm.id = ''
      this.editCateForm.cat_name = ''
    },
    // 删除分类
    delCate (catid) {
      this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        const { data: res } = await this.$http.delete('categories/' + catid)
        if (res.meta.status !== 200) return this.$message.error('分类删除失败！')
        this.getCateList()
        this.$message.success('分类删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  font-size: 13px;
  margin-top: 15px;
}
.el-icon-error {
  color: #f56c6c;
}
.el-icon-success {
  color: #67c23a;
}
.el-cascader {
  width: 100%;
}
</style>
