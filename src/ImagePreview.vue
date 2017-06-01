<style lang="less">

  .image-preview__wrapper {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    position: fixed;
    overflow: auto;
    background: rgba(0, 0, 0, .5);

    &.hide {
      display: none;
    }

    img {
      cursor: pointer;
      transition: translate .1s;
      box-shadow: 0 0 120px #222;
      /*max-height: 100%;*/
    }
  }

  .image-fade-enter-active,
  .image-fade-leave-active {
    transition: opacity .3s
  }

  .image-fade-enter,
  .image-fade-leave-to {
    opacity: 0
  }

  .toolbar {
    position: fixed;
    z-index: 100;
    bottom: 30px;
    left: 20px;
  }

</style>

<template>
  <transition name="image-fade">
    <div class="image-preview__wrapper"
         style="z-index: 2003;"
         @click.self="handleClick"
         @mousewheel.stop="handleMouseWheel"
         v-if="imgSrc">
      <img :src="imgSrc"/>

      <div class="toolbar">
        <el-button icon="minus" @click="handleZoomIn">缩小</el-button>
        <el-button icon="plus" @click="handleZoomOut">放大</el-button>
        <el-button icon="close" @click="handleClose">关闭</el-button>
      </div>
    </div>
  </transition>
</template>

<script>

  import Hammer from 'hammerjs'
  import Vue from 'vue'

  export default {

    data() {
      return {
        init: false,
        deltaX: 0,
        deltaY: 0,
        currentScale: 1,
      };
    },

    props: {
      img: null,
      imgSrc: '',
    },

    mounted() {
      document.querySelector('html').style.overflow = 'hidden';

      Vue.nextTick(() => {
        this.initImagePosition();
        this.initHammer();
      });
    },

    methods: {

      handleZoomIn() {
        this.currentScale = this.currentScale * .8;
        this.update();
      },

      handleZoomOut() {
        this.currentScale = this.currentScale * 1.2;
        this.update();
      },

      handleClose() {
        this.close();
      },

      initImagePosition() {
        const clientWidth = window.innerWidth;
        const clientHeight = window.innerHeight;

        const img = this.img;
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > 0 && width < clientWidth) {
          this.deltaX = (clientWidth - width) / 2;
        }

        if (height > 0 && height < clientHeight) {
          this.deltaY = (clientHeight - height) / 2;
        }

        // 当 图片的宽度大于 窗口宽度时, 图片的高度会被压缩,需要按照压缩后的图片的高度来计算位置
        if (width > clientWidth) {
          this.deltaX = 0;
          // 计算压缩后的图片的高度
          // Height = clientWidth / width * clientHeight
          height = clientWidth / width * clientHeight;

          // 压缩后的高度 比 窗口高度大, 就算了~
          let gap = clientHeight - height;
          this.deltaY = gap > 0 ? gap / 2 : 0;
        }

        // 同理 还有 图片高度大于图片宽度的情况~
//        else if (height > clientHeight) {
//          this.deltaY = 0;
//
//          width = clientHeight / height * clientWidth;
//          let gap = clientWidth - width;
//          this.deltaX = gap > 0 ? gap / 2 : 0;
//        }

        const realImg = this.$el.firstChild;
        realImg.style.transform = `translate(${this.deltaX}px, ${this.deltaY}px)`;
      },

      getRelativeScale(scale) {
        return scale * this.currentScale;
      },

      handlePanMove(e) {
        let dX = this.deltaX + (e.deltaX);
        let dY = this.deltaY + (e.deltaY);

        const img = this.$el.firstChild;
        img.style.transform = `translate(${dX}px, ${dY}px) scale(${this.currentScale})`;
      },

      handlePanEnd(e) {
        this.deltaX += e.deltaX;
        this.deltaY += e.deltaY;
      },

      handlePinchMove(e) {
        let scale = this.getRelativeScale(e.scale);

        const img = this.$el.firstChild;
        img.style.transform = `translate(${this.deltaX}px, ${this.deltaY}px) scale(${scale})`;
      },

      handlePinchEnd(e) {
        this.currentScale = this.getRelativeScale(e.scale);
      },

      initHammer() {
        const img = this.$el.firstChild;
        let manager = new Hammer.Manager(img);
        let Pan = new Hammer.Pan();
        let Pinch = new Hammer.Pinch();

        Pinch.recognizeWith([ Pan ]);

        manager.add(Pan);
        manager.add(Pinch);

        manager.on('panmove', this.handlePanMove);
        manager.on('panend', this.handlePanEnd);

        manager.on('pinchmove', this.handlePinchMove);
        manager.on('pinchend', this.handlePinchEnd);
      },

      handleClick() {
        this.close();
      },

      update() {
        const img = this.$el.firstChild;
        img.style.transform = `translate(${this.deltaX}px, ${this.deltaY}px) scale(${this.currentScale})`;
      },

      close() {
        this.imgSrc = '';
        document.querySelector('html').style.overflow = 'visible';
      },

      handleMouseWheel(e) {
        if (e.wheelDelta > 0) {
          this.currentScale = 1.2 * this.currentScale;
        } else  {
          this.currentScale = .8 * this.currentScale;
        }

        this.update();
      },

    }

  };

</script>
