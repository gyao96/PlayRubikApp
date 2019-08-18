<template>
    <div id="container" ></div>
</template>

<script>
// eslint-disable-next-line
/* eslint-disable */
import * as THREE from 'three'
import Rubik from './Rubik.js'
import TouchLine from './object/TouchLine.js'
import ResetBtn from './object/ResetBtn.js'
import ShuffleBtn from './object/ShuffleBtn.js'
import GithubBtn from './object/GithubBtn.js'
const TWEEN = require('@tweenjs/tween.js')
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
      initialFrontPercent: 0.75,
      originHeight: 0,
      originWidth: 0,
      touchLine: null,
      resetBtn: null,
      shuffleBtn: null,
      githubBtn: null,
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
      isRotating: false,
      isAnimationEnd: false,
      uiRatio: 0
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
    },
    initEvent(){
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
          }
          else if(this.resetBtn.isHover(e.touches[0])){
            console.log('reset btn enable')
            this.resetBtn.enable()
          }
          else if(this.shuffleBtn.isHover(e.touches[0])){
            console.log('shuffle btn enable')
            this.shuffleBtn.enable()
          }
          else if(this.githubBtn.isHover(e.touches[0])){
            console.log('github btn enable')
            this.githubBtn.enable()
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
          }
          else if(this.resetBtn.isHover(e)){
            console.log('reset btn enable')
            this.resetBtn.enable()
          }
          else if(this.shuffleBtn.isHover(e)){
            console.log('shuffle btn enable')
            this.shuffleBtn.enable()
          }
          else if(this.githubBtn.isHover(e)){
            console.log('github btn enable')
            this.githubBtn.enable()
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
            if (!this.movePoint.equals(this.startPoint)) {//触摸点和滑动点不一样则意味着可以得到转动向量
              console.log('they are not the same')
              this.rotateRubik();
            }
          } else if (!this.isRotating && this.resetBtn.isActive && this.resetBtn.isHover(this.last_move)) {
            this.frontRubik.reset()
            this.resetBtn.disable()
          } else if (!this.isRotating && this.shuffleBtn.isActive && this.shuffleBtn.isHover(this.last_move)) {
            this.shuffleRubik(this.initEvent)
            this.shuffleBtn.disable()
          } else if (!this.isRotating && this.githubBtn.isActive && this.githubBtn.isHover(this.last_move)) {
            window.open('https://github.com/DaddyGang/PlayRubikApp')
            this.githubBtn.disable()
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
      this.originWidth = this.originHeight * this.camera.aspect
      this.uiRatio = this.originWidth / window.innerWidth

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
      this.frontRubik.resizeHeight(0.75,1)
      this.endRubik = new Rubik(this)
      this.endRubik.model('endView')
      this.endRubik.resizeHeight(0.25,-1)
      this.touchLine = new TouchLine(this)
      this.resetBtn = new ResetBtn(this)
      this.shuffleBtn = new ShuffleBtn(this)
      this.githubBtn = new GithubBtn(this)
      this.enterAnimation()
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
    shuffleRubik(callback){
      let self = this;
      if(!this.isRotating){
          this.isRotating = true;
          let stepArr = this.frontRubik.randomRotate();
          this.endRubik.runMethodAtNo(stepArr, 0, function(){
              if (callback){
                  callback();
              }
              self.resetRotateParams();
          });
      }
    },
    resetRotateParams: function() {
      this.isRotating = false;
      this.targetRubik = null;
      this.anotherRubik = null;
      this.intersect = null;
      this.normalize = null;
      this.startPoint = null;
      this.movePoint = null;
    },
    enterAnimation() {
      let self = this;
      let isAnimationEnd = false;

      let endStatus = {//目标状态
          rotateY: this.frontRubik.group.rotation.y,
          y: this.frontRubik.group.position.y,
          z: this.frontRubik.group.position.z
      }

      this.frontRubik.group.rotateY(-90 / 180 * Math.PI);//把魔方设置为动画开始状态
      this.frontRubik.group.position.y += this.originHeight/3;
      this.frontRubik.group.position.z -= 350;

      let startStatus = {//开始状态
          rotateY: this.frontRubik.group.rotation.y,
          y: this.frontRubik.group.position.y,
          z: this.frontRubik.group.position.z
      }

      let tween = new TWEEN.Tween(startStatus)
                      .to(endStatus, 2000)
                      .easing(TWEEN.Easing.Quadratic.In)
                      .onUpdate(function () {
                          self.frontRubik.group.rotation.y = startStatus.rotateY;
                          self.frontRubik.group.position.y = startStatus.y
                          self.frontRubik.group.position.z = startStatus.z
                      }).onComplete(function(){
                          isAnimationEnd = true;
                      });

      function animate(time) {
          if (!isAnimationEnd){
              requestAnimationFrame(animate);
              TWEEN.update();
          }
      }

      setTimeout(function(){
          tween.start();
          requestAnimationFrame(animate);
      },500)

      let stepArr = this.frontRubik.randomRotate();
      this.endRubik.runMethodAtNo(stepArr, 0, function () {
          self.initEvent();//进场动画结束之后才能进行手动操作
      });
    },
    initSize() {
      this.touchline.enable()
      this.touchLine.move(window.innerHeight / 4 * 3)
      let frontPercent = 0.75
      let endPercent = 1 - frontPercent
      this.rubikResize(frontPercent, endPercent);
      this.touchline.disable()
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
