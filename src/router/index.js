import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'
import ShowCube from '@/components/ShowCube'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ShowCube',
      component: ShowCube
    }
  ]
})
