<template>
  <div id="explorWrapper" v-if="isRouterAlive" v-loading="explorPageLoading">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <div id="networkStatusWords">
      <div class="title alt" v-if="netWork_GREEN">NETWORK STATUS: {{nowLinkTo}}</div>
      <div class="title alt" v-if="netWork_RED">NETWORK STATUS: {{nowLinkTo}}</div>
    </div>
    <div id="networkStatus">
      <el-button
        type="success"
        icon="el-icon-check"
        circle
        @click="networkStatus"
        v-if="netWork_GREEN"
        size="mini"
      ></el-button>
      <el-button
        type="danger"
        icon="el-icon-close"
        circle
        @click="networkStatus"
        v-if="netWork_RED"
        size="mini"
      ></el-button>
    </div>
    <div class="searchInput">
      <el-input
        placeholder="seq_id / tx_hash / address"
        v-model="searchInput"
        type="text"
        clearable
      >
        <el-button type="primary" slot="append" icon="el-icon-search" @click="search(searchInput)"></el-button>
      </el-input>
    </div>
    <el-dialog
      title="NODE INFO"
      :visible.sync="dialogVisible"
      width="50%"
      top="0.5%"
      :show-close="false"
      style="overflow: auto"
    >
      <div class="title alt small" style="margin-top: 10px;">now connecting to ...</div>
      <div id="networkStatusInfo">{{nowLinkTo}}</div>
      <div class="title alt small" style="margin-top: 10px;">info:</div>
      <div id="networkStatusInfo">
        <pre style="overflow-x: auto;white-space: pre-line;">
          <json-viewer :value="network_status" :expand-depth="5" copyable boxed sort></json-viewer>
        </pre>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="warning"
          round
          @click="dialogVisible = false;dialogVisible2 = true"
        >change connection</el-button>
        <el-button type="success" round @click="dialogVisible = false">ok</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="SET CONNECTION"
      :visible.sync="dialogVisible2"
      width="50%"
      :show-close="false"
    >
      <el-form :model="connForm" status-icon :rules="rules" ref="connForm">
        <el-form-item class="title alt" label="connection url:" prop="connURL">
          <el-input
            v-model="connForm.connURL"
            placeholder="please input the connection url."
            style="margin-top: 10px"
          >
            <template slot="prepend">http://</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" round @click="dialogVisible2 = false">cancel</el-button>
        <el-button type="success" round @click="setConnetction('connForm')">set</el-button>
      </span>
    </el-dialog>
    <div class="explor-top">
      <el-card class="explor-card" shadow="hover">
        <i class="el-icon-share explor-card-icon"></i>
        <h2 class="card-title">Last Sequencer</h2>
        <div class="card-info">
          <el-button
            type="text"
            @click="goSeqInfo(monitor.status.height)"
            v-if="netWork_GREEN"
          >{{monitor.status.height}}</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="explor-card" shadow="hover">
        <i class="el-icon-time explor-card-icon"></i>
        <h2 class="card-title">Confirm Time</h2>
        <div class="card-info">
          <el-button
            type="text"
            @click="goSeqInfo(monitor.status.height)"
            v-if="netWork_GREEN"
          >{{confirm_time || 0}} Sec.</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="explor-card" shadow="hover">
        <i class="el-icon-odometer explor-card-icon"></i>
        <h2 class="card-title">Tps</h2>
        <div class="card-info">
          <el-button type="text" v-if="netWork_GREEN" @click="goSeqInfo(monitor.status.height)">{{monitor.tps.num}}</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="explor-card" shadow="hover">
        <i class="el-icon-pie-chart explor-card-icon"></i>
        <h2 class="card-title">Confirm %</h2>
        <div class="card-info">
          <el-button
            type="text"
            @click="goSeqInfo(monitor.status.height)"
            v-if="netWork_GREEN"
          >{{confirm_rate}}</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="connectionList" shadow="hover">
        <el-button
          type="text"
          icon="el-icon-connection"
          style="margin-top: -10px;"
          @click="goConnection"
        >check connection</el-button>
      </el-card>
      <div class="seqList">
        <el-card
          class="seqCard"
          shadow="hover"
          :key="item.Hash"
          v-for="item in seqList"
          @click.native="goSeqInfo(item.Height)"
        >
          <i class="el-icon-share explor-card-icon"></i>
          <h2 class="seqCard-title">sequencer</h2>
          <h2 class="seqCard-height">{{item.Height}}</h2>
          <h4 class="seqCard-hash">{{item.Hash.slice(0,8)}}...{{item.Hash.slice(58)}}</h4>
        </el-card>
      </div>
      <div class="networkArea">
        <el-card class="networkCard" shadow="hover">
          <h2 class="networkArea-title">network io</h2>
          <div id="leftChart" class="leftChart"></div>
          <div id="rightChart" class="rightChart"></div>
          <h3 class="leftChart-num">{{avgSend}} kB</h3>
          <h3 class="rightChart-num">{{avgRecv}} kB</h3>
        </el-card>
      </div>
    </div>
    <div id="menu-icon">
      <div>
        explor
        <el-button type="success" icon="el-icon-link" @click="goIndex" circle style="box-shadow:3px 3px 8px 0px rgba(157,163,180,0.4)"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
