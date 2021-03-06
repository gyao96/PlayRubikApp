import * as THREE from 'three'

export default class TouchLine {

  constructor(main) {
    this.main = main;

    let self = this;

    //实际尺寸
    this.realWidth = 1536;
    this.realHeight = 70;

    //逻辑尺寸
    this.width = this.main.originWidth;
    this.height = this.realHeight * this.width / this.realWidth;

    this.screenRect = {
      width: window.innerWidth,
      height: this.realHeight * window.innerWidth / self.realWidth
    }
    this.screenRect.left = 0;
    this.screenRect.top = main.initialFrontPercent * window.innerHeight - this.screenRect.height / 2;
    //加载图片
    let loader = new THREE.TextureLoader();
    loader.load(require('../../../assets/touch-line.png'), function (texture) {
      let geometry = new THREE.PlaneGeometry(self.width, self.height);
      let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      self.plane = new THREE.Mesh(geometry, material);
      self.plane.position.set(0, -main.originHeight * (1-main.initialFrontPercent), 0);
      self.main.scene.add(self.plane)
    }, function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (xhr) {
      console.log('An error happened');
    });
  }

  isHover(eventPos) {
    let isHover = false;
    if (eventPos.clientY >= this.screenRect.top && eventPos.clientY <= this.screenRect.top + this.screenRect.height && eventPos.clientX >= this.screenRect.left && eventPos.clientX <= this.screenRect.left + this.screenRect.width) {
      isHover = true;

    }
    return isHover;
  }
  enable() {
    this.isActive = true;
  }
  disable() {
    this.isActive = false;
  }
  move(y){
    if (this.isActive) {
      if (y < window.innerHeight * this.main.minPercent || y > window.innerHeight * (1 - this.main.minPercent)) {
        if (y < window.innerHeight * this.main.minPercent) {
          y = window.innerHeight * this.main.minPercent;
        } else {
          y = window.innerHeight * (1 - this.main.minPercent);
        }
      }

      let len = this.screenRect.top + this.screenRect.height / 2 - y;//屏幕移动距离
      let percent = len / window.innerHeight;
      let len2 = this.main.originHeight * percent;
      this.plane.position.y += len2;
      this.screenRect.top = y - this.screenRect.height / 2;
    }
  }
}
