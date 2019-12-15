<template>
  <div>
    <el-button type="info" @click="logOut">退出</el-button>
  </div>
</template>

<script>
export default {
  name: '',
  data () {
    return {}
  },
  computed: {},
  watch: {},
  methods: {
    logOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="" scoped>

</style>
