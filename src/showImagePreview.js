import Vue from 'vue'
import ImagePreview from './ImagePreview.vue'

const ImagePreviewConstructor = Vue.extend(ImagePreview);

export default (el) => {

  let instance = new ImagePreviewConstructor({
    el: document.createElement('div'),
    data: {
      img: el,
      imgSrc: el.src
    }
  });

  document.body.appendChild(instance.$el);

};
