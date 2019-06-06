<template>
  <div id="contractWrapper" v-if="isRouterAlive" v-loading="showLoading" element-loading-text="deploying contract..." element-loading-spinner="el-icon-loading">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <el-steps :active="create_page" align-center finish-status="success" >
      <el-step title="create contract" description=""></el-step>
      <el-step title="deploy contract" description=""></el-step>
    </el-steps>
    <div id="menu-botton">
      <el-button v-show="create_page==0" type="danger" @click="goContract" icon="el-icon-close" round>CANCEL</el-button>
      <el-button v-show="create_page==0" type="success" @click="next_to_depoly('newContract')" icon="el-icon-check" round>NEXT</el-button>
      <el-button v-show="create_page==1" type="danger" @click="create_page-=1" icon="el-icon-close" round>BACK</el-button>
      <el-button v-show="create_page==1" type="success" @click="deploy()" icon="el-icon-check" round>DEPLOY</el-button>
    </div>
    <div id="stepPage">
      <div id="step1" v-show="create_page == 0" >
        <el-form :model="newContract" status-icon :rules="rules" ref="newContract">
          <el-form-item label="contract name" class="title alt" prop="contract_name">
            <el-input v-model="newContract.contract_name" placeholder="a descriptive name for the contract"></el-input>
          </el-form-item>
          <el-form-item label="contract abi" class="title alt" prop="contract_abi">
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 6}" v-model="newContract.contract_abi" placeholder="abi interface of the contract"></el-input>
          </el-form-item>
          <el-form-item label="contract bytecode" class="title alt" prop="contract_bytecode">
            <el-input type="textarea" :autosize="{ minRows: 6, maxRows: 9}" v-model="newContract.contract_bytecode" placeholder="bytecode of the contract"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div id="step2" v-show="create_page == 1" style="margin: 40px 0;text-align: center">
        <p class="title alt">select execute account</p>
        <el-card id="account-card" shadow="hover" @click.native="showAccSelecter()">
          <img id="address-identicon-selected" v-bind:src="selectedAcc.identicon">
          <span id="selectedName" class="title alt">{{selectedAcc.account_name}}</span>&nbsp;&nbsp;&nbsp;<span class="title alt" style="color: red;font-size: 12px">balance: {{selectedAcc.balance_OG}} OG</span>
          <p id="selectedAddr" class="title alt">{{selectedAcc.address}}</p>
        </el-card>
        <p class="title alt" v-if="constFun.inputs">constructor</p>
        <!-- {{constFun}} -->
        <div class="constFunInputs" v-for="(fun, idx) in constFun.inputs" :key="fun.name">
          <el-input v-model="const_input[idx]" :placeholder="fun.type" :clearable=true style="margin-top:10px">
            <template class="input_title" slot="prepend">{{fun.name}}</template>
          </el-input>
        </div>
        <!-- // TODO contract deploy const inputs -->
        <!-- <el-form class="constructorArea" :model="constInputForm" ref="constInputForm">

        </el-form> -->
      </div>
    </div>
    <el-dialog title="SIGNER" :visible.sync="showSigner" width="60%" append-to-body >
      <div style="margin-left: 90px;">
        <img id="address-identicon" v-bind:src="selectedAcc.identicon">
        <div class="title alt inCard" style="margin-top: 10px;">
          {{selectedAcc.account_name}}
        </div>
      </div>
      <div class="title alt inCard" style="margin-top: 10px;margin-left: 50px;display: inline-block;">
        now deploying contract
      </div>
      <div class="title alt inCard" style="margin-top: 10px;margin-left: 10px;display: inline-block;color: red;font-size: 28px">
        {{newContract.contract_name}}
      </div>
      <div class="title alt small" style="margin-top: 10px;">
        enter account password
      </div>
      <el-input v-model="tx.password" placeholder="the account password" type="password" :autofocus=true :clearable=true></el-input>
      <el-button id="signer-button-cancel" type="danger" @click="showSigner = false;tx={password: ''}" icon="el-icon-close" plain style="margin-top: 20px;"> Cancel</el-button>
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
</template>

<script>
import sqlite from '../db/db.js'
import { createIcon } from '@download/blockies'
import C from '../js/common.js'

