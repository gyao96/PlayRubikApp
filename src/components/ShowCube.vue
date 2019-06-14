<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import * as Three from 'three'
import Rubic from './Rubic.js'
export default {
  name: 'ShowCube',
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      object: null,
      context: null
    }
  },
  methods: {
    init: function() {
      let container = document.getElementById('container')
      this.initRender()
      this.initCamera()
      this.initScene()
      // this.initLight()
      // this.initObject()

      container.appendChild(this.renderer.domElement)
    },
    initRender: function() {
      this.renderer = new Three.WebGLRenderer({
        antialias: true,
        context: this.context
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight)
    },
    initCamera: function() {
      this.camera = new Three.PerspectiveCamera(70, container.clientWidth/container.clientHeight, 0.01, 10)
      this.camera.position.z = 1
    },
    initScene: function() {
      this.scene = new Three.Scene()
      let geometry = new Three.BoxGeometry(0.2, 0.2, 0.2)
      let material = new Three.MeshNormalMaterial()

      this.mesh = new Three.Mesh(geometry, material)
      this.scene.add(this.mesh)
    },
    animate: function() {
      requestAnimationFrame(this.animate)
      this.mesh.rotation.x += 0.01
      this.mesh.rotation.y += 0.02
      this.renderer.render(this.scene, this.camera)
    },
    createObject: function () {
      let cube = new Rubic(this)
      cube.model()
    }
  },
  mounted() {
    this.init()
    this.createObject()
    this.animate()
  }
}
</script>

<style scoped>
  #container {
    height: 400px;
    width: 100%;
  }
</style>
