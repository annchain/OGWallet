<template>
  <div id="connectionWrapper" v-if="isRouterAlive" v-loading="connectionPageLoading">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <div id="networkStatusWords">
      <div class="title alt" v-if="netWork_GREEN">NETWORK STATUS: {{nowLinkTo}}
      </div>
      <div class="title alt" v-if="netWork_RED">NETWORK STATUS: {{nowLinkTo}}</div>
    </div>
    <div id="networkStatus">
      <el-button type="success" icon="el-icon-check" circle @click="networkStatus" v-if="netWork_GREEN" size="mini"></el-button>
      <el-button type="danger" icon="el-icon-close" circle @click="networkStatus" v-if="netWork_RED" size="mini"></el-button>
    </div>
    <div class="title alt large connTitle">CONNECTION LIST</div>
    <div class="connectList">
      <el-card class="connectItem-title" shadow="always">
        <div class="title1">localAddress</div>
        <div class="title2">remoteAddress</div>
        <div class="title3">name</div>
        <div class="title4">id</div>
        <div class="title5">last_seq</div>
      </el-card>
      <el-card class="connectItem" shadow="hover" :key="item.short_id" v-for="item in connection" @click.native="showDetial(item)">
        <div class="lcaddr">
          <el-button type="text" >{{item.network.localAddress}}</el-button>
        </div>
        <div class="readdr">
          <el-button type="text" >{{item.network.remoteAddress}}</el-button>
        </div>
        <div class="name">{{item.name}}</div>
        <div class="id">{{item.short_id}}</div>
        <div class="lsseq">
          <el-button type="text" >{{item.protocols.og.sequencer_id}}</el-button>
        </div>
      </el-card>
    </div>
    <el-dialog
      title="NODE INFO"
      :visible.sync="dialogVisible"
      width="50%"
      top="0.5%"
      :show-close="false"
      style="overflow: auto">
      <div class="title alt small" style="margin-top: 10px;">now connecting to ...</div>
      <div id="networkStatusInfo">
        {{nowLinkTo}}
      </div>
      <div class="title alt small" style="margin-top: 10px;">info:</div>
      <div id="networkStatusInfo">
        <pre style="overflow-x: auto;white-space: pre-line;">
          <json-viewer
            :value="network_status"
            :expand-depth=5
            copyable
            boxed
            sort></json-viewer>
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
    <el-dialog
      title="CONNECTION NODE INFO"
      :visible.sync="showNodeInfo"
      width="50%"
      top="10%"
      :show-close="false">
      <json-viewer
        :value="nodeInfo"
        :expand-depth=5
        copyable
        boxed
        sort></json-viewer>
    </el-dialog>
    <div id="menu-icon">
        <div>back <el-button type="success" icon="el-icon-back" @click="goBack" circle></el-button></div>
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
      connection: [],
      monitor: {},
      network_status: 'please check your connection',
      connectionPageLoading: true,
      sec: 0,
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
      loading: true,
      netWork_warning: false,
      showNodeInfo: false,
      nodeInfo: {},
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
    goBack () {
      this.$router.push({ path: '/explor' })
    },
    networkStatus () {
      this.dialogVisible = true
    },
    showDetial (item) {
      this.showNodeInfo = true
      this.nodeInfo = item
    },
    queryPeer () {
      C.getPeer().then((data) => {
        var res = JSON.parse(data)
        this.connection = res.data
        this.explorPageLoading = false
      }).then().catch((e) => {
        this.explorPageLoading = false
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      })
    },
    setConnetction (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          C.changeConn('http://' + this.connForm.connURL).then((data) => {
            if (data.result === 'success') {
              // console.log(data.data)
              this.connectionPageLoading = true
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
    this.queryPeer()
    setInterval(() => {
      this.queryPeer()
    }, 1000)
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
        this.connectionPageLoading = false
        this.netWork_warning = false
      }
    }).then().catch((err) => {
      console.log('err', err)
      this.netWork_GREEN = false
      this.netWork_RED = true
      this.netWork_warning = true
    })
  },
  computed: {}
}
</script>

<style>
  #connectionWrapper {
    background-image: url("~@/assets/background.png"); 
    height: 100vh;
    padding: 40px 40px;
    width: 100vw;
  }
  .connectList{
    width: 100%;
    height: 500px;
    overflow-y: auto;
  }
  .connectItem-title{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    margin: 8px 60px;
    height: 40px;
    background-color: transparent !important;
    background: hsla(0,0%,100%,0.3) !important;
  }
  .connectItem{
    margin: 8px 60px;
    height: 60px;
    background-color: transparent !important;
    background: hsla(0,0%,100%,0.3) !important;
  }
  .title1{
    position: relative;  
    left:60px;
    margin-top: -10px;
  }
  .title2{
    position: relative;  
    left:280px;
    margin-top: -20px;
  }
  .title3{
    position: relative;  
    left:520px;
    margin-top: -20px;
  }
  .title4{
    position: relative;  
    left:760px;
    margin-top: -20px;
  }
  .title5{
    position: relative;  
    left:1000px;
    margin-top: -20px;
  }
  .lcaddr{
    position: relative;  
    left:36px;
    margin-top: -10px;
  }
  .readdr{
    position: relative;  
    left:264px;
    margin-top: -40px;
  }
  .name{
    position: relative;  
    left:528px;
    margin-top: -30px;
  }
  .id{
    position: relative;  
    left:710px;
    margin-top: -20px;
  }
  .lsseq{
    position: relative;  
    left:1010px;
    margin-top: -30px;
  }
  .connTitle{
    margin-left:60px;
  }
</style>

