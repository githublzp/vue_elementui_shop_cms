<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-table :data="rightList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.level == 0">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level == 1">二级</el-tag>
            <el-tag type="danger" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      // 权限列表
      rightList: []
    }
  },
  created () {
    this.getRightList()
  },
  computed: {},
  watch: {},
  methods: {
    // 获取权限列表
    async getRightList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightList = res.data
      console.log(res)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
