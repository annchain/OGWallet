import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index-page',
      component: require('@/components/IndexPage').default
    },
    {
      path: '/account',
      name: 'account-page',
      component: require('@/components/account').default
    },
    {
      path: '/createAccount',
      name: 'createAccount-page',
      component: require('@/components/createAccount').default
    },
    {
      path: '/importAccount',
      name: 'importAccount-page',
      component: require('@/components/importAccount').default
    },
    {
      path: '/contract',
      name: 'contract-page',
      component: require('@/components/contract').default
    },
    {
      path: '/createContract',
      name: 'createContract-page',
      component: require('@/components/createContract').default
    },
    {
      path: '/importContract',
      name: 'importContract-page',
      component: require('@/components/importContract').default
    },
    {
      path: '/contractInfo',
      name: 'contractInfo-page',
      component: require('@/components/contractInfo').default
    },
    {
      path: '/explor',
      name: 'explor-page',
      component: require('@/components/explor').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
