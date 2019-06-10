<template>
  <div id="addressInfoWrapper" v-if="isRouterAlive" v-loading="connectionPageLoading">
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
    <div class="addressTitle">
      <img class="addressIcon" v-bind:src="identicon">
      <h2 class="addressTitleWord">ADDRESS</h2>
      <h2 class="addressTitleHash">{{this.$route.query.address}}</h2>
    </div>
    <div class="addressInfo">
      <el-card class="seqInfo-card-1" shadow="hover">
        <img class="addressIcon-card" v-bind:src="identicon">
        <!-- <i class="el-icon-sort seqInfo-card-title"></i> -->
        <p class="card-item">{{this.$route.query.address}}</p>
      </el-card>
      <el-card class="seqInfo-card-2" shadow="hover">
        <i class="el-icon-coin seqInfo-card-title"></i>
        <p class="card-item">{{addressInfo.balance.balance}} OG</p>
      </el-card>
      <el-card class="seqInfo-card-1" shadow="hover">
        <i class="seqInfo-card-title">nonce</i>
        <p class="card-item">{{addressInfo.nonce}}</p>
      </el-card>
      <div class="addressTxList">
        <el-card class="addressTxInfo" shadow="hover" :key="item.Hash" v-for="item in this.addressInfo.tx.txs" @click.native="goTxInfo(item.Hash)">
          <i class="el-icon-sort"></i>
          <h3 class="txList-hash">{{item.Hash}}</h3>
          <i class="el-icon-top-right" style="margin-left: 20px"></i>
          <h4 class="txList-fromto">{{item.From}}</h4>
          <i class="el-icon-bottom-right" style="margin-left: 20px"></i>
          <h4 class="txList-fromto">{{item.To}}</h4>
          <i class="el-icon-coin valueIcon"></i>
          <h3 class="txList-value">{{item.Value}} OG</h3>
        </el-card>
      </div>
    </div>
    <div id="menu-icon">
      <div>back <el-button type="success" icon="el-icon-back" @click="goBack" circle></el-button></div>
    </div>
  </div>
</template>

<script>
import C from '../js/common.js'
import sqlite from '../db/db.js'
import { createIcon } from '@download/blockies'

export default {
  name: 'explor-page',
  components: {
    createIcon: createIcon
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
      identicon: '',
      sec: 0,
      addressInfo: {
        balance: {
          balance: 0
        },
        nonce: 0,
        tx: {
          txs: {
            Hash: '',
            From: '',
            To: '',
            Value: ''
          }
        }
      },
      isRouterAlive: true,
      dialogVisible: false,
      dialogVisible2: false,
      netWork_RED: true,
      netWork_GREEN: false,
      nowLinkTo: '',
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
    goTxInfo (hash) {
      this.$router.push({ path: '/txInfo', query: { hash: hash } })
    },
    getAddressInfo (address) {
      this.getBalance(address)
      this.getNonce(address)
      this.getTransaction(address)
    },
    getTransactionByAddress () {
      C.getTransactionByAddress.then((data) => {
        if (data.data) {
          this.addressInfo.txHistory = data.data
        } else {
          this.$message({
            message: 'query transaction error: ' + data.message,
            type: 'error'
          })
        }
      })
    },
    getTransaction (address) {
      C.getTransactionByAddress(address).then((data) => {
        if (data.data) {
          this.addressInfo.tx = data.data
        } else {
          this.$message({
            message: 'query transaction list error: ' + data.message,
            type: 'error'
          })
        }
      })
    },
    getBalance (address) {
      C.getBalance(address).then((data) => {
        if (data.data) {
          this.addressInfo.balance = data.data
        } else {
          this.$message({
            message: 'query balance error: ' + data.message,
            type: 'error'
          })
        }
      })
    },
    getNonce (address) {
      C.getNonce(address).then((data) => {
        if (data.data) {
          this.addressInfo.nonce = data.data
        } else {
          this.$message({
            message: 'query nonce error: ' + data.message,
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
    var seed = this.$route.query.address
    this.identicon = createIcon({ // All options are optional
      seed, // seed used to generate icon data, default: random
      size: 10, // width/height of the icon in blocks, default: 10
      scale: 8 // width/height of each block in pixels, default: 5
    }).toDataURL()
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
        this.getAddressInfo(this.$route.query.address)
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
  #addressInfoWrapper {
    background-image: url("~@/assets/background.png"); 
    height: 100vh;
    padding: 40px 40px;
    width: 100vw;
    overflow: hidden;
  }
  .addressTitle{
    display: flex;
    position: absolute;
    left: 300px;
  }
  .addressTitleWord{
    margin: 16px 20px;
    color: rgba(44, 62, 80, 0.85);
  }
  .addressTitleHash{
    margin: 20px 10px;
    color: rgba(44, 62, 80);
    font-size: 20px;
  }
  .addressIcon{
    width: 58px;
    height: 58px;
    /* display: flex; */
    border-radius: 50% !important;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .addressInfo{
    margin: 80px 0;
  }
  .addressIcon-card{
    position: relative;
    top: -40px;
    left: 90px;
    zoom: 0.2;
    border-radius: 50% !important;
  }
  .addressTxList{
    margin-top:40px;
    height: 310px;
    overflow-y: auto;
  }
  .addressTxList::-webkit-scrollbar {display:none}
  .addressTxInfo{
    width: 60%;
    height: 140px;
    margin: 10px auto;
    background-color: aliceblue !important;
  }
</style>
