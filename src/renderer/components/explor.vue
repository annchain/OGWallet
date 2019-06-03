<template>
  <div id="explorWrapper" v-if="isRouterAlive" v-loading="explorPageLoading">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <div id="networkStatusWords">
        <div class="title alt" v-if="netWork_GREEN">NETWORK STATUS: {{nowLinkTo}}
          <!-- <el-button type="text" size="medium">{{nowLinkTo}}</el-button> -->
        </div>
        <div class="title alt" v-if="netWork_RED">NETWORK STATUS: {{nowLinkTo}}</div>
      </div>
      <div id="networkStatus">
        <el-button type="success" icon="el-icon-check" circle @click="networkStatus" v-if="netWork_GREEN" size="mini"></el-button>
        <el-button type="danger" icon="el-icon-close" circle @click="networkStatus" v-if="netWork_RED" size="mini"></el-button>
      </div>
      <div class="searchInput">
        <el-input
          placeholder="seq_id / tx / address"
          v-model="search"
          clearable>
          <el-button type="primary" slot="append" icon="el-icon-search" @click="search"></el-button>
        </el-input>
      </div>
      <el-dialog
        title="NODE INFO"
        :visible.sync="dialogVisible"
        width="50%"
        top="0.5%"
        :show-close="false"
        style="overflow: hidden">
        <div class="title alt small" style="margin-top: 10px;">now connecting to ...</div>
        <div id="networkStatusInfo">
          {{nowLinkTo}}
        </div>
        <div class="title alt small" style="margin-top: 10px;">info:</div>
        <div id="networkStatusInfo">
          <pre style="overflow-x: auto;white-space: pre-line;">
            <code>{{network_status}}</code>
          </pre>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button type="warning" round @click="dialogVisible = false;dialogVisible2 = true">change connection</el-button>
          <el-button type="success" round @click="dialogVisible = false">ok</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="SET CONNECTION"
        :visible.sync="dialogVisible2"
        width="50%"
        :show-close="false">
        <el-form :model="connForm" status-icon :rules="rules" ref="connForm">
          <el-form-item class="title alt" label="connection url:" prop="connURL">
            <el-input v-model="connForm.connURL" placeholder="please input the connection url." style="margin-top: 10px">
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
      <el-card class="explor-card" shadow="hover" @click.native="showHeight">
        <h2 class="card-title">Last Sequencer</h2>
        <div class="card-info">
          <el-button type="text" @click="showHeight" v-if="netWork_GREEN">{{monitor.status.latestHeight}}</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="explor-card" shadow="hover">
        
      </el-card>
      <el-card class="explor-card" shadow="hover">
        <h2 class="card-title">Tps</h2>
        <div class="card-info">
          <el-button type="text" v-if="netWork_GREEN">{{monitor.tps}}</el-button>
          <el-button type="text" v-if="netWork_RED">net work error</el-button>
        </div>
      </el-card>
      <el-card class="explor-card" shadow="hover">
        
      </el-card>
    </div>
    <div id="menu-icon">
        <div>explor <el-button type="success" icon="icon iconfont icon-jiaoyiguanli" @click="goIndex" circle></el-button></div>
      </div>
  </div>
</template>

<script>
import C from '../js/common.js'
import sqlite from '../db/db.js'

export default {
  name: 'explor-page',
  components: {
  },
  data () {
    var validateConn = (rule, value, callback) => {
      if (!value) {
        callback(new Error('connection url can not be null!'))
      } else {
        callback()
      }
    }
    return {
      monitor: {},
      network_status: 'please check your connection',
      explorPageLoading: true,
      sec: 0,
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
      search: '',
      loading: true,
      netWork_warning: false,
      connForm: {
        connURL: ''
      },
      rules: {
        connURL: [
          { validator: validateConn, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    goIndex () {
      this.$router.push({ path: '/' })
    },
    goCreatAccount () {
      this.$router.push({ path: '/' })
    },
    goImportAccount () {
      this.$router.push({ path: '/' })
    },
    networkStatus () {
      this.dialogVisible = true
    },
    queryMonitor () {
      C.getMonitor().then((data) => {
        console.log(data)
        this.monitor = data.data
        this.explorPageLoading = false
      }).then().catch((e) => {
        this.explorPageLoading = false
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      })
    },
    showHeight () {
      // alert(this.monitor.status.height)
    },
    setConnetction (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          C.changeConn('http://' + this.connForm.connURL).then((data) => {
            if (data.result === 'success') {
              console.log(data.data)
              this.explorPageLoading = true
              this.dialogVisible2 = false
              this.$message({
                message: 'Connection setup successful. Please restart the client.',
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
    }
  },
  watch: {
  },
  mounted () {
  },
  created () {
    sqlite.query('SELECT * FROM conn where id = 1').then((data) => {
      console.log(data.data[0])
      this.nowLinkTo = data.data[0].url
      return C.getNetInfo()
    }).then((data) => {
      console.log('data', data)
      if (data === 4001) {
        this.netWork_GREEN = false
        this.netWork_RED = true
        this.netWork_warning = true
      } else {
        this.network_status = data.data
        this.netWork_GREEN = true
        this.netWork_RED = false
        this.loading = false
        this.indexPageLoading = false
        this.netWork_warning = false
      }
    }).then().catch((err) => {
      console.log('err', err)
      this.netWork_GREEN = false
      this.netWork_RED = true
      this.netWork_warning = true
    })
    this.queryMonitor()
    setInterval(() => {
      this.queryMonitor()
    }, 1000)
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
  }
  .explor-top{
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
  }
  .explor-card{
    width: 24.5%;
    height: 140px;
    margin-left: 4px;
    background-color: transparent !important;
    background: hsla(0,0%,100%,0.3) !important;
    text-align: center;
  }
  .card-info{
    margin-top: 10px;
    zoom:1.4;
  }
  .searchInput{
    position: absolute;
    right: 20px;
    top: 64px;
    width: 30%;
  }
</style>

