import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home/Home.vue')
    },
    {
      path: '/showcube',
      name: 'showcube',
      component: () => import('../views/Rubik/ShowCube.vue')
    }
  ]
})
