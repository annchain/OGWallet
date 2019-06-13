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
    <div class="txTitle">
      <i class="el-icon-sort txTitleIcon"></i>
      <h2 class="txTitleWord">TRANSACTION</h2>
      <h2 class="txTitleHash">{{this.$route.query.hash}}</h2>
    </div>
    <div class="txInfo">
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="el-icon-sort seqInfo-card-title"></i>
        <p class="card-item">{{txInfo.Hash}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" @click.native="goAddressInfo(txInfo.From)">
        <i class="el-icon-top-right seqInfo-card-title"></i>
        <p class="card-item address">{{txInfo.From}}</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" @click.native="goAddressInfo(txInfo.To)">
        <i class="el-icon-bottom-right seqInfo-card-title"></i>
        <p class="card-item address">{{txInfo.To}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover">
        <i class="el-icon-coin seqInfo-card-title"></i>
        <p class="card-item">{{txInfo.Value}} OG</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" @click.native="goSeqInfo(txInfo.To)">
        <i class="el-icon-share seqInfo-card-title"></i>
        <p class="card-item seqHeight">{{txInfo.Height}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover">
        <i class="el-icon-c-scale-to-original seqInfo-card-title"></i>
        <p class="card-item">{{txInfo.AccountNonce}}</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="el-icon-box seqInfo-card-title"></i>
        <p class="card-item">{{txInfo.Weight}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover">
        <i class="el-icon-paperclip seqInfo-card-title"></i>
        <p class="card-item">{{txInfo.Data||'0x'}}</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" @click.native="showParents=clickTime%2;clickTime++">
        <i class="seqInfo-card-title">ParentsHash</i>
        <i class="el-icon-arrow-right arrow2" v-if="!showParents"></i>
        <i class="el-icon-arrow-down arrow2" v-if="showParents"></i>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover" v-if="showParents" @click.native="goSeqInfoByHash(txInfo.ParentsHash[0])">
        <i class="el-icon-bottom-right seqInfo-card-title in"></i>
        <p class="card-item hash">{{txInfo.ParentsHash[0]}}</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover" v-if="showParents" @click.native="goSeqInfoByHash(txInfo.ParentsHash[1])">
        <i class="el-icon-bottom-right seqInfo-card-title in"></i>
        <p class="card-item hash">{{txInfo.ParentsHash[1]}}</p>
      </el-card>
    </div>
    <div id="menu-icon">
        <div>back <el-button type="success" icon="el-icon-back" @click="goBack" circle style="box-shadow:3px 3px 8px 0px rgba(157,163,180,0.4)"></el-button></div>
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
      sec: 0,
      clickTime: 1,
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      showParents: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
      txInfo: {},
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
    goBack () {
      this.$router.push({ path: '/explor' })
    },
    goAddressInfo (address) {
      this.$router.push({ path: '/addressInfo', query: { address: address } })
    },
    goSeqInfoByHash (hash) {
      this.$router.push({ path: '/seqInfo', query: {hash: hash} })
    },
    goSeqInfo (num) {
      this.$router.push({ path: '/seqInfo', query: { seqId: num } })
    },
    getTxInfo (hash) {
      C.getTransaction(hash).then((data) => {
        if (data.data) {
          this.txInfo = data.data
        } else {
          this.$message({
            message: data.message,
            type: 'error'
          })
        }
      })
    },
    networkStatus () {
      this.dialogVisible = true
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
        this.getTxInfo(this.$route.query.hash)
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
  .txTitle{
    display: flex;
    position: absolute;
    left: 300px;
    /* margin-top: 20px; */
  }
  .txTitleIcon{
    zoom: 3;
    color: rgba(44, 62, 80, 0.85);
  }
  .txTitleWord{
    margin: 8px 10px;
    color: rgba(44, 62, 80, 0.85);
  }
  .txTitleHash{
    margin: 10px 10px;
    color: rgba(44, 62, 80);
    font-size: 20px;
  }
  .txInfo{
    margin: 80px 0;
  }
  .address{
    color:royalblue;
  }
  .seqHeight{
    color:royalblue;
  }
</style>
