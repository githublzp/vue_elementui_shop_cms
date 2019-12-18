<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-button type="primary" size="medium" @click="showAddRole">添加角色</el-button>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开行 -->
        <el-table-column type="expand" label="#">
          <template slot-scope="scope">
            <!-- 动态绑定类名 -->
            <el-row
              v-for="(zitem, zind) in scope.row.children"
              :key="zitem.id"
              :class="['bdbottom', zind === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  type="danger"
                  @close="removeRightById(scope.row, zitem.id)"
                >{{ zitem.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(sitem, sind) in zitem.children"
                  :key="sitem.id"
                  :class="[sind === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, sitem.id)" type="warning">
                      {{
                      sitem.authName
                      }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="success"
                      v-for="csitem in sitem.children"
                      :key="csitem.id"
                      @close="removeRightById(scope.row, csitem.id)"
                    >{{ csitem.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 内容列表 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="285px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditRoleDia(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="delRole(scope.row.id)"
            >删除</el-button>
            <el-button
              type="info"
              size="mini"
              icon="el-icon-setting"
              @click="showRight(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加角色对话框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="isAddRole"
        width="30%"
        :close-on-click-modal="false"
        @close="closeAddRoleDia"
      >
        <el-form
          ref="addRoleFormRef"
          :model="addRoleForm"
          :rules="addRoleFormRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button type="info" size="mini" @click="isAddRole = false">取 消</el-button>
          <el-button type="primary" size="mini" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="isEditRole"
        width="30%"
        :close-on-click-modal="false"
        @close="closeEditRoleDia"
      >
        <el-form
          ref="editRoleFormRef"
          :model="editRoleForm"
          :rules="addRoleFormRules"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button type="info" size="mini" @click="isEditRole = false">取 消</el-button>
          <el-button type="primary" size="mini" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 权限分配对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="isSetRight"
        width="50%"
        :close-on-click-modal="false"
        @close="closeSetRightDia"
      >
        <!-- 树形控件 -->
        <el-tree
          :data="rightList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="rightTreeRef"
        ></el-tree>
        <span slot="footer">
          <el-button size="mini" type="info" @click="isSetRight = false">取 消</el-button>
          <el-button size="mini" type="primary" @click="setRightToRole()">确 定</el-button>
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
      // 角色列表数据
      roleList: [],
      // 控制添加角色对话框的关闭
      isAddRole: false,
      // 添加角色表单数据对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      // 控制修改角色对话框的关闭
      isEditRole: false,
      // 用来展示在角色修改表单对话框上的数据对象
      editRoleForm: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      // 控制分配权限对话框的关闭
      isSetRight: false,
      // 权限列表数据
      rightList: [],
      // 树形控件的属性数据对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形控件中默认选中项的ID值数据
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created () {
    // 获取角色列表
    this.getRoleList()
  },
  computed: {},
  watch: {},
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败！')
      }
      this.roleList = res.data
    },
    // 打开添加角色对话框
    showAddRole () {
      this.isAddRole = true
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('roles', { roleName: this.addRoleForm.roleName, roleDesc: this.addRoleForm.roleDesc })
        if (res.meta.status !== 201) return this.$message.error('角色添加失败！')
        this.getRoleList()
        this.isAddRole = false
        this.$message.success('角色添加成功')
      })
    },
    // 关闭添加角色对话框
    closeAddRoleDia () {
      this.$refs.addRoleFormRef.resetFields()
      this.addRoleForm = {}
    },
    // 打开修改角色对话框
    showEditRoleDia (roleInfo) {
      this.editRoleForm.id = roleInfo.id
      this.editRoleForm.roleDesc = roleInfo.roleDesc
      this.editRoleForm.roleName = roleInfo.roleName
      this.isEditRole = true
    },
    // 修改角色
    editRole () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.id}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('角色修改失败！')
        this.isEditRole = false
        this.getRoleList()
        this.$message.success('角色修改成功')
      })
    },
    // 关闭修改角色对话框
    closeEditRoleDia () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色
    delRole (rid) {
      this.$confirm('此操作将永久删除该角色，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${rid}`)
        if (res.meta.status !== 200) return this.$message.error('角色删除失败！')
        this.getRoleList()
        this.$message.success('角色删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 根据ID删除权限
    removeRightById (role, rightid) {
      this.$confirm('此操作将永久删除该权限，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightid}`)
        if (res.meta.status !== 200) return this.$message.error('权限删除失败！')
        // 改变参数变量的值 这就直接改了模板中scope.row的值  太神奇了
        role.children = res.data
        this.$message.success('权限删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 打开权限对话框
    async showRight (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      this.rightList = res.data
      console.log(this.rightList)
      this.getLeafKeys(role, this.defKeys)
      this.isSetRight = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) return arr.push(node.id)
      // forEach() 方法用于调用数组的每个元素，并将元素传递给回调函数
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 每次关闭对话框清除defKeys数组
    closeSetRightDia () {
      this.defKeys = []
    },
    // 给角色分配权限
    async setRightToRole () {
      const keys = [
        ...this.$refs.rightTreeRef.getCheckedKeys(),
        ...this.$refs.rightTreeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      console.log(idStr)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('权限分配失败！')
      this.getRoleList()
      this.isSetRight = false
      this.$message.success('权限分配成功')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
