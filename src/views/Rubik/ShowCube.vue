<template>
    <div id="container" ></div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import * as THREE from 'three'
import Rubik from './Rubik.js'
import TouchLine from "./TouchLine";
// require('three/examples/js/controls/OrbitControls.js')
export default {
  name: 'ShowCube',
  data() {
    return {
      camera: null,
      orbitController: null,
      scene: null,
      renderer: null,
      mesh: null,
      object: null,
      frontRubik: null,
      endRubik: null,
      viewCenter: new THREE.Vector3(0,0,0),
      width: window.innerWidth,
      height: window.innerHeight,
      minPercent: 0.25,
      originHeight: 0,
      touchLine: null
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
      window.addEventListener('resize', this.adjustView)
      document.addEventListener('mousedown', this.handleMouseEvent)
      document.addEventListener('mouseup', this.handleMouseEvent)
      document.addEventListener('mousemove', this.handleMouseEvent)
    },
    adjustView: function(){
      console.log(this.camera.aspect)
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    handleMouseEvent(e){
      switch(e.type){
        case 'mousedown': {
          if(this.touchLine.isHover(e)){
            this.touchLine.enable()
          }
        } break;
        case 'mouseup': {
          this.touchLine.disable()
        } break;
        case 'mousemove': {
          if(this.touchLine.isActive){
            this.touchLine.move(e.clientY);
            let frontPercent = e.clientY / window.innerHeight;
            let endPercent = 1 - frontPercent;
            this.rubikResize(frontPercent, endPercent);
          }
        }
        default: {console.log('never here')}
      }
    },
    initRender: function() {
      let container = document.getElementById('container')
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.container,
        antialias: true,
        alpha: true,
      });
      this.renderer.setSize(this.width, this.height)
      this.renderer.setClearColor(0xfafdcb, 1.0)
      this.renderer.setPixelRatio(window.devicePixelRatio);//设置设备像素比
      document.getElementById('container').appendChild(this.renderer.domElement);//把渲染器放置到页面中
      // container.width = this.width  * this.devicePixelRatio
      // container.height = this.height * this.devicePixelRatio
      // this.renderer.setPixelRatio(this.devicePixelRatio)
    },
    initCamera: function() {
      let container = document.getElementById('container')
      this.camera = new THREE.PerspectiveCamera(45, this.width/this.height, 1, 1500)
      this.camera.position.set(0, 0, 600 / this.camera.aspect)
      this.camera.up.set(0,1,0)
      this.camera.lookAt(this.viewCenter)

      // Orbit Control
      // this.orbitController = new THREE.OrbitControls(this.camera, this.renderer.domElement)
      // this.orbitController.enableZoom = false;
      // this.orbitController.rotateSpeed = 2;
      // this.orbitController.target = this.viewCenter

      // front end control
      this.originHeight = Math.tan(22.5/180*Math.PI)*this.camera.position.z*2
      this.originWidth = this.originHeight * this.camera.aspect;


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
      requestAnimationFrame(this.render.bind(this))
    },
    createObject: function () {
      this.frontRubik = new Rubik(this)
      this.frontRubik.model('frontView')
      this.frontRubik.resizeHeight(0.5,1);
      this.endRubik = new Rubik(this)
      this.endRubik.model('endView')
      this.endRubik.resizeHeight(0.5,-1);
      this.touchLine = new TouchLine(this);
    },
    rubikResize: function(frontPercent, endPercent){
      this.frontRubik.resizeHeight(frontPercent, 1)
      this.endRubik.resizeHeight(endPercent, -1)
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
  }
</style>
