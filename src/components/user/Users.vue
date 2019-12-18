<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索添加区 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="isAddUser = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="账号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽  惊呆了，还有这种操作 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              @change="userStateChange(scope.row)"
            >
              <!-- scope.row获取当前行一整行的数据 -->
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="queryUserById(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              effect="dark"
              content="设置用户角色"
              placement="top-start"
              :enterable="false"
              :hide-after="1500"
            >
              <el-button
                type="info"
                icon="el-icon-setting"
                size="mini"
                @click="showRoleToUser(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
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
      <!-- 添加用户弹出框 -->
      <el-dialog title="添加新用户" :visible.sync="isAddUser" width="30%" :close-on-click-modal="false">
        <el-form
          :model="addUserForm"
          :rules="formRules"
          ref="formRef"
          label-width="80px"
          status-icon
          @close="cancleAdd"
        >
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="checkPass">
            <el-input type="password" v-model="addUserForm.checkPass"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <!-- .number 将绑定值转化为 number 类型 -->
            <el-input v-model.number="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <div class="adduser">
            <div>
              <el-button size="mini" type="info" @click="cancleAdd">取 消</el-button>
            </div>
            <div>
              <el-button size="mini" type="warning" @click="resetForm">重 置</el-button>
              <el-button size="mini" type="primary" @click="addUser">确 定</el-button>
            </div>
          </div>
        </span>
      </el-dialog>
      <!-- 修改用户弹出框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="isEditUser"
        width="30%"
        :close-on-click-modal="false"
        @close="removeUInfo"
      >
        <el-form
          :model="uInfo"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="70px"
          status-icon
        >
          <el-form-item label="用户名">
            <el-input v-model="uInfo.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="uInfo.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <!-- .number 将绑定值转化为 number 类型 -->
            <el-input v-model.number="uInfo.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <div class="edituser">
            <div>
              <el-button type="info" size="mini" @click="removeUInfo">取 消</el-button>
            </div>
            <div>
              <el-button type="warning" size="mini" @click="resetEditForm">还 原</el-button>
              <el-button type="primary" size="mini" @click="editUser">确 定</el-button>
            </div>
          </div>
        </span>
      </el-dialog>
      <!-- 设置角色弹出框 -->
      <el-dialog
        title="设置角色"
        :visible.sync="isSetRole"
        width="30%"
        :close-on-click-modal="false"
        @close="closeSetRoleDia"
      >
        <div>
          <p>当前用户：{{uInfoSetRole.username}}</p>
          <p>当前角色：{{uInfoSetRole.role_name}}</p>
          <p>
            可选角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              ></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer">
          <el-button type="info" size="mini" @click="cancleSetRole">取 消</el-button>
          <el-button type="primary" size="mini" @click="setRoleToUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    // 自定义密码检验器
    const validatePass = (rule, value, callback) => {
      if (value !== '') {
        if (this.addUserForm.checkPass !== '') {
          this.$refs.formRef.validateField('checkPass')
        }
        callback()
      }
    }
    const validateCheckPass = (rule, value, callback) => {
      if (value !== this.addUserForm.password) {
        callback(new Error('两次输入密码不一致'))
      }
      callback()
    }
    // 解决数字值校验bug
    const validateNum = (rule, value, callback) => {
      if (value !== '') {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (!Number.isInteger(+value)) callback(new Error('请输入数字值'))
        if (!regMobile.test(value)) callback(new Error('请输入合法的手机号'))
        callback()
      }
      callback()
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 默认当前页码
        pagenum: 1,
        // 默认每页显示的条数
        pagesize: 2
      },
      userList: [],
      // 总条数
      total: 0,
      // 是否打开添加用户对话框
      isAddUser: false,
      // 添加用户的数据对象
      addUserForm: {
        username: '',
        password: '',
        checkPass: '',
        email: '',
        mobile: ''
      },
      // 校验表单规则对象
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '长度至少 6 个字符', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateCheckPass, trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入合法的邮箱', trigger: 'blur' }
        ],
        mobile: [{ validator: validateNum, trigger: 'blur' }]
      },
      // 是否打开修改用户信息弹框
      isEditUser: false,
      // 修改用户信息表单数据对象
      uInfo: {},
      // edit表单校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入合法的邮箱', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: validateNum, trigger: 'blur' }
        ]
      },
      // 控制设置角色对话框的开关
      isSetRole: false,
      // 展现在角色设置对话框上的用户信息对象
      uInfoSetRole: {},
      // 角色列表
      roleList: [],
      // 已选中的角色
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  computed: {},
  watch: {},
  methods: {
    /* ------------------------------ 查询用户 ------------------------------ */
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败！')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 监听Size值的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    /* ------------------------------ 修改用户状态 ------------------------------ */
    // 监听用户状态的改变
    async userStateChange (userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态设置失败！')
      }
      this.$message.success('用户状态设置成功')
    },
    /* ------------------------------ 添加用户 ------------------------------ */
    // 取消添加
    cancleAdd () {
      this.resetForm()
      this.isAddUser = false
    },
    // 重置 添加用户表单
    resetForm () {
      this.$refs.formRef.resetFields()
    },
    // 添加用户
    addUser () {
      // 对表单进行预校验
      this.$refs.formRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          this.isAddUser = true
          return this.$message.error('添加用户失败！')
        }
        this.isAddUser = false
        this.resetForm()
        this.getUserList()
        return this.$message.success('添加用户成功')
      })
    },
    /* ------------------------------ 修改用户信息 ------------------------------ */
    // 根据ID查询用户
    async queryUserById (uid) {
      const { data: res } = await this.$http.get(`users/${uid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败！')
      }
      // 将json对象变成字符串存入sessionstorage
      window.sessionStorage.setItem('editUserInfo', JSON.stringify(res.data))
      this.uInfo = res.data
      this.isEditUser = true
    },
    // 还原信息
    resetEditForm () {
      // 将字符串转换成json对象
      this.uInfo = JSON.parse(window.sessionStorage.getItem('editUserInfo'))
    },
    // 取消修改用户
    removeUInfo () {
      // 清除sessionstorage里的editUserInfo，并重置表单
      window.sessionStorage.removeItem('editUserInfo')
      this.$refs.editFormRef.resetFields()
      this.isEditUser = false
    },
    // 修改用户信息
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.put(
          `users/${this.uInfo.id}`,
          this.uInfo
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败！')
        }
        this.getUserList()
        this.removeUInfo()
        this.$message.success('修改用户信息成功')
      })
    },
    /* ------------------------------ 删除用户信息 ------------------------------ */
    delUser (uid) {
      this.$confirm('此操作将永久删除该用户, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false
      }).then(async () => {
        // 返回值是Promise类型，就可以使用async和await关键字来优化结果
        const { data: res } = await this.$http.delete('users/' + uid)
        if (res.meta.status !== 200) return this.$message.error('删除失败！')
        this.getUserList()
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 打开角色对话框
    async showRoleToUser (info) {
      this.uInfoSetRole = info
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.roleList = res.data
      this.isSetRole = true
    },
    // 为用户设置角色
    async setRoleToUser () {
      if (!this.selectedRoleId) return this.$message.info('请先选择角色')
      const { data: res } = await this.$http.put(`users/${this.uInfoSetRole.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) return this.$message.error('设置角色失败！')
      this.getUserList()
      this.isSetRole = false
      this.$message.success('设置角色成功')
    },
    // 取消设置角色
    cancleSetRole () {
      this.closeSetRoleDia()
      this.isSetRole = false
      this.$message.info('设置角色取消')
    },
    // 关闭设置角色对话框
    closeSetRoleDia () {
      this.selectedRoleId = ''
      this.uInfoSetRole = {}
    }
  }
}
</script>

<style lang="less" scoped>
.adduser {
  display: flex;
  justify-content: space-between;
}
.edituser {
  display: flex;
  justify-content: space-between;
}
</style>
