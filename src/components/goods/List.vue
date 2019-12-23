<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 顶部搜索区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryPara.query" placeholder="请输入内容" clearable @clear="getGoodsList">
            <el-button type="primary" slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table :data="goodsList" border stripe height="450">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="100"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="edit(sope.row)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="del(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryPara.pagenum"
        :page-sizes="[5, 20, 50, 100]"
        :page-size="queryPara.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 回顶部 -->
      <el-backtop target=".el-table"></el-backtop>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      // 查询参数对象
      queryPara: {
        query: '',
        // 默认页码和每页显示条数
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      goodsList: [],
      // 商品数据总条数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  // mounted () {},
  computed: {},
  watch: {},
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryPara })
      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(res)
    },
    // 监听每页显示条数的改变
    handleSizeChange (newsize) {
      this.queryPara.pagesize = newsize
      this.getGoodsList()
    },
    // 监听页码的改变
    handleCurrentChange (newpage) {
      this.queryPara.pagenum = newpage
      this.getGoodsList()
    },
    // 删除商品
    del (row) {
      this.$confirm('此操作将永久删除该商品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
        if (res.meta.status !== 200) return this.$message.error('商品删除失败！')
        this.getGoodsList()
        this.$message.success('商品删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 修改商品
    edit (row) { },
    // 跳转到商品添加页
    toAddPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
