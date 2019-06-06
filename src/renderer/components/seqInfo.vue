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
      title="TRANSACTION LIST"
      :visible.sync="showTxList"
      width="60%"
      >
      <el-card class="txList-card" shadow="hover" :key="item.Hash" v-for="item in seqTx.txs" @click.native="goTxInfo(item.Hash)">
        <i class="el-icon-sort"></i>
        <h3 class="txList-hash">{{item.Hash}}</h3>
        <i class="el-icon-top-right" style="margin-left: 20px"></i>
        <h4 class="txList-fromto">{{item.From}}</h4>
        <i class="el-icon-bottom-right" style="margin-left: 20px"></i>
        <h4 class="txList-fromto">{{item.To}}</h4>
        <i class="el-icon-coin valueIcon"></i>
        <h3 class="txList-value">{{item.Value}} OG</h3>
      </el-card>
    </el-dialog>
    <div class="top-botton">
      <el-button-group>
        <el-button type="success" plain size="small" icon="el-icon-arrow-left" @click="goSeqInfo(seqInfo.Height-1)">prev</el-button>
        <el-button type="success" plain size="small" @click="goSeqInfo(seqInfo.Height+1)">next<i class="el-icon-arrow-right el-icon--right"></i></el-button>
      </el-button-group>
    </div>
    <div class="seqTitle">
      <i class="el-icon-share seqTitleIcon"></i>
      <h2 class="seqTitleWord">SEQUENCER</h2>
      <h2 class="seqTitleNum">{{seqInfo.Height}}</h2>
    </div>
    <div class="seqInfo">
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="el-icon-share seqInfo-card-title"></i>
        <p class="card-item">{{seqInfo.Height}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" @click.native="showTx">
        <i class="el-icon-sort seqInfo-card-title"></i>
          <p class="card-item">{{seqTx.total}}</p>
          <i class="el-icon-arrow-right arrow1" v-if="seqTx.total"></i>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" @click.native="goSeqInfoByHash(seqInfo.Hash)">
        <i class="el-icon-cpu seqInfo-card-title"></i>
          <p class="card-item hash">{{seqInfo.Hash}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" @click.native="showAddress(seqInfo.Issuer)">
        <i class="el-icon-coordinate seqInfo-card-title"></i>
          <p class="card-item Issuer">{{seqInfo.Issuer}}</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="el-icon-box seqInfo-card-title"></i>
          <p class="card-item">{{seqInfo.Weight}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover">
        <i class="el-icon-time seqInfo-card-title"></i>
        <p class="card-item">need timeStamp // TODO</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="el-icon-date seqInfo-card-title"></i>
        <p class="card-item">need timeStamp // TODO</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" @click.native="showParents=clickTime%2;clickTime++">
        <i class="seqInfo-card-title">ParentsHash</i>
        <i class="el-icon-arrow-right arrow2" v-if="!showParents"></i>
        <i class="el-icon-arrow-down arrow2" v-if="showParents"></i>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" v-if="showParents" @click.native="goSeqInfoByHash(seqInfo.ParentsHash[0])">
        <i class="el-icon-bottom-right seqInfo-card-title in"></i>
        <p class="card-item hash">{{seqInfo.ParentsHash[0]}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" v-if="showParents" @click.native="goSeqInfoByHash(seqInfo.ParentsHash[1])">
        <i class="el-icon-bottom-right seqInfo-card-title in"></i>
        <p class="card-item hash">{{seqInfo.ParentsHash[1]}}</p>
      </el-card>
    </div>
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
      monitor: {},
      network_status: 'please check your connection',
      connectionPageLoading: true,
      showTxList: false,
      clickTime: 1,
      sec: 0,
      seqTx: {},
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
      loading: true,
      netWork_warning: false,
      showParents: false,
      seqInfo: {},
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
    goSeqInfo (num) {
      this.$router.push({ path: '/jump', query: { Ipath: '/seqInfo', Iparam: {seqId: num} } })
    },
    goSeqInfoByHash (hash) {
      this.$router.push({ path: '/jump', query: { Ipath: '/seqInfo', Iparam: {hash: hash} } })
    },
    goTxInfo (hash) {
      this.$router.push({ path: '/txInfo', query: { hash: hash } })
    },
    networkStatus () {
      this.dialogVisible = true
    },
    showTx () {
      if (this.seqTx.total > 0) {
        this.showTxList = true
      }
    },
    showAddress (address) {
      this.$router.push({ path: '/addressInfo', query: { address: address } })
    },
    getSeq (num) {
      C.getSeq(num).then((data) => {
        if (data.data) {
          console.log('data here', data)
          this.seqInfo = data.data
        } else {
          this.$message({
            message: num + ' ' + data.message,
            type: 'error'
          })
          this.goSeqInfo(num - 1)
        }
      }).then().catch((e) => {
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      })
    },
    getSeqByHash (hash) {
      C.getSeqByHash(hash).then((data) => {
        if (data.data) {
          console.log('data here', data)
          this.seqInfo = data.data
          this.getSeqTxNum(this.seqInfo.Height)
        } else {
          this.$message({
            message: hash + ' ' + data.message,
            type: 'error'
          })
          this.$router.push({path: '/explor'})
        }
      })
    },
    getSeqTxNum (num) {
      C.getSeqTxNum(num).then((data) => {
        if (data.data) {
          console.log('data here', data)
          this.seqTx = data.data
        } else {
          this.seqTx.total = 0
          this.$message({
            message: num + ' ' + 'sequencer' + ' ' + data.message,
            type: 'error'
          })
        }
      }).then().catch((e) => {
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
    if (this.$route.query.seqId) {
      this.getSeq(this.$route.query.seqId)
      this.getSeqTxNum(this.$route.query.seqId)
    } else if (this.$route.query.hash) {
      this.getSeqByHash(this.$route.query.hash)
    }
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
  .top-botton{
    /* position: absolute; */
    margin-left: 260px;
  }
  .seqTitle{
    display: flex;
    position: absolute;
    left: 300px;
    margin-top: 20px;
  }
  .seqTitleIcon{
    zoom: 3;
    color: rgba(44, 62, 80, 0.85);
  }
  .seqTitleWord{
    margin: 8px 10px;
    color: rgba(44, 62, 80, 0.85);
  }
  .seqTitleNum{
    margin: 8px 10px;
    color: rgba(44, 62, 80);
  }
  .seqInfo{
    margin: 80px 0;
  }
  .seqInfo-card-1{
    width: 60%;
    height: 40px;
    margin: 0 auto;
    background-color: transparent !important;
    background: hsla(0,0%,100%,0.3) !important;
  }
  .seqInfo-card-2{
    width: 60%;
    height: 40px;
    margin: 0 auto;
    background-color: transparent !important;
    background: hsla(0,0%,100%,0.6) !important;
  }
  .el-card{
    border: transparent !important;
  }
  .seqInfo-card-title{
    position: relative;
    top: -10px;
    left: 20px;
  }
  .card-item{
    font-size: 18px;
    position: relative;
    top: -32px;
    left: 160px;
  }
  .arrow1{
    position: relative;
    top: -52px;
    right:-740px;
  }
  .arrow2{
    position: relative;
    top:-10px;
    right:-650px;
  }
  .in{
    margin-left:110px;
  }
  .txList-card{
    margin: 5px auto;
    width: 80%;
    height: 120px;
    overflow-y: auto;
    background-color: aliceblue !important;
  }
  .txList-hash{
    position: relative;
    top: -20px;
    left: 20px;
  }
  .txList-fromto{
    position: relative;
    top: -20px;
    left: 40px;
  }
  .valueIcon{
    position: relative;
    top:-55px;
    left: 500px;
  }
  .txList-value{
    position: relative;
    top: -76px;
    left: 525px;
    color: red;
  }
  .Issuer{
    color: royalblue;
  }
  .hash{
    color: royalblue;
  }
</style>

