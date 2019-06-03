<template>
  <div class="importContractWrapper" v-if="isRouterAlive">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <el-steps :active="import_page" align-center finish-status="success" >
      <el-step title="import contract" description=""></el-step>
    </el-steps>
    <div id="menu-botton">
      <el-button  type="danger" @click="goContract" icon="el-icon-close" round>CANCEL</el-button>
      <el-button  type="success" @click="impContract" icon="el-icon-check" round>IMPORT</el-button>
    </div>
    <div class="importForm">
      <el-form :model="importContract" status-icon :rules="rules" ref="importContract">
        <el-form-item label="contract name" class="title alt" prop="contract_name">
          <el-input v-model="importContract.contract_name" placeholder="a descriptive name for the contract"></el-input>
        </el-form-item>
        <el-form-item label="contract address" class="title alt" prop="contract_address">
          <el-input v-model="importContract.contract_address" placeholder="the address of this contract"></el-input>
        </el-form-item>
        <el-form-item label="contract abi" class="title alt" prop="contract_abi">
          <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8}" v-model="importContract.contract_abi" placeholder="abi interface of the contract"></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import C from '../js/common.js'

export default {
  name: 'importContract-page',
  components: {
  },
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
    var vcontractaddress = (rule, value, callback) => {
      if (!value) {
        callback(new Error('contract address can not be null'))
      } else if (value.substr(0, 2) !== '0x') {
        callback(new Error('contract address format error, expect start with "0x"'))
      } else if (value.length !== 42) {
        callback(new Error('contract address format error, expect address length 42'))
      } else {
        callback()
      }
    }
    return {
      isRouterAlive: true,
      import_page: 0,
      importContract: {
        contract_name: '',
        contract_abi: '',
        contract_address: ''
      },
      rules: {
        contract_name: [
          { validator: vcontractname, trigger: 'blur' }
        ],
        contract_abi: [
          { validator: vcontractabi, trigger: 'blur' }
        ],
        contract_address: [
          { validator: vcontractaddress, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    goContract () {
      this.$router.push({ path: '/contract' })
    },
    impContract () {
      var txHash = ''
      console.log(txHash, this.importContract.contract_address, this.importContract.contract_name, this.importContract.contract_abi)
      C.saveContract(txHash, this.importContract.contract_address, this.importContract.contract_name, this.importContract.contract_abi).then((data) => {
        console.log(data)
        if (data.result === 'success') {
          this.$notify({
            title: 'import succeed!',
            type: 'success'
          })
          this.$router.push({ path: '/contract' })
        } else {
          this.$notify({
            title: 'import failed!',
            message: data.error.toString(),
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

<style>
  .importContractWrapper {
    background-image: url("~@/assets/background.png"); 
    height: 100vh;
    padding: 40px 40px;
    width: 100vw;
  }
  .importForm{
    padding: 1% 26%;
    width: 100%;
  }
</style>
