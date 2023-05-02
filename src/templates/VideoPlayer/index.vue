<template>
  <section class="video-wrapper" ref="videoWrapper" @click.stop="playOrPause">
    <video id="video" crossorigin="anonymous" preload="auto" ref="videoPlayer" :width="width" :muted="muted" :poster="poster"></video>
    <transition name="slide-fade">
      <div class="video-controls" v-show="controls.controlsVisible">
        <slider :default-value="localCurrentTime" @change="changeCurrentTime" :max="duration" :format-tooltip="formatTooltip" :precision="6">
          <span>{{ currentTimeFormate }}</span>
        </slider>
        <div class="controls-panel flex-row main-between" @click.stop>
          <div class="controls-left flex-row secondary-center">
            <i class="controls-icon" :class="this.icon[controls.pauseOrPlay]" @click.stop="handlePlayOrPause"></i>
            <span class="controls-duration">{{ currentTimeFormate }}/{{ durationFormate }}</span>
          </div>

          <div class="controls-right flex-row secondary-center">
            <div class="controls-btn">
              <div class="tool-tip">
                <span @click.stop="selectRate(rate, index)" class="rate" :style="{ color: controls.currentRateIndex === index ? '#00a1d6' : '' }" v-for="(rate, index) in controls.rates" :key="index">{{ rate.label }}</span>
              </div>
              <span>倍速</span>
            </div>
            <div class="controls-btn">
              <div class="tool-tip controls-volume">
                <span>{{ volume }}</span>
                <slider style="margin: 8px 12px" vertical :default-value="volume" showProgressButton @change="changeVolume" :tip="false"></slider>
              </div>
              <i class="controls-icon" :class="volumed ? controls.muted : controls.volume" @click="handleMuted"></i>
            </div>
            <div class="controls-btn">
              <div class="tool-tip">
                <span>画中画</span>
              </div>
              <i class="controls-icon" :class="controls.smallscreen" @click.stop="handleSmallScreen"></i>
            </div>
            <div class="controls-btn">
              <div class="tool-tip">
                <span>宽屏</span>
              </div>
              <i class="controls-icon" :class="controls.widescreen"></i>
            </div>
            <div class="controls-btn">
              <div class="tool-tip">
                <span>{{ controls.fullscreenText }}</span>
              </div>
              <i class="controls-icon" :class="controls.fullscreen" @click.stop="fullscreen"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <div class="loading-mask" v-if="loading" @click.stop.prevent>
      <i class="icon-loading"></i>
    </div>
  </section>
</template>

<script>
/**
 * 不能和el-form配合使用，会导致音量进度条无法拖动，应该是el-form的bug
 * 播放地址(src)更换 （常见于切换超清  高清 流畅，不同画质的视频地址不同）
 */
import { formatTime } from '@/utils/formateDate'
import Slider from '@/templates/Slider/index'

import Hls from 'hls.js'

const RATES = [{
  label: '2.0x',
  value: 2
}, {
  label: '1.5x',
  value: 1.5
}, {
  label: '1.0x',
  value: 1
}, {
  label: '0.75x',
  value: 0.75
}, {
  label: '0.5x',
  value: 0.5
}]