export default {
  name: 'createContract-page',
  data () {
    var vcontractname = (rule, value, callback) => {
      if (!value) {
        callback(new Error('contract name can not be null'))
      } else if (value.length < 2) {
        callback(new Error('contract name can not less then 2 letter'))
      } else {
        callback()
      }
    }
    var vcontractabi = (rule, value, callback) => {
      if (!value) {
        callback(new Error('contract abi can not be null'))
      } else if (typeof value === 'string') {
        try {
          var obj = JSON.parse(value)
          if (typeof obj === 'object' && obj) {
            callback()
          } else {
            callback(new Error('contract abi fomat error'))
          }
        } catch (e) {
          callback(new Error(e))
        }
      }
    }
    var vcontractbytecode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('contract bytecode can not be null'))
      } else {
        callback()
      }
    }
    return {
      isRouterAlive: true,
      create_page: 0,
      showSelecter: false,
      showSigner: false,
      showLoading: false,
      newContract: {
        contract_name: '',
        contract_abi: '',
        contract_bytecode: ''
      },
      tx: {
        from: '',
        to: '',
        nonce: '',
        data: '',
        value: '',
        signature: '',
        pubkey: '',
        crypto_type: 'secp256k1'
      },
      constInputForm: {},
      rules: {
        contract_name: [
          { validator: vcontractname, trigger: 'blur' }
        ],
        contract_abi: [
          { validator: vcontractabi, trigger: 'blur' }
        ],
        contract_bytecode: [
          { validator: vcontractbytecode, trigger: 'blur' }
        ]
      },
      accountList: [],
      const_input: [],
      selectedAcc: {},
      contract_address: '',
      constFun: [],
      select_const_name: ''
    }
  },
  watch: {},
  route: {},
  computed: {},
  created () {
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
  components: {},
  filters: {},
  methods: {
    goContract () {
      this.$router.push({ path: '/contract' })
    },
    next_to_depoly (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          var abiJSON = C.toJSON(this.newContract.contract_abi)
          console.log('abiJSON', abiJSON)
          var getFun = C.filterGetFun(abiJSON)
          console.log('getFun', getFun)
          var setFun = C.filterSetFun(abiJSON)
          console.log('setFun', setFun)
          var constFun = C.filterConstFun(abiJSON)
          console.log('constFun', constFun)
          this.constFun = constFun[0]
          // TODO contract deploy const inputs
          this.create_page += 1
        } else {
          this.$message({
            message: 'error! Please check the form.',
            type: 'error'
          })
          return false
        }
      })
    },
    showAccSelecter () {
      this.showSelecter = true
      console.log('this.showSelecter', this.showSelecter)
    },
    select (acc) {
      console.log(acc)
      this.selectedAcc = acc
      this.showSelecter = false
    },
    deploy () {
      try {
        console.log('in deploy')
        console.log('const_input', this.constFun, this.const_input)
        var da = C.encodeMethod(this.constFun, this.const_input)
        this.tx.data = this.newContract.contract_bytecode + da
        this.tx.value = '0'
        this.tx.from = this.selectedAcc.address
        this.tx.to = ''
      } catch (e) {
        this.$message({
          message: e.toString(),
          type: 'error'
        })
        return
      }
      this.showSigner = true
    },
    sinerConfirm (tx) {
      console.log('tx', tx)
      try {
        if (tx.password.length < 7) {
          this.$message({
            message: 'the passwords length must be more than 7',
            type: 'error'
          })
        }
        var decPri = C.decryptPrivKey(tx.password, this.selectedAcc.privKey)
        console.log(decPri)
        this.tx.password = ''
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
            tx.nonce = data.data + 1
            var txParams = C.getTxParams(tx.from, tx.to, tx.value, tx.pubKey, tx.pubKey_raw, tx.nonce, tx.data)
            console.log(txParams)
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
              tx.status = 'pending'
              C.saveTransaction(tx, result.data)
              this.showSigner = false
              this.showLoading = true
              setTimeout(
                () => {
                  C.getReceipt(result.data).then((data) => {
                    console.log('data', data)
                    this.contract_address = data.data.contract_address
                    console.log('here', this.newContract.contract_name, this.newContract.contract_abi, result.data)
                    C.saveContract(result.data, this.contract_address, this.newContract.contract_name, this.newContract.contract_abi).then((data) => {
                      if (data.result === 'success') {
                        this.showLoading = false
                        this.$router.push({ path: '/contract' })
                      }
                    })
                    if (data.message) {
                      this.$notify.error({
                        title: 'deploy failed!',
                        message: data.message
                      })
                    } else {
                      this.$notify({
                        title: 'deploy succeed! ',
                        message: data.data.contract_address,
                        type: 'success'
                      })
                    }
                  }).then().catch((e) => {
                    this.showLoading = false
                    this.$notify({
                      title: 'ERROR',
                      message: e.toString(),
                      type: 'error'
                    })
                  })
                }, 10000)
            }
          })
        }
      } catch (e) {
        console.log('err', e)
        this.tx.password = ''
        this.$message({
          message: e.toString(),
          type: 'error'
        })
      }
    }
  },
  mounted () {},
  beforeDestroy () {}
}
</script>

<style>
#contractWrapper {
  background-image: url("~@/assets/background.png"); 
  height: 100vh;
  padding: 40px 40px;
  width: 100vw;
}
#logoSmall{
  height: auto;
  margin-bottom: 20px;
  width: 320px;
}
#stepPage {
  padding: 1% 26%;
  width: 100%;
}
#account-card{
  display: flex;
  height: 108px;
  width: 364px;
  margin: 20px auto;
  /* margin-left: 10px; */
  background-color: transparent;
  background: hsla(0,0%,100%,0.3);
  /* margin-right: 5px; */
  flex: 0 0 32.5%;
}
#selectedName{
  margin-left: 10px;
}
#address-identicon-selected{
  align-self: center;
  width: 45px;
  height: 45px;
  border-radius: 50% !important;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  display: inline-block;
}
#selectedAddr{
  margin-top: 8px;
  padding-bottom: 6px;
}
#accountCards{
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
}
#accountCard{
  height: 80px;
  width: 286px;
  margin-bottom: 4px;
  margin-left: 4px;
  display: flex;
}
#identicon-accList{
  width: 28px;
  height: 28px;
  border-radius: 50% !important;
}
#selectedName-list{
  position: relative;
  top: -10px;
  left: 4px;
  font-size: 14px
}
#selectedAddr-list{
  font-size: 11px
}
.el-textarea__inner{
  background-color: rgba(236,247,247,0.8) !important;
}
.el-input__inner{
  background-color: rgba(236,247,247,0.8) !important;
}
.constructorArea{
  height: 300px;
  overflow-y: auto;
}
</style>