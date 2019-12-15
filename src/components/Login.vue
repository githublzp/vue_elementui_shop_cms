<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/bee.jpg" alt />
      </div>
      <!-- 表单区域 -->
      <el-form
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login('loginFormRef')"
            >登录</el-button
          >
          <el-button type="info" @click="resetForm('loginFormRef')"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: '请输入您的用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '长度至少 6 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login (refName) {
      // 对表单进行登录前的预校验
      this.$refs[refName].validate(async valid => {
        if (!valid) return false
        // await可简化对promise对象的操作，await只能用在async修饰的方法中
        // 解构操作从一个复杂对象中取出需要的那一部分，并将其重命名为res
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功')
        // 1. 将登录成功后的token保存到客户端的sessionStorage中
        //   1.1 其他API接口必须是在登录成功之后才能访问
        //   1.2 token应该只在当前网站打开期间生效
        window.sessionStorage.setItem('token', res.data.token)
        // 2. 通过编程式导航跳转到主页，路由地址是 /home
        this.$router.push('/home')
      })
    },
    resetForm (refName) {
      // 获取表单对象将其重置
      this.$refs[refName].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    padding: 5px;
    border: 1px solid #eee;
    box-shadow: 0 0 10px #ddd;
    border-radius: 50%;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20px;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