export default {
  name: 'VideoPlayer',
  components: {
    Slider
  },
  props: {
    hls: Boolean,
    src: {
      type: String,
      default: ''
    },
    poster: String,
    currentTime: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    width: {
      type: [Number, String],
      default: '100%'
    },
    muted: Boolean,
    value: {}
  },
  data () {
    this.icon = {
      pause: 'icon-pause',
      play: 'icon-play',
      volume: 'icon-volume',
      muted: 'icon-unvolume',
      smallscreen: 'icon-smallscreen',
      widescreen: 'icon-widescreen',
      fullscreen: 'icon-fullscreen'
    }

    return {
      controls: {
        controlsVisible: false,
        pauseOrPlay: 'play',
        volume: this.icon['volume'],
        muted: this.icon['muted'],
        smallscreen: this.icon['smallscreen'],
        widescreen: this.icon['widescreen'],
        fullscreen: this.icon['fullscreen'],
        currentRateIndex: 2,
        rates: RATES,
        exitPictureInPicture: false,
        fullscreenText: '进入全屏'
      },
      loading: false,
      localCurrentTime: this.currentTime,
      localPosterUrl: '',
      volume: this.muted ? 0 : 100,
      removeCursorTimer: null,
      judgeMoveEndTimer: null
    }
  },
  computed: {
    currentTimeFormate () {
      return formatTime(this.localCurrentTime, ':')
    },
    durationFormate () {
      return formatTime(this.duration, ':')
    },
    volumed () {
      return !this.volume
    },
    posterUrl () {
      return this.poster
    }
  },
  mounted () {
    this.videoWrapper = this.$refs.videoWrapper
    this.videoPlayer = this.$refs.videoPlayer

    if (this.hls) {
      this.hlsPlay()
    } else {
      this.videoPlayer.src = this.src
    }

    this.bindWrapperEvent()
    this.bindVideoEvent()
  },
  beforeDestroy () {
    this.removeWrapperEvent()
    this.removeVideoPlayerEvent()
  },
  methods: {
    bindWrapperEvent () {
      this.videoWrapper.addEventListener('mouseover', this.onMouseOver, false)
      window.addEventListener('mousemove', this.onMouseMove, false)
      // this.videoWrapper.addEventListener('mouseleave', this.onMouseLeave, false)

      // 键盘监听
      document.addEventListener('keyup', this.onKeyup, false)
      // 全屏监听
      document.addEventListener('webkitfullscreenchange', this.onFullScreenChange, false)
    },
    bindVideoEvent () {
      // 当浏览器开始寻找指定的音频/视频时触发，也就是当加载过程开始时
      this.videoPlayer.addEventListener('loadstart', this.onLoadstart, false)
      // 告知媒体相关部分的下载进度时周期性地触发。有关媒体当前已下载总计的信息可以在元素的buffered属性中获取到。
      this.videoPlayer.addEventListener('progress', this.onProgress, false)
      // 首帧已经加载
      this.videoPlayer.addEventListener('loadeddata', this.onLoadeddata, false)
      // 元数据加载。当指定的音频/视频的元数据已加载时触发，元数据包括：时长、尺寸（仅视频）以及文本轨道
      this.videoPlayer.addEventListener('loadedmetadata', this.onLoadedmetadata, false)
      // 在媒体数据已经有足够的数据（至少播放数帧）可供播放时触发。
      this.videoPlayer.addEventListener('canplay', this.onCanplay, false)
      // 当音频数据缓存并交给音频层处理时
      this.videoPlayer.addEventListener('mozaudioavailable', this.onMozaudioavailable, false)
      // 在一个待执行的操作（如回放）因等待另一个操作（如跳跃或下载）被延迟时触发。当视频由于需要缓冲下一帧而停止，等待时触发
      this.videoPlayer.addEventListener('waiting', this.onWaiting, false)
      // 在媒体回放被暂停后再次开始时触发。即：在一次暂停事件后恢复媒体回放。
      this.videoPlayer.addEventListener('play', this.onPlay, false)
      // 在媒体开始播放时触发（不论是初次播放、在暂停后恢复、或是在结束后重新开始）
      this.videoPlayer.addEventListener('playing', this.onPlaying, false)
      // 播放暂停时触发。
      this.videoPlayer.addEventListener('pause', this.onPause, false)
      // 视频在跳跃操作开始时触发。开始移动进度条
      this.videoPlayer.addEventListener('seeking', this.onSeeking, false)
      // 视频在跳跃操作完成时触发。进度条已经移动到了新的位置
      this.videoPlayer.addEventListener('seeked', this.onSeeked, false)
      // 在尝试获取媒体数据，但数据不可用时触发。
      this.videoPlayer.addEventListener('stalled', this.onStalled, false)
      // 视频播放时间监听
      this.videoPlayer.addEventListener('timeupdate', this.onTimeupadte, false)
      // 视频播放结束
      this.videoPlayer.addEventListener('ended', this.onEnded, false)
      // 视频播放错误
      this.videoPlayer.addEventListener('error', this.onError, false)
      // this.videoPlayer.audioTracks.addEventListener('addtrack', this.onAddtrack, false)
      console.log('this.videoPlayer.audioTracks: ', document.querySelector('#video').textTracks)
      // 进入视频画中画监听
      this.videoPlayer.addEventListener('enterpictureinpicture', this.onEnterpictureinpicture, false)
      // 离开视频画中画监听
      this.videoPlayer.addEventListener('leavepictureinpicture', this.onLeavepictureinpicture, false)
    },
    removeWrapperEvent () {
      this.videoWrapper.removeEventListener('mouseover', this.onMouseOver, false)
      this.videoWrapper.removeEventListener('mouseleave', this.onMouseLeave, false)
      document.removeEventListener('keyup', this.onKeyup)
      document.removeEventListener('webkitfullscreenchange', this.onFullScreenChange)
    },
    removeVideoPlayerEvent () {
      this.videoPlayer.removeEventListener('loadstart', this.onLoadstart)
      this.videoPlayer.removeEventListener('progress', this.onProgress)
      this.videoPlayer.removeEventListener('loadeddata', this.onLoadeddata)
      this.videoPlayer.removeEventListener('loadedmetadata', this.onLoadedmetadata)
      this.videoPlayer.removeEventListener('canplay', this.onCanplay)
      this.videoPlayer.removeEventListener('mozaudioavailable', this.onMozaudioavailable)
      this.videoPlayer.removeEventListener('waiting', this.onWaiting)
      this.videoPlayer.removeEventListener('play', this.onPlay)
      this.videoPlayer.removeEventListener('playing', this.onPlaying)
      this.videoPlayer.removeEventListener('pause', this.onPause)
      this.videoPlayer.removeEventListener('seeking', this.onSeeking)
      this.videoPlayer.removeEventListener('seeked', this.onSeeked)
      this.videoPlayer.removeEventListener('stalled', this.onStalled)
      this.videoPlayer.removeEventListener('timeupdate', this.onTimeupadte)
      this.videoPlayer.removeEventListener('ended', this.onEnded)
      this.videoPlayer.removeEventListener('error', this.onError)
      this.videoPlayer.removeEventListener('enterpictureinpicture', this.onEnterpictureinpicture)
      this.videoPlayer.removeEventListener('leavepictureinpicture', this.onLeavepictureinpicture)
    },
    onMouseOver () {
      this.controls.controlsVisible = true
    },
    onMouseMove () {
      this.videoWrapper.classList.remove('removeCursor')

      const isFullScreen = this.checkFullScreen()

      // 全屏状态下，1秒后隐藏鼠标
      if (isFullScreen) {
        clearTimeout(this.removeCursorTimer)
        this.removeCursorTimer = setTimeout(() => {
          this.videoWrapper.classList.add('removeCursor')
        }, 1000)
      }
    },
    onMouseLeave () {
      this.controls.controlsVisible = false
    },
    hlsPlay () {
      var hls = new Hls()
      hls.attachMedia(this.videoPlayer)

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(this.src)
      })
    },
    onLoadstart (e) {
      console.log('客户端开始请求数据')
    },
    onProgress (e) {
      console.log('客户端正在请求数据', this.videoPlayer.networkState)
    },
    onLoadeddata (e) {
      console.log('当前帧加载完毕')
    },
    onLoadedmetadata () {
      console.log('视频加载完毕')
    },
    onStalled () {},
    onCanplay () {
      console.log('缓冲区可播放')
      var canvas = document.createElement('canvas')
      this.videoPlayer.setAttribute('crossOrigin', 'anonymous')
      canvas.width = this.videoPlayer.videoWidth
      canvas.height = this.videoPlayer.videoHeight
      canvas.getContext('2d').drawImage(this.videoPlayer, 0, 0, canvas.width, canvas.height)
      console.log(canvas.toDataURL('image/png')) // 第一帧图片url
      this.localPosterUrl = canvas.toDataURL('image/png')
    },
    onMozaudioavailable (e) {
      console.log('当音频数据缓存并交给音频层处理时')
    },
    onWaiting () {
      console.log('等待下一帧')
    },
    onPlay () {
      console.log('触发后，状态是开始播放，但视频并未真正开始播放')
    },
    onPlaying () {
      console.log('视频开始播放')
    },
    onPause (e) {
      console.log('可能是响应pause()事件暂停，或者是切出页面自动暂停', e)
    },
    onSeeking (e) {
      console.log('seeking: ', this.videoPlayer.seeking)
      this.loading = true
    },
    onSeeked (e) {
      console.log('seeked: ', this.videoPlayer.seeking)
      this.loading = false
    },
    onTimeupadte (e) {
      this.localCurrentTime = this.videoPlayer.currentTime
      console.log('this.localCurrentTime: ', this.localCurrentTime)
      this.controls.pauseOrPlay = this.videoPlayer.paused ? 'play' : 'pause'
    },
    onEnded (e) {
      console.log('视频播放结束', e)
    },
    onError (e) {
      console.log('视频出错了', e)
    },
    onAddtrack (e) {
      console.log('监听视频中的音频', e)
    },
    onEnterpictureinpicture (e) {},
    onLeavepictureinpicture () {
      console.log('退出画中画')
      if (this.videoPlayer.paused) return
      this.controls.pauseOrPlay = this.videoPlayer.paused ? 'play' : 'pause'
      this.videoPlayer.play()
    },
    onFullScreenChange (e) {},
    onKeyup (e) {
      // 空格键
      if (e.keyCode === 32) {
        this.playOrPause()
      }

      // 向上键
      if (e.keyCode === 38) {
        this.videoPlayer.volume = this.videoPlayer.volume <= 1 ? this.videoPlayer.volume += 0.1 : 1
      }

      // 向下键
      if (e.keyCode === 40) {
        this.videoPlayer.volume = this.videoPlayer.volume >= 0 ? this.videoPlayer.volume -= 0.1 : 0
      }

      // 向右键
      if (e.keyCode === 39) {
        this.videoPlayer.currentTime = this.videoPlayer.currentTime <= this.videoPlayer.duration ? this.videoPlayer.currentTime += 10 : this.videoPlayer.duration
      }

      if (e.keyCode === 37) {
        this.videoPlayer.currentTime = this.videoPlayer.currentTime !== 0 ? this.videoPlayer.currentTime -= 10 : 0
      }
    },
    playOrPause () {
      if (this.videoPlayer.paused) {
        const playPromise = this.videoPlayer.play()

        if (playPromise !== undefined) {
          playPromise.then(() => {
            this.controls.playOrPause = 'pause'
          }).catch(() => {
            this.videoPlayer.pause()
            this.controls.playOrPause = 'play'
          })
        }
      } else {
        this.videoPlayer.pause()
        this.controls.playOrPause = 'play'
      }
    },
    stopVideo () {
      this.videoPlayer.pause()
      this.controls.playOrPause = 'play'
    },
    handlePlayOrPause () {
      this.playOrPause()
    },
    selectRate (rate, index) {
      this.controls.currentRateIndex = index
      this.videoPlayer.playbackRate = rate.value
    },
    handleSmallScreen () {
      this.controls.exitPictureInPicture = !this.controls.exitPictureInPicture

      if (this.controls.exitPictureInPicture) {
        this.videoPlayer.requestPictureInPicture()
      }

      if (!this.controls.exitPictureInPicture) {
        document.exitPictureInPicture()
      }
    },
    changeVolume (val) {
      this.volume = val
      this.videoPlayer.volume = this.volume / 100 // video.volume只接受[0, 1]
      this.cacheVolume = val
    },
    changeCurrentTime (val) {
      // debugger
      this.videoPlayer.currentTime = val

      this.videoPlayer.pause()
      this.controls.pauseOrPlay = this.videoPlayer.paused ? 'play' : 'pause'

      // 这一步在第一次加载视频时，会自动播放
      clearTimeout(this.judgeMoveEndTimer)
      this.judgeMoveEndTimer = setTimeout(() => {
        if (!this.loading) {
          const playPromise = this.videoPlayer.play()

          if (playPromise !== undefined) {
            playPromise.then(() => {
              this.controls.pauseOrPlay = this.videoPlayer.paused ? 'play' : 'pause'
            }).catch(() => {
              this.videoPlayer.pause()
              this.controls.pauseOrPlay = this.videoPlayer.paused ? 'play' : 'pause'
            })
          }
        }
      }, 150)
    },
    handleMuted () {
      this.volume = this.volumed ? (this.cacheVolume ? this.cacheVolume : 25) : 0

      this.$emit('update:muted', this.volumed)
    },
    fullscreen () {
      // W3C
      if (this.videoWrapper.requestFullscreen) {
        this.checkFullScreen() ? document.exitFullscreen() : this.videoWrapper.requestFullscreen()
      }
      // FireFox
      if (this.videoWrapper.mozRequestFullScreen) {
        this.checkFullScreen() ? document.mozCancelFullScreen() : this.videoWrapper.mozRequestFullScreen()
      }
      // Chrome
      if (this.videoWrapper.webkitRequestFullScreen) {
        this.checkFullScreen() ? document.webkitCancelFullScreen() : this.videoWrapper.webkitRequestFullScreen()
      }
      // IE11
      if (this.videoWrapper.msRequestFullscreen) {
        this.checkFullScreen() ? document.msExitFullscreen() : this.videoWrapper.msRequestFullscreen()
      }
      // IOS（特例）
      if (this.videoPlayer.webkitEnterFullscreen) {
        this.videoPlayer.webkitEnterFullscreen()
      }

      this.controls.fullscreenText = this.checkFullScreen() ? '进入全屏' : '退出全屏'
    },
    // 第一次进入设置播放位置
    // continuePlay () {
    //   this.videoPlayer.addEventListener('loadedmetadata', () => {
    //     this.videoPlayer.muted = true
    //     this.videoPlayer.play() // 自动播放
    //     this.videoPlayer.currentTime = this.localCurrentTime // 跳转
    //     this.videoPlayer.muted = false
    //   })
    // },
    formatTooltip (val) {
      return formatTime(val, ':')
    },
    checkFullScreen () {
      var isFull = document.webkitIsFullScreen || document.mozFullScreen ||
      document.msFullscreenElement || document.fullscreenElement
      if (isFull == null || isFull === undefined) {
        isFull = false
      }
      return isFull
    }
  }
}
</script>

