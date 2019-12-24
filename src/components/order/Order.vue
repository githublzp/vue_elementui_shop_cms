<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="orderData.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table :data="orderList" border stripe max-height="450">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格(元)" width="100"></el-table-column>
        <el-table-column label="是否付款" width="100">
          <template slot-scope="scope">
            <el-tag type="danger" size="medium" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" size="medium" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="180"></el-table-column>
        <el-table-column label="下单时间" width="180">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDia()"></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressDia(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderData.pagenum"
        :page-sizes="[5, 20, 50, 100]"
        :page-size="orderData.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改订单对话框 -->
      <el-dialog
        title="修改订单"
        :visible.sync="isEditOrder"
        width="30%"
        :close-on-click-modal="false"
        @close="closeEditOrderDia"
      >
        <el-form
          :model="editOrderForm"
          :rules="editOrderFormRules"
          ref="editOrderFormRef"
          label-width="120px"
        >
          <el-form-item label="省市区/县" prop="ssqAddr">
            <!-- 级联选择器 -->
            <el-cascader
              size="small"
              v-model="editOrderForm.ssqAddr"
              :options="cityDataOfChina"
              :props="cascaderProps"
              @change="cityChanged"
              placeholder="请选择三级子类目"
              style="width: 100%;"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="detailAddr">
            <el-input
              v-model="editOrderForm.detailAddr"
              size="small"
              @keyup.enter.native="editOrder"
            ></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" type="info" @click="isEditOrder = false">取 消</el-button>
          <el-button size="mini" type="primary" @click="editOrder">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流对话框 -->
      <el-dialog
        title="物流进度"
        :visible.sync="isShowProgressDia"
        width="30%"
        @close="closeProgressDia"
      >
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityDataOfChina from './citydata.js'

export default {
  name: '',
  data () {
    return {
      // 订单数据对象
      orderData: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表
      orderList: [],
      // 总数据条数
      total: 0,
      // 控制修改对话框的关闭
      isEditOrder: false,
      // 控制物流对话框的关闭
      isShowProgressDia: false,
      editOrderForm: {
        ssqAddr: [],
        detailAddr: ''
      },
      // 中国所有城市数据列表
      cityDataOfChina,
      // 级联选择器属性配置对象
      cascaderProps: {
        expandTrigger: 'hover'
        // value: 'cat_id',
        // label: 'cat_name',
        // children: 'children'
      },
      editOrderFormRules: {
        ssqAddr: [
          { required: true, message: '请选择省市县/区', trigger: 'blur' }
        ],
        detailAddr: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 物流信息
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  // mounted () {},
  computed: {},
  watch: {},
  methods: {
    // 获取所有订单
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.orderData })
      if (res.meta.status !== 200) return this.$message.error('订单获取失败！')
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(res)
    },
    // 监听每页显示条数变化
    handleSizeChange (val) {
      this.orderData.pagesize = val
      this.getOrderList()
    },
    // 监听页码变化
    handleCurrentChange (val) {
      this.orderData.pagenum = val
      this.getOrderList()
    },
    // 打开修改订单Dia
    showEditDia () {
      this.isEditOrder = true
    },
    // 级联选择器选定值改变
    cityChanged () { },
    // 修改订单
    editOrder () { },
    // 关闭修改订单Dia
    closeEditOrderDia () {
      this.$refs.editOrderFormRef.resetFields()
    },
    // 打开物流信息对话框
    async showProgressDia () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) return this.$message.error('物流信息获取失败！')
      this.progressInfo = res.data
      console.log(res)
      this.isShowProgressDia = true
    },
    // 关闭物流信息对话框
    closeProgressDia () {
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";
</style>
