import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
// import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../../static/fonts/iconfont.css'

import JsonViewer from 'vue-json-viewer'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// Vue.use(zarmVue)
Vue.use(ElementUI)
Vue.use(JsonViewer)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  // store,
  template: '<App/>'
}).$mount('#app')