<style lang="scss" scoped>
.video-wrapper {
  display: flex;
  position: relative;
}

.loading-mask {
  background-color: rgba(0, 0, 0, .35);
  font-size: 30px;
  color: #00a1d6;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
  .icon-loading {
    padding: 5px;
    border-radius: 50%;
    background-color: rgba(48,49,51,0.85);
  }
}

.video-controls {
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  padding: 0 10px;
  position: absolute;
  bottom: 0;
  background-color: rgba(0, 0, 0, .35);
  z-index: 70;
  .controls-panel {
    height: calc(100% - 3px);
    color: #fff;
    font-size: 12px;
    .controls-left {
      height: 100%;
    }
    .controls-right {
      height: 100%;
      .controls-btn {
        display: inline;
        line-height: 1; /* 阻止在el-form-item中使用时,其line-height的穿透 */
        cursor: pointer;
        position: relative;
        .tool-tip {
          display: none;
          min-width: 5px;
          padding: 5px;
          background-color: rgba(48,49,51,0.85);
          border-radius: 4px;
          text-align: center;
          line-height: 1;
          font-size: 10px;
          position: absolute;
          left: 50%;
          bottom: 100%;
          transform: translateX(-50%);
          white-space: nowrap;
          .rate {
            text-align: center;
            padding: 5px;
            cursor: pointer;
            &:first-of-type {
              padding-top: 0;
            }
            &:last-of-type {
              padding-bottom: 0;
            }
            &:hover {
              color: #00a1d6;
            }
          }
        }
        &:hover {
          display: inline-flex;
          align-items: center;
          height: 100%;
          .tool-tip {
            display: inline-flex;
            flex-direction: column;
          }
        }
      }
    }
    .controls-icon {
      padding: 0 5px;
      cursor: pointer;
    }
  }
}

.removeCursor {
  cursor: none;
}

/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .3s cubic-bezier(.55,.55,.55,.55);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}
</style>
