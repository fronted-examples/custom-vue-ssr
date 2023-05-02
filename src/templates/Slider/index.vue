<template>
  <section class="progress" ref="progress" @click.stop>
    <div class="progress-bar" ref="progressBar">
      <div class="progress-button" :class="{ 'vertical': vertical }" ref="progressButton"></div>
    </div>
    <span class="tool-tip" :class="{ 'tool-tip__visible': showTip }" ref="toolTip">{{ formatValue }}</span>
  </section>
</template>

<script>
export default {
  name: 'SliderProgress',
  props: {
    value: [Number, String],
    defaultValue: [Number, String],
    size: {
      type: Number,
      default: 4
    },
    max: {
      type: Number,
      default: 100
    },
    height: {
      type: [String, Number],
      default: '100px'
    },
    precision: {
      type: Number,
      default: 0
    },
    tip: {
      type: [Boolean, Object],
      default: true
    },
    borderRadius: Boolean,
    vertical: Boolean,
    showProgressButton: Boolean,
    formatTooltip: {
      type: Function,
      default: (value) => (value)
    }
  },
  data () {
    return {
      val: this.value !== undefined ? this.value : 0 || this.defaultValue !== undefined ? this.defaultValue : 0,
      tipVisible: false
    }
  },
  computed: {
    formatValue () {
      return this.formatTooltip(this.val)
    },
    showTip () {
      return this.tip && this.tipVisible
    }
  },
  created () {
    this.$nextTick(() => {
      this.progress = this.$refs.progress
      this.progressBar = this.$refs.progressBar
      this.progressButton = this.$refs.progressButton
      this.toolTip = this.$refs.toolTip

      this.render()
      this.renderLine()
      this.renderTooltip()

      this.setProgressButtonVisibleOrHidden()

      this.eventVal()
    })
  },
  watch: {
    value (newValue) {
      this.val = newValue
      this.renderLine()
      this.eventVal()
    },
    defaultValue (newValue) {
      if (!this.tipVisible) {
        this.val = newValue
        this.renderLine()
      }
    }
  },
  methods: {
    render () {
      if (!this.vertical) {
        this.progress.style.height = this.size + 'px'
        this.progress.style.width = 100 + '%'
        if (this.borderRadius) {
          this.progress.style.borderRadius = this.size / 2 + 'px'
        }
      }

      if (this.vertical) {
        this.progress.style.width = this.size + 'px'
        this.progress.style.height = typeof this.height === 'string' ? this.height : `${this.height}px`
        if (this.borderRadius) {
          this.progress.style.borderRadius = this.size / 2 + 'px'
        }
      }

      this.progressButton.style.width = this.size + 'px'
      this.progressButton.style.height = this.size + 'px'

      if (this.borderRadius) {
        this.progressBar.style.borderRadius = this.size / 2 + 'px'
      }

      this.startDrag()
    },
    // 渲染进度条
    renderLine: function () {
      if (!this.vertical) {
        this.progressBar.style.width = ((this.progress.clientWidth - this.size) * this.val) / this.max + this.size + 'px'
      }

      if (this.vertical) {
        this.progressBar.style.height = ((parseInt(this.progress.style.height) - this.size) * this.val) / this.max + this.size + 'px'
      }
    },
    renderTooltip () {
      if (!this.vertical) {
        const max = this.progress.clientWidth - this.toolTip.clientWidth
        let left = ((this.progress.clientWidth - this.size) * this.val) / this.max + this.size - this.toolTip.clientWidth / 2

        // console.log('max: ', max, left)

        left = Math.max(0, left)
        left = Math.min(max, left)

        this.toolTip.style.left = left + 'px'
      }

      if (this.vertical) {
        this.toolTip.style.top = ((parseInt(this.progress.style.height) - this.size) * this.val) / this.max + this.size + 'px'
      }
    },
    startDrag () {
      this.progress.addEventListener('mouseenter', this.onMouseEnter, false)
      this.progress.addEventListener('mousemove', this.onMouseOver, false)

      this.progress.addEventListener('mouseleave', this.onMouseLeave, false)

      this.progress.addEventListener('mousedown', e => {
        this.setTipVisible()
        this.setProgressButtonVisibleOrHidden('flex')

        document.addEventListener('mousemove', this.onMouseMove)
        this.progress.removeEventListener('mouseleave', this.setTipHidden)

        this.computedPosition(e)

        this.renderLine()

        this.renderTooltip()

        this.eventVal()
      })

      document.addEventListener('mouseup', e => {
        this.setTipHidden()
        this.setProgressButtonVisibleOrHidden()
        document.removeEventListener('mousemove', this.onMouseMove)
      })
    },
    onMouseEnter (e) {
      this.setProgressButtonVisibleOrHidden('flex')
    },
    onMouseOver (e) {
      this.setTipVisible()
      this.computedPosition(e)
      this.renderTooltip()
    },
    onMouseLeave (e) {
      this.setTipHidden()
      this.setProgressButtonVisibleOrHidden()
    },
    onMouseMove (e) {
      this.setProgressButtonVisibleOrHidden('flex')
      this.setTipVisible()
      this.computedPosition(e)

      this.renderLine()
      this.renderTooltip()
      this.eventVal()
    },
    setTipVisible () {
      this.tipVisible = true
    },
    setTipHidden () {
      this.tipVisible = false
    },
    setProgressButtonVisibleOrHidden (visible = 'none') {
      if (!this.showProgressButton) {
        this.progressButton.style.display = visible
      }

      if (this.showProgressButton) {
        this.progressButton.style.display = 'flex'
      }
    },
    // 获取鼠标位置事件
    computedPosition: function (event) {
      if (!this.vertical) {
        let moveX = event.pageX + this.size / 2 // 鼠标X轴位置
        let progressWidth = this.progress.clientWidth // progress宽度
        let offsetLeft = this.getElementLeft(this.progress)

        this.val = ((moveX - offsetLeft - this.size) / (progressWidth - this.size)) * this.max
      }

      if (this.vertical) {
        let moveY = event.pageY + this.size / 2 // 鼠标Y轴位置
        let progressHeight = this.progress.clientHeight // bgbar高度
        let offsetTop = this.getElementTop(this.progress)
        this.val = this.max - ((moveY - offsetTop - this.size) / (progressHeight - this.size)) * this.max
      }

      this.val = Math.max(0, this.val)
      this.val = Math.min(this.max, this.val)
    },
    // 获取默认值
    eventVal: function () {
      this.val = +this.val.toFixed(this.precision)

      this.$emit('input', this.val)
      this.$emit('change', this.val)
    },
    // 配置tip
    tipConfig: function () {
      switch (this.tip.align) {
        case 'bottom':
          this.toolTip.classList.add('bottom')
          break
        case 'left':
          this.toolTip.classList.add('left')
          break
        case 'right':
          this.toolTip.classList.add('right')
          break
      }
    },
    // 获取元素距离屏幕左端的位置
    getElementLeft: function (element) {
      let { offsetLeft, offsetParent } = element
      while (offsetParent != null) {
        offsetLeft += offsetParent.offsetLeft
        offsetParent = offsetParent.offsetParent
      }
      return offsetLeft
    },
    // 获取元素距离屏幕上端的位置,父元素必须是绝对定位的。不能既有绝对定位，同时还有flex布局，否则垂直方向无法滑动
    getElementTop: function (element) {
      let { offsetTop, offsetParent } = element
      while (offsetParent != null) {
        offsetTop += offsetParent.offsetTop
        offsetParent = offsetParent.offsetParent
      }
      return offsetTop
    }
  }
}
</script>

