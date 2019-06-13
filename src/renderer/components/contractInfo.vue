<template>
  <div class="contractInfo-page">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <div class="contractButton">
      <el-button  type="success" @click="useqrcode(contract.address)" icon="icon iconfont icon-erweima" round size="small"> QRCODE</el-button>
      <!-- <el-button  type="success" @click="edit(contract)" icon="icon iconfont icon-tubiao09" round size="small"> EDIT</el-button> -->
      <el-popover placement="bottom" width="160" v-model="showDelete" style="margin-left: 10px;">
        <p>Are you sure you want to permanently delete this contract?</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="showDelete = false" style="color:#374b60">no</el-button>
          <el-button type="danger" size="mini" @click="deleteContract(contract.address)">yes</el-button>
        </div>
        <el-button type="danger" icon="icon iconfont icon-shanchu" round size="small" slot="reference"> DELETE</el-button>
      </el-popover>
    </div>
    <div class="Info-card-contract">
      <div slot="header" class="clearfix">
        <img id="address-identicon" src="~@/assets/contract.png">
        <!-- <vue-avatar :username="selectedAcc.account_name"></vue-avatar> -->
        <span class="title alt" style="position: relative;top: -28px;left: 10px">{{ contract.name }}</span>
      </div>
      <div class="title alt inCard" style="margin-top: 10px;">
        <el-button id="copyIcon" type="text" icon="el-icon-news" style="margin-right: 4px;color:#2d3e50;font-size:16px" @click="oneKeyCopy(contract.address)"></el-button>
        {{contract.address}}
      </div>
      <div>
        <canvas id="cqrcode" style="margin-top: 10px;"></canvas>
      </div>
    </div>
    <div class="selecter">
      <div class="title alt" style="margin-top: 28px">Get function</div>
      <el-select v-model="select_get_name" clearable placeholder="please select" >
        <el-option
          v-for="item in getFun"
          :key="item.name"
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select> 
      <div class="getInput" v-show="select_get_name" :key="fun.name" v-for="(fun, idx) in select_get_inputs" >
        <el-input v-model="get_input[idx]" :placeholder="fun.type" :clearable=true style="margin-top:10px">
          <template class="input_title" slot="prepend">{{fun.name}}</template>
        </el-input>
      </div>
      <el-button @click="submit_get" v-if="select_get_name" type="warning" size="small" style="margin-top:10px;float:right;margin-right: 8%;">QUERY</el-button>

      <div class="title alt" style="margin-top: 28px">Set function</div>
      <el-select v-model="select_set_name" clearable placeholder="please select">
        <el-option
          v-for="item in setFun"
          :key="item.name"
          :label="item.name"
          :value="item.name">
        </el-option>
      </el-select>
      <div class="setInput" v-show="select_set_name" :key="fun.name" v-for="(fun, idx) in select_set_inputs">
        <el-input v-model="set_input[idx]" :placeholder="fun.type" :clearable=true style="margin-top:10px">
          <template class="input_title" slot="prepend">{{fun.name}}</template>
        </el-input>
      </div>
      <el-button @click="submit_set" v-if="select_set_name" type="warning" size="small" style="margin-top:10px;float:right;margin-right: 8%;">EXECUTE</el-button>

      <el-dialog title="QUERY RESULT" :visible.sync="showQueryResult" width="80%">
        <div class="title alt">CONTRACT NAME:</div>
        {{contract.name}}
        <div class="title alt" style="margin-top: 18px">CONTRACT ADDRESS:</div>
        {{contract.address}}
        <div class="title alt" style="margin-top: 18px">FUNCTION:</div>
        {{select_get.name}}
        <div class="title alt" style="margin-top: 18px" v-if="select_get_inputs.length">PARAMETER:</div>
        <div :key="item.name" v-for="(item) in select_get.inputs">
          {{item.name}}({{item.type}}): {{item.value}}
        </div>
        <div class="title alt" style="margin-top: 18px" v-if="select_get_inputs">ENCODE DATA:</div>
        {{encodeData}}
        <div class="title alt" style="margin-top: 18px">RESULT:</div>
        <div class="resultArea" v-loading="resultLoading" element-loading-text="query...">
          <!-- {{queryResult}} -->
          {{queryResultdecode}}
        </div>
        <div class="resultAreaErr">
          {{err}}
        </div>
        <el-button @click="showQueryResult = false" type="success" size="small" style="margin-top:40px;margin-left: 94%">OK</el-button>

      </el-dialog>
      <el-dialog title="EXECUTE CONTRACT" :visible.sync="showExecute" width="80%">
        <div class="title alt">CONTRACT NAME:</div>
        {{contract.name}}
        <div class="title alt" style="margin-top: 18px">CONTRACT ADDRESS:</div>
        {{contract.address}}
        <div class="title alt" style="margin-top: 18px">FUNCTION:</div>
        {{select_set.name}}
        <div class="title alt" style="margin-top: 18px" v-if="this.select_set_inputs.length">PARAMETER:</div>
        <div :key="item.name" v-for="(item) in select_set.inputs">
          {{item.name}}({{item.type}}): {{item.value}}
        </div>
        <div class="title alt" style="margin-top: 18px" v-if="select_set_inputs">ENCODE DATA:</div>
          {{encodeData}}
        <el-button @click="signerShow = true" type="success" size="small" style="margin-top:40px;margin-left: 90%">EXECUTE</el-button>
      </el-dialog>
      <el-dialog width="60%" title="SIGNER" :visible.sync="signerShow" append-to-body>
        <p class="title alt" style="text-align: center">select execute account</p>
        <el-card id="account-card" shadow="hover" @click.native="showAccSelecter()">
          <img id="address-identicon-selected" v-bind:src="selectedAcc.identicon">
          <span id="selectedName" class="title alt">{{selectedAcc.account_name}}</span>&nbsp;&nbsp;&nbsp;<span class="title alt" style="color: red;font-size: 12px">balance: {{selectedAcc.balance_OG}} OG</span>
          <p id="selectedAddr" class="title alt">{{selectedAcc.address}}</p>
        </el-card>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px;display: inline-block;">
          transfer to contract
        </div>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 10px;display: inline-block;color: red;font-size: 18px">
          {{contract.address}}
        </div>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px">
          amount
        </div>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px;color: red;">
          {{tx.amount}} OG
        </div>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px">
          data
        </div>
        <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px">
          {{encodeData}}
        </div>
        <div class="title alt small" style="margin-top: 10px;">
          enter account password
        </div>
        <el-input v-model="tx.password" placeholder="the account password" type="password" :autofocus=true :clearable=true></el-input>
        <el-button id="signer-button-cancel" type="danger" @click="signerShow=false;showExecute=false;tx.password= ''" icon="el-icon-close" plain style="margin-top: 20px;"> Cancel</el-button>
        <el-button id="signer-button-confirm" type="success" @click="sinerConfirm(tx)" icon="el-icon-check" style="margin-top: 20px;"> Confirm Requst</el-button>
      </el-dialog>
      <el-dialog title="my account list" :visible.sync="showSelecter" top="10%" width="45%">
        <p>select an account to execute contract</p>
        <div id="accountCards">
          <el-card id="accountCard" :key="account.account_name" v-for="account in accountList" shadow="hover" @click.native="select(account)">
            <img id="identicon-accList" v-bind:src="account.identicon">
            <span id="selectedName-list" class="title alt">{{account.account_name}}</span>
            <p id="selectedAddr-list" class="title alt">{{account.address}}</p>
          </el-card>
        </div>
      </el-dialog>
    </div>
    <div id="menu-icon" >
      <div>back <el-button type="success" icon="el-icon-back" @click="goBack" circle style="box-shadow:3px 3px 8px 0px rgba(157,163,180,0.4)"></el-button></div>
    </div>
  </div>