import C from '../js/common.js'
import sqlite from '../db/db.js'
import echarts from 'echarts'

export default {
  name: 'explor-page',
  components: {},
  data () {
    var validateConn = (rule, value, callback) => {
      if (!value) {
        callback(new Error('connection url can not be null!'))
      } else {
        callback()
      }
    }
    return {
      confirm_time: '0',
      confirm_rate: '0%',
      avgSend: 0,
      avgRecv: 0,
      totalSend: 0,
      totalReceiv: 0,
      max: 1024,
      leftChart: '',
      rightChart: '',
      monitor: {},
      network_status: 'please check your connection',
      explorPageLoading: true,
      seqHeight: 0,
      sec: 0,
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
      searchInput: '',
      loading: true,
      netWork_warning: false,
      connForm: {
        connURL: ''
      },
      seqList: [],
      rules: {
        connURL: [{ validator: validateConn, trigger: 'blur' }]
      }
    }
  },
  methods: {
    goIndex () {
      this.$router.push({ path: '/' })
    },
    goSeqInfo (num) {
      this.$router.push({ path: '/seqInfo', query: { seqId: num } })
    },
    goConnection () {
      this.$router.push({ path: '/connection' })
    },
    networkStatus () {
      this.dialogVisible = true
    },
    search (searchInput) {
      if (searchInput.slice(0, 2) === '0x') {
        if (searchInput.length === 66) {
          // tx_Hash
          this.$router.push({ path: '/txInfo', query: { hash: searchInput } })
        } else if (searchInput.length === 42) {
          // address
          this.$router.push({
            path: '/addressInfo',
            query: { address: searchInput }
          })
        } else {
          this.searchInput = ''
          this.$message({
            message: 'transaction hash or address format error',
            type: 'error'
          })
        }
      } else {
        this.$router.push({ path: '/seqInfo', query: { seqId: searchInput } })
      }
    },
    queryMonitor () {
      C.getMonitor()
        .then(data => {
          this.monitor = data.data
          this.seqHeight = this.monitor.status.height
          this.explorPageLoading = false
        })
        .then()
        .catch(e => {
          this.explorPageLoading = false
          this.$message({
            message: e.toString(),
            type: 'error'
          })
        })
    },
    getSeq (num) {
      C.getSeq(num)
        .then(data => {
          if (data.data) {
            console.log('data here', data)
            this.seqList.unshift(data.data)
          } else {
            this.$message({
              message: num + ' ' + data.message,
              type: 'error'
            })
          }
        })
        .then()
        .catch(e => {
          this.$message({
            message: e.toString(),
            type: 'error'
          })
        })
    },
    getConfirmStatus () {
      C.getConfirmStatus().then((data) => {
        this.confirm_time = data.data.confirm_time
        this.confirm_rate = data.data.confirm_rate
      }).then().catch((e) => {
        // console.log(e)
      })
    },
    queryNet_io () {
      C.net_io().then((data) => {
        var idx = data.data.transport_data.avg_send.lastIndexOf(' ')
        this.avgSend = +data.data.transport_data.avg_send.substring(0, idx)
        idx = data.data.transport_data.avg_recv.lastIndexOf(' ')
        this.avgRecv = +data.data.transport_data.avg_recv.substring(0, idx)
        this.totalSend = data.data.transport_data.total_send_num
        this.totalReceiv = data.data.transport_data.total_receiv_num
        console.log(this.avgSend, this.avgRecv)
        if (this.avgRecv < 4) {
          this.max = 4
        } else if (this.avgRecv < 6) {
          this.max = 6
        } else if (this.avgRecv < 8) {
          this.max = 8
        } else if (this.avgRecv < 16) {
          this.max = 16
        } else if (this.avgRecv < 64) {
          this.max = 64
        } else if (this.avgRecv < 256) {
          this.max = 256
        } else if (this.avgRecv < 1024) {
          this.max = 1024
        } else if (this.avgRecv < 2048) {
          this.max = 2048
        }
        this.draw()
      }).then().catch((e) => {
        // console.log(e)
      })
    },
    setConnetction (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          C.changeConn('http://' + this.connForm.connURL).then(data => {
            if (data.result === 'success') {
              console.log(data.data)
              this.explorPageLoading = true
              this.dialogVisible2 = false
              this.$message({
                message:
                  'Connection setup successful. Please restart the client.',
                type: 'a',
                showClose: false,
                duration: 0
              })
            }
          })
        } else {
          this.$message({
            message: 'error! Please check the form.',
            type: 'error'
          })
          return false
        }
      })
    },
    draw () {
      this.leftChart = echarts.init(document.getElementById('leftChart'))
      this.leftChart.setOption({
        series: [
          {
            name: '刻度',
            type: 'gauge',
            radius: '80%',
            min: 0,
            max: this.max,
            splitNumber: 2, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: false,
              lineStyle: {
                width: 1,
                color: [[1, 'rgba(0,0,0,0)']]
              }
            }, // 仪表盘轴线
            axisLabel: {
              show: true,
              color: '#3B53A2',
              distance: 15,
              fontSize: 11,
              formatter: '{value}'
            }, // 刻度标签。
            axisTick: {
              show: true,
              lineStyle: {
                color: {
                  type: 'radial',
                  colorStops: [
                    {
                      offset: 0,
                      color: '#77C664'
                    },

                    {
                      offset: 0.2,
                      color: '#2CB7C7'
                    },

                    {
                      offset: 0.4,
                      color: '#1DB2DD'
                    },

                    {
                      offset: 0.6,
                      color: '#2D89ED'
                    },

                    {
                      offset: 0.8,
                      color: '#7765B4'
                    },

                    {
                      offset: 1,
                      color: '#EB3457'
                    }
                  ],
                  globalCoord: false // 缺省为 false
                },
                width: 2,
                length: 20
              },
              length: -5
            }, // 刻度样式
            splitLine: {
              show: true,
              length: -5
            }, // 分隔线样式
            detail: {
              show: false
            },
            pointer: {
              show: false
            }
          },
          {
            type: 'gauge',
            radius: '85%',
            min: 0,
            max: this.max,
            center: ['50%', '50%'],

            splitNumber: 0, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              lineStyle: {
                width: 13,
                color: [
                  [
                    1,
                    new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      {
                        offset: 0,
                        color: '#77C664'
                      },

                      {
                        offset: 0.2,
                        color: '#2CB7C7'
                      },

                      {
                        offset: 0.4,
                        color: '#1DB2DD'
                      },

                      {
                        offset: 0.6,
                        color: '#2D89ED'
                      },

                      {
                        offset: 0.8,
                        color: '#7765B4'
                      },

                      {
                        offset: 1,
                        color: '#EB3457'
                      }
                    ])
                  ]
                ]
              }
            },
            // 分隔线样式。
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },

            // 仪表盘详情，用于显示数据。
            detail: {
              show: false,
              offsetCenter: [0, 0],
              color: '#ddd',
              formatter: function (params) {
                return params
              },
              textStyle: {
                fontSize: 12
              }
            },
            data: [
              {
                name: 'Avg. receiv',
                value: this.avgRecv
              }
            ]
          }
        ]
      })
      this.rightChart = echarts.init(document.getElementById('rightChart'))
      this.rightChart.setOption({
        series: [
          {
            name: '刻度',
            type: 'gauge',
            radius: '80%',
            min: 0,
            max: this.max,
            splitNumber: 2, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: false,
              lineStyle: {
                width: 1,
                color: [[1, 'rgba(0,0,0,0)']]
              }
            }, // 仪表盘轴线
            axisLabel: {
              show: true,
              color: '#3B53A2',
              distance: 15,
              fontSize: 11,
              formatter: '{value}'
            }, // 刻度标签。
            axisTick: {
              show: true,
              lineStyle: {
                color: {
                  type: 'radial',
                  colorStops: [
                    {
                      offset: 0,
                      color: '#77C664'
                    },

                    {
                      offset: 0.2,
                      color: '#2CB7C7'
                    },

                    {
                      offset: 0.4,
                      color: '#1DB2DD'
                    },

                    {
                      offset: 0.6,
                      color: '#2D89ED'
                    },

                    {
                      offset: 0.8,
                      color: '#7765B4'
                    },

                    {
                      offset: 1,
                      color: '#EB3457'
                    }
                  ],
                  globalCoord: false // 缺省为 false
                },
                width: 2,
                length: 20
              },
              length: -5
            }, // 刻度样式
            splitLine: {
              show: true,
              length: -5
            }, // 分隔线样式
            detail: {
              show: false
            },
            pointer: {
              show: false
            }
          },
          {
            type: 'gauge',
            radius: '85%',
            min: 0,
            max: this.max,
            center: ['50%', '50%'],

            splitNumber: 0, // 刻度数量
            startAngle: 180,
            endAngle: 0,
            axisLine: {
              show: true,
              lineStyle: {
                width: 13,
                color: [
                  [
                    1,
                    new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      {
                        offset: 0,
                        color: '#77C664'
                      },

                      {
                        offset: 0.2,
                        color: '#2CB7C7'
                      },

                      {
                        offset: 0.4,
                        color: '#1DB2DD'
                      },

                      {
                        offset: 0.6,
                        color: '#2D89ED'
                      },

                      {
                        offset: 0.8,
                        color: '#7765B4'
                      },

                      {
                        offset: 1,
                        color: '#EB3457'
                      }
                    ])
                  ]
                ]
              }
            },
            // 分隔线样式。
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },

            // 仪表盘详情，用于显示数据。
            detail: {
              show: false,
              offsetCenter: [0, 0],
              color: '#ddd',
              formatter: function (params) {
                return params
              },
              textStyle: {
                fontSize: 12
              }
            },
            data: [
              {
                name: 'Avg. send',
                value: this.avgSend
              }
            ]
          }
        ]
      })
    }
  },
  watch: {
    seqHeight () {
      console.log('change', this.seqHeight)
      this.getSeq(this.seqHeight)
    },
    avgSend () {
      this.draw()
    },
    avgRecv () {
      this.draw()
    }
  },
  mounted () {
    sqlite
      .query('SELECT * FROM conn where id = 1')
      .then(data => {
        console.log(data.data[0])
        this.nowLinkTo = data.data[0].url
        return C.getNetInfo()
      })
      .then(data => {
        console.log('data', data)
        if (data === 4001) {
          this.netWork_GREEN = false
          this.netWork_RED = true
          this.netWork_warning = true
          this.goIndex()
        } else {
          this.network_status = data.data
          this.netWork_GREEN = true
          this.netWork_RED = false
          this.loading = false
          this.indexPageLoading = false
          this.netWork_warning = false
          setInterval(() => {
            this.queryMonitor()
            this.queryNet_io()
          }, 1000)
        }
      })
      .then()
      .catch(err => {
        console.log('err', err)
        this.netWork_GREEN = false
        this.netWork_RED = true
        this.netWork_warning = true
        this.goIndex()
      })
    this.queryMonitor()
    this.queryNet_io()
  },
  created () {
  },
  computed: {}
}
</script>