<style lang="scss" scoped>
.progress {
  background: #f0f0f0;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.1) inset;
  cursor: pointer;
  position: relative;
  .progress-bar {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 0;
    background: rgba(35,173,229, 1);
  }

  .progress-button {
    position: absolute;
    right: 0;
    border-radius: 50%;
    font-size: 8px;
    background: rgba(35,173,229, 1);
    border: 6px solid #fff;
    top: 50%;
    transform: translate(6px, -50%) scale(0.5);
    box-sizing: content-box !important;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.2);
    display: none;
    justify-content: center;
    align-items: center;
    cursor: grab;
  }

  .vertical {
    top: 0 !important;
    left: 50% !important ;
    transform: translate(-50%, -6px) scale(0.5) !important;
  }

  .tool-tip__visible {
    visibility: visible !important;
  }

  .tool-tip {
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.4);
    text-align: center;
    width: 45px;
    height: 25px;
    line-height: 25px;
    padding: 0 5px;
    font-size: 10px;
    color: #fff;
    border-radius: 4px;
    white-space: nowrap;
    user-select: none;
    visibility: hidden;
    position: absolute;
    right: 0;
    top: -35px;
    &.bottom {
      top: auto;
      bottom: -35px;
    }
    &.bottom::after {
      bottom: auto;
      top: -5px;
      border-width: 0 5px 5px;
      border-style: solid;
      border-color: transparent transparent rgba(0, 0, 0, 0.4);
    }
    &.left {
      top: auto;
      left: -40px;
    }
    &.left::after {
      top: 50%;
      transform: translateY(-50%);
      left: auto;
      right: -5px;
      bottom: auto;
      border-width: 5px 0 5px 5px;
      border-style: solid;
      border-color: transparent transparent transparent rgba(0, 0, 0, 0.4);
    }
    &.right {
      top: auto;
      right: -85px;
      left: auto;
    }
    &.right::after {
      top: 50%;
      transform: translateY(-50%);
      right: auto;
      left: -5px;
      bottom: auto;
      border-width: 5px 5px 5px 0;
      border-style: solid;
      border-color: transparent rgba(0, 0, 0, 0.4) transparent transparent;
    }
  }

  .tool-tip::after {
    position: absolute;
    content: '';
    border-width: 5px 5px 0;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.4) transparent transparent;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
  }
}

</style>
