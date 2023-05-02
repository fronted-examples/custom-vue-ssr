<template>
  <section class="message-wrap flex-row">
    <div class="contact-list">
      <div class="list-item flex-row secondary-center"
           :class="[currentIndex === index ? 'selected':'']"
           v-for="(item, index) of contactList"
           :key="index"
           @click="selectChatUser(item, index)">
        <span class="ellipsis-1"
              v-if="item">{{item.username}}</span>
      </div>
    </div>

    <div class="contact-content">
      <div
           class="content-title flex-row main-center secondary-center">
        <span
              v-if="contact">{{ contact.username }}</span>
      </div>
      <div ref="message-list"
           class="content-message">
        <div class="message-item"
             v-for="(item, index) of messages"
             :key="index">
          <div class="fromUser flex-row main-end"
               v-if="item.isMe">
            <div
                 class="fromUser-inner flex-row secondary-center">
              <div class="user-message-wrap">
                <span
                      v-if="item.username">{{ item.username }}</span>
                <span class="user-message-content"
                      v-if="item.messageType === 0">{{ item.message }}</span>
                <img class="user-message-media"
                     v-if="item.messageType === 1"
                     :src="item.message"
                     @click.stop="downloadFile(item)" />

                <video class="user-message-media"
                       v-if="item.messageType === 2"
                       :src="item.message" muted
                       autoplay
                       @click.stop="downloadFile(item)" />

                <span class="user-message-file flex-inline"
                      v-if="item.messageType == 4"
                      @click.stop="downloadFile(item)">
                  <div class="file-info">
                    <div
                         class="file-name ellipsis-2">
                      {{item.filename}}</div>
                    <div class="file-size">
                      {{formatSize(item.fileSize)}}
                    </div>
                  </div>

                  <svg-icon :style="{ color: fileIconMap[item.fileType].color }"
                            :icon-class="fileIconMap[item.fileType].icon" />
                </span>
              </div>
              <img class="message-avatar"
                   :src="item.avatar ? item.avatar : defaultAvatar" />
            </div>
          </div>

          <div class="toUser" v-if="!item.isMe">
            <div
                 class="toUser-inner flex-row secondary-center">
              <img class="message-avatar"
                   :src="item.avatar ? item.avatar : defaultAvatar" />
              <div class="user-message-wrap">
                <span
                      v-if="item.username">{{ item.username }}</span>
                <span class="user-message-content"
                      v-if="item.messageType === 0">{{ item.message }}</span>
                <img class="user-message-media"
                     v-if="item.messageType === 1"
                     :src="item.message" />

                <video class="user-message-media"
                       v-if="item.messageType === 2"
                       :src="item.message" muted
                       autoplay />

                <!-- <dd class="user-message-file"
                    v-if="item.messageType == 4">
                  <svg-icon :style="{ color: $file.FILE_ICON_MAP[item.fileType].color }"
                            :icon-class="$file.FILE_ICON_MAP[item.fileType].icon" />
                  <span>文件</span>
                </dd> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-footer">
        <section
                 class="message-tool flex-row main-start secondary-center">
          <el-tooltip content="视频通话"
                      placement="top">
            <svg-icon class="tool-icon"
                      icon-class="video"
                      @click="videoCall" />
          </el-tooltip>

          <el-tooltip content="图片"
                      placement="top">
            <label @change="selectImage">
              <svg-icon class="tool-icon"
                        icon-class="image" />
              <input class="file-input"
                     type="file" multiple
                     accept=".jpg,.png,.mp4" />
            </label>
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

        <el-input class="send-message"
                  type="textarea"
                  v-model="message"></el-input>
        <el-button type="info" size="medium"
                   class="send-btn"
                   @click="sendMessage">发送
        </el-button>
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

