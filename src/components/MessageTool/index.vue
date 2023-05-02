<template>
  <section class="tool flex-row main-start secondary-center">
    <el-tooltip content="视频通话"
                placement="top">
      <svg-icon icon-class="video"
                @click="videoCall" />
    </el-tooltip>

    <div class="video-wrap"
         v-if="videoVisible"
         @mousedown="startMove"
         @mouseup="endMove">
      <video class="local-video"
             autoplay></video>
      <video class="remote-video"></video>

      <div class="video-operates">
        <span class="video-btn"
              @click="hangUp">
          <svg-icon icon-class="hang" />
          <label>挂断</label>
        </span>
      </div>
    </div>
  </section>
</template>

<script>

import * as config from '@/utils/web-rtc'

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate
window.RTCSessionDescription =
  window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription

const configuration = {
  iceServers: [config.DEFAULT_ICE_SERVERS]
}

export default {
  name: 'MessageTool',
  data () {
    return {
      videoVisible: false,
      localStream: null,
      localVideo: null,
      remoteVideo: null,
      peerConn: null
    }
  },
  mounted () {
    // 监听页面的mouseleave事件，当鼠标移出浏览器页面可用区域 并 松开按键时，停止拖动
    document.addEventListener('mouseleave', (e) => {
      document.onmousemove = document.onmouseup = null
    })
  },
  methods: {
    openVideoBox () {
      this.videoCall()
    },
    videoCall () {
      this.videoVisible = true

      this.$nextTick(() => {
        this.localVideo = document.querySelector('.local-video')
        this.remoteVideo = document.querySelector('.remote-video')

        this.requestVideo()

        this.localVideo.onloadeddata = () => {
          console.log('播放本地视频')
          this.localVideo.play()
        }
        this.remoteVideo.onloadeddata = () => {
          console.log('播放对方视频')
          this.remoteVideo.play()
        }
      })
    },
    hangUp () {
      this.videoVisible = false
    },
    startMove (e) {
      let box = document.querySelector('.video-wrap')
      // e.pageX, e.pageY 是鼠标在页面上的坐标
      // box.offsetLeft, box.offsetTop 是元素相对于页面左上角的偏移位置
      // disx, disy 便是鼠标相对于元素左上角的偏移位置
      let disx = e.pageX - box.offsetLeft
      let disy = e.pageY - box.offsetTop

      // document.documentElement.clientWidth: 浏览器页面可用宽度
      // document.documentElement.clientHeight: 浏览器页面可用高度

      document.onmousemove = function (e) { // 鼠标移动的时候计算元素的位置
        let x, y
        // e.pageX - disx  鼠标在页面上的位置 - 鼠标在元素中的偏移位置  得到的是元素相对于页面左上角的偏移位置
        if ((e.pageX - disx) > 0) { // 元素相对于页面左上角的偏移位置 大于0时
          if ((e.pageX - disx) > document.documentElement.clientWidth - 60) { // 元素相对于页面左上角的偏移位置 移出到页面以外（右侧）
            x = document.documentElement.clientWidth - 60 // 60是元素自身的宽高
          } else {
            x = e.pageX - disx
          }
        } else { // 元素移到到页面以外（左侧）
          x = 0
        }

        if ((e.pageY - disy) > 0) {
          if ((e.pageY - disy) > document.documentElement.clientHeight - 60) { // 元素移动到页面以外（底部）
            y = document.documentElement.clientHeight - 60
          } else {
            y = e.pageY - disy
          }
        } else { // 元素移动到页面以外（顶部）
          y = 0
        }

        box.style.left = x + 'px'
        box.style.top = y + 'px'
      }
    },
    endMove (e) {
      document.onmousemove = document.onmouseup = null
    },
    requestVideo () {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          this.addVideoURL('.local-video', stream)
          this.localVideo.muted = true
          this.localStream = stream

          this.createConnection()

          this.$emit('call', {
            chatType: 2,
            mediaMessageOperate: 0
          })
        })
        .catch((err) => {
          console.log(err.name + ': ' + err.message)
        })
    },
    addVideoURL (elementId, stream) {
      var video = document.querySelector(elementId)
      // Older brower may have no srcObject
      if ('srcObject' in video) {
        video.srcObject = stream
      } else {
        // 防止在新的浏览器里使用它，应为它已经不再支持了
        video.src = window.URL.createObjectURL(stream)
      }
    },
    createConnection () {
      this.peerConn = new RTCPeerConnection(configuration)
      this.peerConn.addStream(this.localStream)
      this.peerConn.onaddstream = e => {
        this.addVideoURL('.remote-video', e.stream)
      }

      console.log(2222, this.peerConn)

      this.peerConn.onicecandidate = event => {
        setTimeout(() => {
          if (event.candidate) {
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tool {
  height: 30px;
  box-sizing: border-box;
  padding: 10px 5px;
  font-size: 20px;
  .svg-icon {
    cursor: pointer;
  }

  .video-wrap {
    position: fixed;
    width: 300px;
    height: 480px;
    z-index: 8;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    .remote-video {
      width: 300px;
      height: 360px;
      display: block;
      object-fit: cover;
      border: 1px solid #eee;
      background-color: #f2f6fc;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-30%, -85%) scale(0.5, 0.25);
      z-index: 99999;
    }

    .local-video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      height: 480px;
      object-fit: cover;
      border: 1px solid #eee;
      background-color: #ebeef5;
      z-index: 99999;
    }

    .video-operates {
      position: absolute;
      width: 300px;
      bottom: 50px;
      z-index: 99;
      font-size: 35px;
      text-align: center;
      z-index: 99999;
      .video-btn {
        width: 60px;
        height: 60px;
        color: #f5222d;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        label {
          font-size: 14px;
          color: #fff;
          cursor: pointer;
          margin-top: -5px;
        }
        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
