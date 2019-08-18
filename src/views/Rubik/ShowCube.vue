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
      touchLine: null,
      // the raycasters and params
      raycaster: null,
      intersect: null,
      normalize: null,
      targetRubik: null,
      anotherRubik: null,
      // sliding event on the cube
      startPoint: null,
      movePoint: null,
      last_move: null,
      isRotating: false
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
      this.raycaster = new THREE.Raycaster()
      window.addEventListener('resize', this.adjustView)
      document.addEventListener('mousedown', this.handleMouseEvent, {passive: false})
      document.addEventListener('mouseup', this.handleMouseEvent)
      document.addEventListener('mousemove', this.handleMouseEvent)
      document.addEventListener('touchstart', this.handleMouseEvent, {passive: false})
      document.addEventListener('touchend', this.handleMouseEvent)
      document.addEventListener('touchmove', this.handleMouseEvent)
    },
    adjustView: function(){
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    getViewDirection(type,startPoint,movePoint){
        let direction;
        let rad = 30*Math.PI/180;
        let lenX = movePoint.x - startPoint.x;
        let lenY = movePoint.y - startPoint.y;
        if(type==this.frontViewName){
            if(startPoint.x>window.innerWidth/2){
                if (Math.abs(lenY) > Math.abs(lenX) * Math.tan(rad)){
                    if(lenY<0){
                        direction = 2.1;
                    }else{
                        direction = 3.1;
                    }
                }else{
                    if(lenX>0){
                        direction = 0.3;
                    }else{
                        direction = 1.3;
                    }
                }
            }else{
                if (Math.abs(lenY) > Math.abs(lenX) * Math.tan(rad)) {
                    if (lenY < 0) {
                        direction = 2.4;
                    } else {
                        direction = 3.4;
                    }
                } else {
                    if (lenX > 0) {
                        direction = 4.4;
                    } else {
                        direction = 5.4;
                    }
                }
            }
        }else{
            if (startPoint.x > window.innerWidth / 2) {
                if (Math.abs(lenY) > Math.abs(lenX) * Math.tan(rad)) {
                    if (lenY < 0) {
                        direction = 2.2;
                    } else {
                        direction = 3.2;
                    }
                } else {
                    if (lenX > 0) {
                        direction = 1.4;
                    } else {
                        direction = 0.4;
                    }
                }
            } else {
                if (Math.abs(lenY) > Math.abs(lenX) * Math.tan(rad)) {
                    if (lenY < 0) {
                        direction = 2.3;
                    } else {
                        direction = 3.3;
                    }
                } else {
                    if (lenX > 0) {
                        direction = 5.3;
                    } else {
                        direction = 4.3;
                    }
                }
            }
        }
        return direction;
    },
    getViewRotateCubeIndex(type){
            if (type == this.frontViewName){
                return 10;
            }else{
                return 65;
            }
        },
    rotateView(){
        let self = this;
        if (this.startPoint.y < this.touchLine.screenRect.top){
            this.targetRubik = this.frontRubik;
            this.anotherRubik = this.endRubik;
        } else if (this.startPoint.y > this.touchLine.screenRect.top + this.touchLine.screenRect.height){
            this.targetRubik = this.endRubik;
            this.anotherRubik = this.frontRubik;
        }
        if (this.targetRubik && this.anotherRubik){
            this.isRotating = true;//转动标识置为true
            //计算整体转动方向
            let targetType = this.targetRubik.group.childType;
            let cubeIndex = this.getViewRotateCubeIndex(targetType);
            let direction = this.getViewDirection(targetType, this.startPoint, this.movePoint);
            this.targetRubik.rotateMoveWhole(cubeIndex, direction);
            this.anotherRubik.rotateMoveWhole(cubeIndex, direction, function () {
                self.resetRotateParams();
            });
        }
    },
    handleMouseEvent(e){
      switch(e.type){
        case 'touchstart': {
          if (e.cancelable) {
            if (!e.defaultPrevented) {
              e.preventDefault()
            }
          }
          this.startPoint = null
          this.last_move = e.touches[0]
          if(this.touchLine.isHover(e.touches[0])){
            console.log("touchline enable")
            this.touchLine.enable()
          } else {
            this.getIntersects(e.touches[0])
            if(!this.isRotating){
              if(this.intersect){
                this.startPoint = this.intersect.point
              } else {
                this.startPoint = new THREE.Vector2(e.touches[0].clientX, e.touches[0].clientY)
              }
            }
          }
        } break;
        case 'mousedown': {
          this.startPoint = null
          this.last_move = e
          if(this.touchLine.isHover(e)){
            this.touchLine.enable()
          } else {
            this.getIntersects(e)
            if(!this.isRotating){
              if(this.intersect){
                this.startPoint = this.intersect.point
              } else {
                this.startPoint = new THREE.Vector2(e.clientX, e.clientY)
              }
            }
          }
        } break;
        case 'mousemove': {
          this.last_move = e
          if(this.touchLine.isActive){
            this.touchLine.move(e.clientY)
            let frontPercent = e.clientY / window.innerHeight;
            let endPercent = 1 - frontPercent
            this.rubikResize(frontPercent, endPercent)
          } else {
            // console.log('should move'+" "+this.isRotating+':'+this.startPoint+this.intersect)
            if(!this.isRotating && this.startPoint && !this.intersect) {
              this.movePoint = new THREE.Vector2(e.clientX, e.clientY)
              if(!this.movePoint.equals(this.startPoint)) {
                this.rotateView();
              }
            }
          }
        } break;
        case 'touchmove': {
          this.last_move = e.touches[0];
          if(this.touchLine.isActive){
            this.touchLine.move(e.touches[0].clientY)
            let frontPercent = e.touches[0].clientY / window.innerHeight
            let endPercent = 1 - frontPercent
            this.rubikResize(frontPercent, endPercent);
          } else {
            if(!this.isRotating && this.startPoint && !this.intersect) {
              this.movePoint = new THREE.Vector2(e.touches[0].clientX, e.touches[0].clientY)
              if(!this.movePoint.equals(this.startPoint)) {
                this.rotateView();
              }
            }
          }
        } break;
        case 'mouseup':
        case 'touchend': {
          this.touchLine.disable()
          this.getIntersects(this.last_move)
          if (!this.isRotating && this.startPoint && this.intersect) {//滑动点在魔方上且魔方没有转动
            this.movePoint = this.intersect.point
            // console.log(this.intersect)
            console.log('move point', this.movePoint, 'start point', this.startPoint)
            if (!this.movePoint.equals(this.startPoint)) {//触摸点和滑动点不一样则意味着可以得到转动向量
              console.log('they are not the same')
              this.rotateRubik();
            }
          }
          e.returnValue = true
        } break;
        default: {}
      }
    },
    getIntersects(e){
      let mouse = new THREE.Vector2()
      mouse.x = (e.clientX / this.width) * 2 - 1
      mouse.y = -(e.clientY / this.height) * 2 + 1

      this.raycaster.setFromCamera(mouse, this.camera)

      let rubikTypeName
      if(this.touchLine.screenRect.top>e.clientY){
        this.targetRubik = this.frontRubik
        this.anotherRubik = this.endRubik
        rubikTypeName = 'frontView'
      } else if(this.touchLine.screenRect.top+this.touchLine.screenRect.height<e.clientY){
        this.targetRubik = this.endRubik
        this.anotherRubik = this.frontRubik
        rubikTypeName = 'endView'
      }
      let targetIntersect
      for(let i=0; i<this.scene.children.length; i++){
        if(this.scene.children[i].childType === rubikTypeName) {
          targetIntersect = this.scene.children[i]
          break
        }
      }
      if (targetIntersect) {
        let intersects = this.raycaster.intersectObjects(targetIntersect.children);
        // console.log(intersects)
        if (intersects.length >= 2) {
          if (intersects[0].object.cubeType === 'coverCube') {
            this.intersect = intersects[1];
            this.normalize = intersects[0].face.normal;
          } else {
            this.intersect = intersects[0];
            this.normalize = intersects[1].face.normal;
          }
        } else {
          this.intersect = null
          this.normalize = null
        }
      // console.log(this.intersect)
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
    },
    rotateRubik: function(){
      const self = this
      self.isRotating = true
      let sub = this.movePoint.sub(this.startPoint)  //计算转动向量
      console.log('sub', sub)
      let direction = this.targetRubik.getDirection(sub, this.normalize) //计算转动方向
      let cubeIndex = this.intersect.object.cubeIndex;
      this.targetRubik.rotateMove(cubeIndex, direction);
      let anotherIndex = cubeIndex - this.targetRubik.minCubeIndex + this.anotherRubik.minCubeIndex;
      this.anotherRubik.rotateMove(anotherIndex, direction, function () {
        self.resetRotateParams();
      });
    },
    resetRotateParams: function() {
      this.isRotating = false;
      this.targetRubik = null;
      this.anotherRubik = null;
      this.intersect = null;
      this.normalize = null;
      this.startPoint = null;
      this.movePoint = null;
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
    display: flex;
    flex-flow: column;
    margin: 0;
    display: block;
  }
  body {
    overflow: hidden;
  }
</style>
