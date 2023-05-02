<template>
  <div
    @click.stop="revert"
    class="rotate-3D"
    :class="['rotate-3D-' + direction]"
    :style="{transform:`rotateY(${transformStyle[direction]}deg) translateY(-50%)`,zIndex:`${zIndexStyle[direction]}`}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Flip',
  props: {
    direction: {
      type: String,
      default: 'front',
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ['front', 'back'].indexOf(value) !== -1
      }
    }
  },
  data () {
    return {
      transformStyle: {
        front: 0,
        back: 180
      },
      zIndexStyle: {
        front: 2,
        back: 1
      },
      front: true
    }
  },
  methods: {
    revert () {
      this.front = !this.front

      if (['front'].includes(this.direction)) {
        this.front ? this.setStyle(180, 1) : this.setStyle(0, 2)
      }

      if (['back'].includes(this.direction)) {
        this.front ? this.setStyle(0, 2) : this.setStyle(180, 1)
      }
    },
    setStyle (transform, zIndex) {
      this.transformStyle[this.direction] = transform
      this.zIndexStyle[this.direction] = zIndex
    }
  }
}
</script>

<style lang="scss" scoped>
.rotate-3D {
  transition:all .5s ease-in-out;
  transform-style:preserve-3d;
  backface-visibility:hidden;
}

.rotate-3D-front {
  transform:rotateY(0deg);
  z-index:2;
}

.rotate-3D-back {
  transform:rotateY(180deg);
  z-index:1;
}
</style>
