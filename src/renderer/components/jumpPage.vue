<template>
  <div id="jumpWrapper" v-if="isRouterAlive" v-loading="connectionPageLoading">
    <img id="logoSmall" src="~@/assets/ann.png" alt="electron-vue">
    <div id="menu-icon">
        <div>back <el-button type="success" icon="el-icon-back" @click="goBack" circle style="box-shadow:3px 3px 8px 0px rgba(157,163,180,0.4)"></el-button></div>
      </div>
  </div>
</template>

<script>

export default {
  name: 'explor-page',
  components: {
  },
  data () {
    return {
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
      connForm: {
        connURL: ''
      }
    }
  },
  methods: {
    goBack () {
      this.$router.push({ path: '/explor' })
    },
    goJump (Ipath, Iparma) {
      console.log(Ipath, Iparma)
      this.$router.push({ path: Ipath, query: Iparma })
    },
    networkStatus () {
      this.dialogVisible = true
    }
  },
  watch: {
  },
  mounted () {
    console.log('aaaaaaaaaa', this.$route.query.Iparam, this.$route.query.Ipath, this.$route.query.Iparam)
    this.goJump(this.$route.query.Ipath, this.$route.query.Iparam)
  },
  created () {
  },
  computed: {}
}
</script>

<style>
  #jumpWrapper {
    background-image: url("~@/assets/background.png"); 
    height: 100vh;
    padding: 40px 40px;
    width: 100vw;
  }

</style>