</template>
<script>
import sqlite from '../db/db.js'
import copy from 'copy-to-clipboard'
import QRCode from 'qrcode'
import C from '../js/common.js'
import { createIcon } from '@download/blockies'

export default {
  name: 'contractInfo-page',
  data () {
    return {
      contract: {},
      abi: [],
      getFun: [],
      setFun: [],
      constFun: [],
      select_get: {},
      select_set: {},
      select_get_name: '',
      select_set_name: '',
      select_get_inputs: [],
      select_set_inputs: [],
      get_input: [],
      set_input: [],
      queryFun: {},
      exeFun: {},
      selectedAcc: {},
      accountList: [],
      showQueryResult: false,
      showExecute: false,
      showDelete: false,
      signerShow: false,
      showSelecter: false,
      encodeData: '',
      resultLoading: true,
      queryResult: '',
      queryResultdecode: '',
      err: '',
      tx: {
        from: '',
        to: '',
        amount: 0,
        data: '',
        password: ''
      }
    }
  },
  watch: {
    select_get_name () {
      console.log(this.select_get_name)
      this.return_select_get_inputs(this.select_get_name)
    },
    select_set_name () {
      console.log(this.select_set_name)
      this.return_select_set_inputs(this.select_set_name)
    },
    showQueryResult () {
      if (!this.showQueryResult) {
        this.queryResult = ''
        this.queryResultdecode = ''
        this.err = ''
        this.resultLoading = true
      }
    }
  },
  route: {},
  computed: {},
  created () {
  },
  components: {
    QRCode: QRCode
  },
  filters: {},
  methods: {
    goBack () {
      this.$router.push({ path: '/contract' })
    },
    oneKeyCopy (data) {
      copy(data)
      this.$message({
        message: '"' + data + '" copied to clipboard.',
        type: 'success'
      })
    },
    useqrcode (data) {
      var canvas = document.getElementById('cqrcode')
      QRCode.toCanvas(canvas, data, function (error) {
        if (error) console.error(error)
        console.log('QRCode creat success!')
      })
    },
    analysisAbi () {
      this.abi = JSON.parse(this.contract.abi)
      console.log(this.abi)
      this.getFun = C.filterGetFun(this.abi)
      console.log('getFun', this.getFun)
      this.setFun = C.filterSetFun(this.abi)
      console.log('setFun', this.setFun)
      this.constFun = C.filterConstFun(this.abi)
      console.log('constFun', this.constFun)
    },
    submit_get () {
      try {
        this.getFun.map((v, idx) => {
          if (v.name === this.select_get.name) {
            this.queryFun = v
          }
        })
        console.log('queryFun', this.queryFun)
        if (this.select_get_inputs.length) {
          console.log('this.select_get_inputs', this.select_get_inputs)
          this.get_input.map((v, index) => {
            this.select_get_inputs[index].value = v
          })
          this.abi.map((item, index) => {
            if (item.name === this.queryFun.name) {
              var arg = []
              this.queryFun.inputs.map((input, index) => {
                arg.push(input.value)
              })
              console.log(item, arg)
              console.log('in here1')
              this.encodeData = C.encodeMethod(this.queryFun, arg)
              console.log(this.encodeData)
            }
          })
        } else {
          console.log('in here2')
          this.encodeData = C.encodeMethod(this.queryFun, [])
          console.log(this.encodeData)
        }
        this.query(this.encodeData)
        this.showQueryResult = true
      } catch (e) {
        console.log(e)
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      }
    },
    submit_set () {
      try {
        this.setFun.map((v, idx) => {
          if (v.name === this.select_set.name) {
            this.exeFun = v
          }
        })
        console.log('exeFun', this.exeFun)
        if (this.select_set_inputs.length) {
          console.log('this.select_set_inputs', this.select_set_inputs)
          this.set_input.map((v, index) => {
            this.select_set_inputs[index].value = v
          })
          this.abi.map((item, index) => {
            if (item.name === this.exeFun.name) {
              var arg = []
              this.exeFun.inputs.map((input, index) => {
                arg.push(input.value)
              })
              console.log(item, arg)
              this.encodeData = C.encodeMethod(this.exeFun, arg)
              console.log(this.encodeData)
            }
          })
        } else {
          this.encodeData = C.encodeMethod(this.queryFun, [])
          console.log(this.encodeData)
        }
        this.showExecute = true
      } catch (e) {
        console.log(e)
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      }
    },
    return_select_get_inputs (data) {
      this.getFun.map((v, index) => {
        if (v.name === data) {
          this.select_get = v
          this.select_get_inputs = v.inputs
        }
      })
    },
    return_select_set_inputs (data) {
      this.setFun.map((v, index) => {
        if (v.name === data) {
          this.select_set = v
          this.select_set_inputs = v.inputs
        }
      })
    },
    deleteContract (addr) {
      C.deleteContract(addr).then((data) => {
        if (data.result === 'success') {
          this.$notify({
            title: 'contract delete success',
            message: 'contract ' + this.contract.name + 'has been deleted.',
            type: 'success'
          })
          this.$router.push({ path: '/contract' })
        }
      })
    },
    showAccSelecter () {
      this.showSelecter = true
    },
    select (account) {
      console.log(account)
      this.selectedAcc = account
      this.showSelecter = false
    },
    query (data) {
      C.queryContract(this.contract.address, data.slice(2)).then((data) => {
        this.resultLoading = false
        console.log(data)
        if (data.body.data) {
          this.queryResult = data.body.data
          console.log(this.queryFun, this.queryResult)
          this.queryResultdecode = C.decodeMethod(this.queryFun, '0x' + this.queryResult)
        } else {
          this.err = data.body.message
        }
      }).then().catch((e) => {
        this.resultLoading = false
        this.err = e.toString()
      })
      // console.log(data)
      // var exeAcc = C.getExeAcc()
      // console.log('exeAcc', exeAcc)
      // var tx = {}
      // tx.data = data.slice(2)
      // tx.from = exeAcc.address
      // tx.to = this.contract.address
      // tx.pubKey = exeAcc.public
      // tx.pubKey_raw = exeAcc.public_raw
      // tx.nonce = 0
      // tx.amount = 0
      // var txParams = C.getTxParams(tx.from, tx.to, tx.amount, tx.pubKey, tx.pubKey_raw, tx.nonce, tx.data)
      // console.log('txParams', txParams)
      // var signTarget = C.genRawTransaction(txParams)
      // console.log('signTarget', signTarget)
      // var signature = C.signRawTransaction(signTarget, exeAcc.privateKey)
      // console.log('signature', signature)
      // var TX = C.makeUpTransaction(txParams, signature)
      // console.log('TX', TX)
      // C.sendTransaction(TX).then((data) => {
      //   console.log(data)
      //   var result = JSON.parse(data.body)
      //   if (result.message) {
      //     this.$notify({
      //       title: 'query failed!',
      //       message: result.message,
      //       type: 'error'
      //     })
      //     this.resultLoading = false
      //     this.err = result.message
      //   } else {
      //     this.$notify({
      //       title: 'query sended!',
      //       message: result.data,
      //       type: 'success'
      //     })
      //     setTimeout(() => {
      //       C.getReceipt(result.data).then((data) => {
      //         this.resultLoading = false
      //         if (data.data) {
      //           console.log('getReceipt', data)
      //           this.queryResult = data.data.result || 'null'
      //           if (this.queryResult !== 'null') {
      //             this.queryResultdecode = C.decodeMethod(this.queryFun, this.queryResult)
      //           }
      //         } else {
      //           this.err = data.message
      //           this.$notify({
      //             title: data.message,
      //             type: 'error'
      //           })
      //         }
      //       })
      //     }, 5000)
      //   }
      // })
    },
    sinerConfirm (tx) {
      tx.data = this.encodeData
      tx.from = this.selectedAcc.address
      tx.to = this.contract.address
      console.log(tx)
      try {
        if (tx.password.length < 7) {
          this.$message({
            message: 'the passwords length must be more than 7',
            type: 'error'
          })
        }
        var decPri = C.decryptPrivKey(tx.password, this.selectedAcc.privKey)
        console.log(decPri)
        if (decPri === '') {
          console.log('err')
          this.$message({
            message: 'WRONG PASSWORD! Please try again.',
            type: 'error'
          })
          this.tx.password = ''
        } else {
          tx.pubKey = this.selectedAcc.pubKey
          tx.pubKey_raw = this.selectedAcc.pubKey_raw
          C.getNonce(tx.from).then((data) => {
            console.log(data)
            tx.nonce = data.data + 1
            var txParams = C.getTxParams(tx.from, tx.to, tx.amount, tx.pubKey, tx.pubKey_raw, tx.nonce, tx.data)
            console.log('txParams', txParams)
            var signTarget = C.genRawTransaction(txParams)
            console.log('signTarget', signTarget)
            var signature = C.signRawTransaction(signTarget, decPri)
            console.log('signature', signature)
            var TX = C.makeUpTransaction(txParams, signature)
            console.log('TX', TX)
            return C.sendTransaction(TX)
          }).then((data) => {
            console.log(data)
            var result = JSON.parse(data.body)
            if (result.message) {
              this.$notify.error({
                title: 'transaction failed!',
                message: result.message
              })
            } else {
              this.$notify({
                title: 'transaction sended!',
                message: result.data,
                type: 'success'
              })
              this.signerShow = false
              this.showExecute = false
              // save transaction
              tx.status = 'pending'
              C.saveTransaction(tx, result.data)
            }
          })
        }
      } catch (e) {
        console.log(Error.toString())
        if (Error.toString() === 'Error: Malformed UTF-8 data') {
          this.$message({
            type: 'error',
            message: 'WRONG PASSWORD! Please try again.'
          })
          this.tx.password = ''
        } else {
          this.$message({
            type: 'error',
            message: Error.toString()
          })
          this.tx.password = ''
        }
      }
    }
  },
  mounted () {
    var contractAddr = this.$route.query.contractAddr
    console.log(contractAddr)
    var sql = 'SELECT * FROM contract WHERE address == "' + contractAddr + '"'
    console.log(sql)
    sqlite.query(sql).then((data) => {
      console.log(data)
      this.contract = data.data[0]
      this.analysisAbi()
    }).then().catch((err) => {
      console.log(err)
    })
    sqlite.query('SELECT * FROM usr').then((data) => {
      this.accountList = data.data
      for (var j = 0; j < this.accountList.length; j++) {
        var seed = this.accountList[j].address
        this.accountList[j].identicon = createIcon({ // All options are optional
          seed, // seed used to generate icon data, default: random
          size: 10, // width/height of the icon in blocks, default: 10
          scale: 5 // width/height of each block in pixels, default: 5
        }).toDataURL()
      }
      this.selectedAcc = this.accountList[0]
    })
  },
  beforeDestroy () {}
}
</script>
<style scope>
.contractInfo-page{
  background-image: url("~@/assets/background.png"); 
  height: 100vh;
  padding: 40px 40px;
  width: 100vw;
}

.Info-card-contract{
  margin-top: 120px;
}

.contractButton{
  position: absolute;
  right: 40px;
}

.selecter{
  position: absolute;
  right: 40px;
  top: 220px;
  width: 60%;
  height: 57%;
  background-color: transparent;
  overflow-y: auto;
}

.selecter::-webkit-scrollbar {display:none}

.el-select{
  width: 100%;
}

.getInput{
  width: 88%;
  margin:0 auto;
}

.setInput{
  width: 88%;
  margin:0 auto;
}

.el-input-group__prepend{
  width: 100px !important;
}

.resultArea{
  background-color: #f0f9eb;
}

.resultAreaErr{
  background-color: #fef0f0;
}

</style>
