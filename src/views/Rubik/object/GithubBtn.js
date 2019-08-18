import * as THREE from 'three'

export default class GithubBtn {

    constructor(main) {
        this.main = main;
        this.isActive = false;

        let self = this;
        //实际尺寸
        this.realWidth = 64;
        this.realHeight = 64;

        this.ratio = this.main.originWidth / 750;

        //逻辑尺寸
        this.width = this.realWidth * this.ratio;
        this.height = this.width;

        //屏幕尺寸
        this.screenRect = {
            width: this.width / this.main.uiRatio,
            height: this.height / this.main.uiRatio
        }
        //加载图片
        let loader = new THREE.TextureLoader();
        loader.load(require('../../../assets/github-btn.png'), function (texture) {
            let geometry = new THREE.PlaneBufferGeometry(self.width, self.height);
            let material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            self.plane = new THREE.Mesh(geometry, material);
            self.plane.position.set(0, 0, 0);
            self.main.scene.add(self.plane)
            self.defaultPosition();
        }, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }, function (xhr) {
            console.log('An error happened', xhr);
        });
    }

    defaultPosition() {
      this.plane.position.x = -this.main.originWidth/2 + this.width/2 + 50*this.ratio;
      this.plane.position.y = this.main.originHeight / 2 - this.height *7 / 2 - 30 * this.ratio;

      this.screenRect.left = (this.main.originWidth / 2 + this.plane.position.x - this.width / 2) / this.main.uiRatio;
      this.screenRect.top = (this.main.originHeight / 2 - this.plane.position.y - this.height / 2) / this.main.uiRatio;
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
}