export default {
  name: 'VueMessage',
  props: {
    contactList: {
      type: Array,
      default: () => ([])
    },
    contact: {
      type: Object,
      default: () => ({})
    },
    messages: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      videoVisible: false,
      localStream: null,
      localVideo: null,
      remoteVideo: null,
      peerConn: null,
      currentIndex: 0,
      message: ''
    }
  },
  computed: {
    imageLocation () {
      return process.env.IMAGE_PREFIX
    },
    defaultAvatar () {
      return `${process.env.IMAGE_PREFIX}/file/images/default_avatar.svg`
    },
    fileIconMap () {
      return this.$file.FILE_ICON_MAP
    },
    formatSize () {
      return this.$file.formatSize
    }
  },
  watch: {
    messages (value) {
      // 页面渲染完成后执行
      this.$nextTick(() => {
        this.toBottom()
      })
    }
  },
  mounted () {
    this.autoFocus()
    console.log(this.fileIconMap)
  },
  methods: {
    selectChatUser (user, index) {
      this.currentIndex = index
      this.$emit('change', user)

      this.autoFocus()
    },
    downloadFile (file) {
      console.log(file)
      const params = {
        filename: file.filename,
        size: file.fileSize,
        type: file.fileType
      }

      this.$emit('download', params)
      // var x = new XMLHttpRequest()
      // x.open('GET', file.message, true)
      // x.responseType = 'blob'
      // x.onload = function (e) {
      //   var url = window.URL.createObjectURL(x.response)
      //   var a = document.createElement('a')
      //   a.href = url
      //   a.download = file.filename // 下载后的文件名
      //   a.click()
      // }
      // x.send()
    },
    sendMessage () {
      this.$emit('send', this.message)
      this.message = ''
    },
    videoCall () {
      this.openVideo().then(() => {
        this.$emit('call', {
          chatType: 2,
          mediaMessageOperate: 0
        })
      })
    },
    hangUp () {
      this.handleHang()

      this.$emit('hang', {
        chatType: 2,
        mediaMessageOperate: 3
      })
    },
    selectImage (e) {
      console.log('上传：', e)
      // 选中的文件列表，如果设置了多选，length 可能会大于 1
      const files = e.target.files

      this.$emit('onImageChange', files)

      e.target.value = ''
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
    toBottom () {
      this.$nextTick(() => {
        const listContainer = this.$refs['message-list']
        listContainer.scrollTop = listContainer.scrollHeight
      })
    },
    openVideo () {
      return new Promise((resolve) => {
        this.videoVisible = true

        this.$nextTick(() => {
          this.localVideo = document.querySelector('.local-video')
          this.remoteVideo = document.querySelector('.remote-video')

          this.requestVideo().then(() => {
            this.createConnection()

            resolve()
          })

          this.localVideo.onloadeddata = () => {
            console.log('播放本地视频')
            this.localVideo.play()
          }
          this.remoteVideo.onloadeddata = () => {
            console.log('播放对方视频')
            this.remoteVideo.play()
          }
        })
      })
    },
    requestVideo () {
      return new Promise((resolve) => {
        navigator.mediaDevices
          .getUserMedia({ audio: true, video: true })
          .then((stream) => {
            this.addVideoURL('.local-video', stream)
            this.localVideo.muted = true
            this.localStream = stream

            resolve()
          })
          .catch((err) => {
            console.log(err.name + ': ' + err.message)
            this.videoVisible = false
          })
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
      this.peerConn = new RTCPeerConnection(config.DEFAULT_ICE_SERVERS)
      this.peerConn.addStream(this.localStream)
      this.peerConn.onaddstream = e => {
        this.addVideoURL('.remote-video', e.stream)
      }

      this.peerConn.onicecandidate = event => {
        setTimeout(() => {
          if (event.candidate) {
            this.$emit('candidate', {
              chatType: 2,
              candidate: event.candidate,
              mediaMessageOperate: 6
            })
          }
        })
      }
    },
    /**
     * 发起offer
     */
    launchOffer () {
      this.openVideo().then(() => {
        this.peerConn.createOffer(
          offer => {
            this.$emit('offer', {
              chatType: 2,
              offer: offer,
              mediaMessageOperate: 4
            })
            this.peerConn.setLocalDescription(offer)
          },
          error => {
            console.error(error)
          }
        )
      })
    },
    /**
   * 应答offer
   */
    replyOffer (offer) {
      this.createConnection()
      this.peerConn.setRemoteDescription(new RTCSessionDescription(offer))
      // Create an answer to an offer
      this.peerConn.createAnswer(
        answer => {
          this.peerConn.setLocalDescription(answer)
          this.$emit('answer', {
            chatType: 2,
            answer: answer,
            mediaMessageOperate: 5
          })
        },
        error => {
          console.error(error)
        }
      )
    },
    /**
   * 处理answer
   */
    handleAnswer (answer) {
      this.peerConn.setRemoteDescription(new RTCSessionDescription(answer))
    },
    /**
   * 处理candidate
   */
    handleCandidate (candidate) {
      // ClientB 通过 PeerConnection 的 AddIceCandidate 方法保存起来
      this.peerConn.addIceCandidate(new RTCIceCandidate(candidate))
    },
    handleHang () {
      this.videoVisible = false
      console.log('peerConn: ', this.peerConn)
      if (this.peerConn) {
        this.peerConn.close()
        this.peerConn.onicecandidate = null
        this.peerConn.onaddstream = null
      }
    },
    // 聚焦
    autoFocus () {
      document.querySelector('.el-textarea__inner').focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.message-wrap {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 350px;

  .contact-list {
    max-width: 200px;
    height: 100%;
    overflow-y: auto;
    background-color: #dde3eb;
    .list-item {
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      padding: 0 10px;
      position: relative;
      &:hover {
        cursor: pointer;
      }
      &.selected {
        background-image: linear-gradient(90deg, #fff, #f5f8fb);
        color: #006fff;
        &::after {
          content: '';
          left: -1px;
          top: 0;
          width: 3px;
          height: 100%;
          position: absolute;
          background-color: #006eff;
        }
      }
    }
  }
  .contact-content {
    width: 100%;
    min-width: calc(100% - 200px);
    .content-title {
      box-sizing: border-box;
      width: 100%;
      height: 48px;
      border-bottom: 1px solid #ccc;
    }
    .content-message {
      height: calc(100% - 196px);
      max-height: 500px;
      overflow-y: auto;
      background-color: #f4f4f5;
      .message-item {
        padding: 10px 5px;
        .fromUser,
        .toUser {
          width: 100%;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 4px;
        }

        .user-message-media {
          max-width: 120px;
          max-height: 180px;
          border-radius: 4px;
          object-fit: contain;
          cursor: pointer;
        }

        .file-info {
          margin-right: 5px;
          .file-name {
            font-size: 16px;
            color: #232323;
            max-width: 150px;
          }
          .file-size {
            font-size: 12px;
            font-weight: 300;
            color: #c0c4cc;
          }
        }

        .svg-icon {
          font-size: 35px;
        }

        .fromUser {
          .fromUser-inner {
            .user-message-wrap {
              margin-right: 10px;
              .user-message-content,
              .user-message-file {
                display: inline-block;
                box-sizing: border-box;
                padding: 8px 10px;
                min-width: 50px;
                min-height: 35px;
                line-height: 19px;
                background-color: #99cc66;
                border-radius: 5px;
                font-size: 12px;
                position: relative;
                &::after {
                  content: '';
                  display: inline-block;
                  width: 0;
                  height: 0;
                  border: 5px solid transparent;
                  border-left: 5px solid #99cc66;
                  position: absolute;
                  top: 50%;
                  right: -9px;
                  transform: translateY(-50%);
                }
              }

              .user-message-file {
                background-color: #fff;
                max-width: 250px;
                cursor: pointer;
                &::after {
                  border-left: 5px solid #fff;
                }
              }
            }
          }
        }
        .toUser {
          .toUser-inner {
            .user-message-wrap {
              margin-left: 10px;
              .user-message-content {
                display: inline-block;
                box-sizing: border-box;
                padding: 8px 10px;
                min-width: 50px;
                min-height: 35px;
                line-height: 19px;
                background-color: #fff;
                border-radius: 5px;
                font-size: 12px;
                position: relative;
                &::after {
                  content: '';
                  display: inline-block;
                  width: 0;
                  height: 0;
                  border: 5px solid transparent;
                  border-right: 5px solid #fff;
                  position: absolute;
                  top: 50%;
                  left: -9px;
                  transform: translateY(-50%);
                }
              }
            }
          }
        }
      }
    }
    .content-footer {
      height: 148px;
      text-align: right;
      box-sizing: border-box;
      border-top: 1px solid #ccc;
      .file-input {
        display: none;
      }
      .send-message {
        ::v-deep .el-textarea__inner {
          border-radius: 0;
          border: none;
          min-height: 60px !important;
          resize: none;
        }
      }
      .send-btn {
        margin-right: 20px;
      }
    }
  }

  .message-tool {
    height: 30px;
    box-sizing: border-box;
    padding: 10px 5px;
    font-size: 20px;
    .svg-icon {
      cursor: pointer;
    }

    .tool-icon {
      margin-left: 10px;
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
}
</style>
