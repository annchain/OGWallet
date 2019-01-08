<template >
  <div id="wrapper" v-loading="loading">
    <img id="logo" src="~@/assets/ann.png" alt="electron-vue">
    <!-- <img id="logo" src="~@/assets/logo.png" alt="electron-vue"> -->
    <main v-if="isRouterAlive">
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
      <el-dialog
        title="NODE INFO"
        :visible.sync="dialogVisible"
        width="50%"
        top="0.5%"
        :show-close="false">
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
        <span  class="title alt">connection url:</span>
        <el-input v-model="connURL" placeholder="please input the connection url." style="margin-top: 10px">
          <template slot="prepend">http://</template>
        </el-input>
        <span slot="footer" class="dialog-footer">
          <el-button type="danger" round @click="dialogVisible2 = false">cancel</el-button>
          <el-button type="success" round @click="setConnetction">set</el-button>
        </span>
      </el-dialog>
      <div class="left-side">
        <span class="title">
          Welcome to Ola! An annchain.og wallet.
        </span>
        <!-- <system-information></system-information> -->
      </div>
      <div class="right-side">
        <div class="doc">
          <div class="title">Getting Started</div>
          <p>
            Ola 1.11 Beta is here: a faster, simple OG client. This huge update to OG allows you to create encrypted contracts and transactions on-chain. 
          </p>
          <el-button type="success" @click="goCreatAccount"  icon="el-icon-plus" round style="margin-top: 10px">creat account</el-button>
          <el-button type="success" @click="goImportAccount" icon="el-icon-download" round style="margin-top: 10px">Import account</el-button>
        </div>
        <div class="doc" style="margin-top: 15%">
          <div class="title alt">Other Documentation</div>
          <el-button type="success" icon="icon iconfont icon-wangzhan" plain @click="open('http://www.annchain.io/' )" style="margin-top: 10px"> website</el-button>
          <el-button type="success" icon="icon iconfont icon-github1" plain @click="open('https://github.com/annchain/OG')" style="margin-top: 10px"> github</el-button>
        </div>
      </div>
    </main>
    <div id="menu-icon">
      <div>index <el-button type="success" icon="icon iconfont icon-caidan1" @click="goAccount" circle></el-button></div>
    </div>
  </div>
</template>

<script>
  import SystemInformation from './IndexPage/SystemInformation'
  import C from '../js/common.js'
  import sqlite from '../db/db.js'
  import config from '../config/config.js'

  export default {
    name: 'index-page',
    data () {
      return {
        isRouterAlive: true,
        netWork_RED: true,
        netWork_GREEN: false,
        nowLinkTo: '',
        network_status: 'please check your connection',
        dialogVisible: false,
        dialogVisible2: false,
        connURL: '',
        loading: true
      }
    },
    created: function () {
      sqlite.createTable('CREATE TABLE IF NOT EXISTS usr (account_name CHAR, account_hint CHAR, address CHAR PRIMARY KEY UNIQUE, pubKey CHAR UNIQUE, pubKey_raw CHAR UNIQUE, privKey CHAR UNIQUE, balance_OG DOUBLE DEFAULT (0))').then((data) => {
        console.log(data)
        return sqlite.createTable('CREATE TABLE IF NOT EXISTS txHistory (txHash CHAR PRIMARY KEY UNIQUE, cStatus CHAR, cFrom CHAR, cTo CHAR, cAmount DOUBLE, ConfirmTime CHAR)')
      }).then((data) => {
        console.log(data)
        return sqlite.query('SELECT * FROM usr')
      }).then().catch((err) => {
        console.log('err=', err)
      })
      sqlite.createTable('CREATE TABLE IF NOT EXISTS conn (id INT PRIMARY KEY UNIQUE, url CHAR)').then((data) => {
        console.log(data)
        var initurl = config.OG_RPC.HttpProvider
        sqlite.execute('INSERT INTO conn VALUES (?,?)', [1, initurl])
        return sqlite.query('SELECT * FROM conn where id = 1')
        // return C.getNetInfo()
      }).then((data) => {
        console.log(data.data[0])
        this.nowLinkTo = data.data[0].url
        return C.getNetInfo()
      }).then((data) => {
        console.log(data)
        if (data === 4001) {
          this.netWork_GREEN = false
          this.netWork_RED = true
        } else {
          this.network_status = data
          this.netWork_GREEN = true
          this.netWork_RED = false
          this.loading = false
        }
      }).then().catch((err) => {
        console.log(err)
        this.netWork_GREEN = false
        this.netWork_RED = true
      })
    },
    components: { SystemInformation },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      networkStatus () {
        this.dialogVisible = true
      },
      setConnetction () {
        C.changeConn('http://' + this.connURL).then((data) => {
          if (data.result === 'success') {
            console.log(data.data)
          }
        })
        this.dialogVisible2 = false
        this.loading = true
        this.$message({
          message: 'Connection setup successful. Please restart client',
          type: 'a',
          showClose: false,
          duration: 0
        })
      },
      goAccount () {
        this.$router.push({ path: '/account' })
        C.checkTxStatus()
      },
      goCreatAccount () {
        this.$router.push({ path: '/creatAccount' })
      },
      goImportAccount () {
        this.$router.push({ path: '/importAccount' })
      },
      reload () {
        this.isRouterAlive = false
        this.$nextTick(function () {
          this.isRouterAlive = true
        })
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #networkStatus{
    position: absolute;
    top:5%;
    right:2%;
  }

  #networkStatusWords{
    position: absolute;
    top:5.3%;
    right:4.5%;
  }

  #networkStatusInfo{
    word-wrap: break-word;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  #menu-icon {
    position: absolute;
    right: 30px;
    bottom: 30px;
    color: #2c3e51;
    font-weight: bold;
    font-family:"Arial";
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .title.alt {
    font-size: 18px;
    margin-bottom: 5px;
  }

  .title.alt.small {
    font-size: 14px;
    margin-bottom: 5px;
    font-weight: normal;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc button {
    font-size: 0.8em;
    cursor: pointer;
    outline: none;
    padding: 0.8em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    /* background-color: #4fc08d; */
    transition: all 0.15s ease;
    box-sizing: border-box;
    /* border: 1px solid #4fc08d; */
    margin-bottom: 10px;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
