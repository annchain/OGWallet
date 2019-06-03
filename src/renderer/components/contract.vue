<template>
  <div id="contractWrapper" v-if="isRouterAlive" v-loading="contractPageLoading" element-loading-text="LOADING...">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <p class="title alt" style="position:absolute;top:38%;left:45%" v-if="!contractList.length">HERE IS EMPTY</p>
    <p class="title alt" style="position:absolute;top:41%;left:39%" v-if="!contractList.length">PLEASE CREAT OR WATCH AN CONTRACT</p>
    <div id="accountButtonBIG" v-if="!contractList.length">
      <el-button type="success" @click="goCreateContract"  icon="el-icon-plus" round>creat contract</el-button>
      <el-button type="success" @click="goImportContract" icon="el-icon-download" round style="margin-top: 10px">import contract</el-button>
    </div>
    <div id="accountButton" v-if="contractList.length">
      <el-button type="success" @click="goCreateContract"  icon="el-icon-plus" round>creat contract</el-button>
      <el-button type="success" @click="goImportContract" icon="el-icon-download" round style="margin-top: 10px">import contract</el-button>
    </div>
    <div class="title alt large" v-if="contractList.length">CONTRACT LIST</div>
    <div class="contractLisrArea" v-if="contractList.length">
      <el-card id="box-card" :key="contract.name" v-for="contract in contractList" shadow="hover" @click.native="contractInfo(contract)">
        <div>
          <img id="address-identicon-accList" src="~@/assets/contract.png">
          <span  class="title alt" style="position: relative;top: -14px;left: 10px">{{ contract.name }}</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="contractInfo(contract)">Info</el-button>
        </div>
        <div class="title alt inCard" style="margin-top: 42px">
          {{ contract.address }}
        </div>
      </el-card>
    </div>
    <div id="menu-icon">
        <div>contract <el-button type="success" icon="icon iconfont icon-jiaoyiguanli" @click="goIndex" circle></el-button></div>
      </div>
  </div>
</template>

<style>
  #contractWrapper {
    background-image: url("~@/assets/background.png"); 
    height: 100vh;
    padding: 40px 40px;
    width: 100vw;
  }

  #modeSelecter { 
    padding: 1% 26%;
    width:100%;
  }

  #success_container{
    width:100px;
    height:100px; 
    margin:0 auto;
  }

  #success_logo{
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-bottom: 20px;
  }

  #input {
    margin-bottom: 3px;
  }

  #icon {
    display: flex;
    flex-direction: column;
  }

  #qrcode{
    background-color: transparent;
  }

  .contractLisrArea{
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    width: 100%;
    height: 65%;
    overflow-y: auto;
    margin-top: 46px;
  }

</style>

<script>
import sqlite from '../db/db.js'

export default {
  name: 'contract-page',
  components: {
  },
  data () {
    return {
      contractPageLoading: true,
      isRouterAlive: true,
      contractList: []
    }
  },
  created () {
    setTimeout(() => {
      sqlite.query('SELECT * FROM contract').then((data) => {
        console.log(data)
        this.contractList = data.data
        this.contractPageLoading = false
      }).then().catch((err) => {
        console.log(err)
        this.contractPageLoading = false
      })
    }, 300)
  },
  methods: {
    goIndex () {
      this.$router.push({ path: '/' })
    },
    goExplor () {
      this.$router.push({ path: '/explor' })
    },
    goCreateContract () {
      this.$router.push({ path: '/createContract' })
    },
    goImportContract () {
      this.$router.push({ path: '/importContract' })
    },
    contractInfo (contract) {
      console.log(contract)
      this.$router.push({ path: '/contractInfo', query: {contractAddr: contract.address} })
    }
  }
}
</script>