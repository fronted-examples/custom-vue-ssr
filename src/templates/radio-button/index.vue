<template>
  <section class="radio-button">
    <button class="button" :class="{'active': currentIndex === index}" v-for="(button, index) in buttons" :key="index" @click.stop.prevent="(e) => handleClick(e, button, index)">
      <i :class="icon" v-if="currentIndex === index"></i>
      <em>{{ button[property] }}</em>
    </button>
  </section>
</template>

<script>
export default {
  name: 'RadioButton',
  props: {
    buttons: {
      type: Array,
      default: () => []
    },
    property: {
      type: String,
      default: 'label'
    },
    icon: {
      type: String,
      default: 'icon-checked'
    }
  },
  data () {
    return {
      currentIndex: -1
    }
  },
  methods: {
    handleClick (e, button, index) {
      this.currentIndex = index
      this.$emit('change', e, button, index)
    }
  }
}
</script>

<style lang="scss" scoped>
.radio-button {
  .button {
    padding: 5px 10px;
    border: 1px solid #dfdfdf;
    border-radius: 4px;
    font-size: 12px;
    background-color: #fff;
    margin-right: 10px;
    cursor: pointer;
    transition: .1s;
    &:last-of-type {
      margin-right: 0;
    }
    em {
      font-style: normal;
    }
    &.active {
      background-color: #ecf5ff;
      color: #409eff;
      border-color: #b3d8ff;
    }
  }
}
</style>
