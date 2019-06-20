<template>
  <div style="border-width: 10px; border-color: red;">
    <div id="container" ></div>
  </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import * as THREE from 'three'
import Rubik from './Rubik.js'
export default {
  name: 'ShowCube',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      object: null,
      viewCenter: new THREE.Vector3(0,0,0),
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
  methods: {
    init: function() {
      let container = document.getElementById('container')
      this.initRender()
      this.initCamera()
      this.initScene()
      this.initLight()
      this.createObject()

      container.appendChild(this.renderer.domElement)
    },
    initRender: function() {
      let container = document.getElementById('container')
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.container,
        antialias: true,
        alpha: true,
      });
      this.renderer.setSize(this.width, this.height)
      this.renderer.setClearColor(0xFFFFFF, 1.0)
      container.width = this.width * this.devicePixelRatio
      container.height = this.height * this.devicePixelRatio
      this.renderer.setPixelRatio(this.devicePixelRatio)
    },
    initCamera: function() {
      let container = document.getElementById('container')
      this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 1, 1500)
      this.camera.position.set(0, 0, 300 / this.camera.aspect)
      this.camera.up.set(0,1,0)
      this.camera.lookAt(this.viewCenter)
    },
    initScene: function() {
      this.scene = new THREE.Scene()
    },
    initLight() {
      this.light = new THREE.AmbientLight(0xfefefe);
      this.scene.add(this.light);
    },
    render: function () {
      let container = document.getElementById('container')
      this.renderer.clear()
      this.renderer.render(this.scene, this.camera)
      // requestAnimationFrame(this.render.bind(this))
    },
    createObject: function () {
      let cube = new Rubik(this)
      cube.model()
    }
  },
  mounted() {
    this.init()
    this.render()
  }
}
</script>

<style scoped>
  #container {
    height: 100%;
    width: 100%;
    margin-width: 50px;
    margin-color: red;
  }
</style>