<style>
#explorWrapper {
  background-image: url("~@/assets/background.png");
  height: 100vh;
  padding: 40px 40px;
  width: 100vw;
  overflow: hidden;
}
.explor-top {
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
}
.explor-card {
  width: 24.6%;
  height: 160px;
  margin-left: 5px;
  background-color: transparent !important;
  background: hsla(0, 0%, 100%, 0.3) !important;
  text-align: center;
}
.card-info {
  margin-top: 6px;
  zoom: 1.4;
}
.searchInput {
  position: absolute;
  right: 40px;
  top: 64px;
  width: 30%;
}
.connectionList {
  margin-top: 10px;
  margin-left: 5px;
  width: 1352px;
  height: 60px;
  background-color: transparent !important;
  background: hsla(0, 0%, 100%, 0.3) !important;
  text-align: center;
}
.seqList {
  margin-top: 10px;
  margin-left: 40px;
  width: 550px;
  height: 380px;
  overflow-y: auto;
}
.seqList::-webkit-scrollbar {
  display: none;
}
.networkArea {
  margin-top: 10px;
  margin-left: 10px;
  width: 657px;
}
.seqCard {
  margin: 5px 10px;
  height: 90px;
  background-color: transparent !important;
  background: hsla(0, 0%, 100%, 0.3) !important;
}
.networkCard {
  margin: 5px 0px;
  background-color: transparent !important;
  background: hsla(0, 0%, 100%, 0.3) !important;
  height: 260px;
  width: 700px;
}
.el-dialog__wrapper::-webkit-scrollbar {
  display: none;
}
.explor-card-icon {
  zoom: 1.4;
}
.seqCard-title {
  position: relative;
  top: -30px;
  left: 40px;
}
.seqCard-height {
  position: relative;
  top: -24px;
  left: 10px;
}
.seqCard-hash {
  position: relative;
  top: -66px;
  left: 320px;
}
.leftChart{
  width: 600px;
  height: 200px;
  zoom: 1.4;
  position: relative;
  top: 2px;
  margin-left: 50px;
}
.rightChart{
  width: 600px;
  height: 200px;
  zoom: 1.4;
  position: relative;
  top: -198px;
  margin-left: -200px;
}
.leftChart-num{
  position: relative;
  top: -400px;
  left: 116px;
}
.rightChart-num{
  position: relative;
  top: -424px;
  left: 470px;
}
</style>

