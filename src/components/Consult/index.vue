<template>
  <section class="consult">
    <el-dialog title="" :visible.sync="visible"
               :close-on-click-modal="false"
               width="80%">
      <vue-message ref="vue-message"
                   :contact="currentChatUser"
                   :messages="messages"
                   @onImageChange="imageChange"
                   @send="sendMessage"
                   @call="videoCall"
                   @hang="videoHang"
                   @offer="videoOffer"
                   @answer="videoAnswer"
                   @candidate="videoCandidate" />

    </el-dialog>
    <el-tooltip class="btn-wrap" effect="dark"
                placement="left" content="联系客服">
      <el-button type="primary" plain circle
                 @click="openContact">
        <i class="icon el-icon-service"></i>
      </el-button>
    </el-tooltip>
  </section>
</template>

<script>
import { sendSingleMessage } from '@/api/v1/user'
import { mapGetters } from 'vuex'
import { Uploader } from '@/utils/simple-upload'
import StompMixin from '@/mixins/StompMixin'
import VueMessage from '@/templates/Message'

export default {
  name: 'Consult',
  mixins: [StompMixin],
  components: {
    VueMessage
  },
  data () {
    return {
      visible: false,
      stompClient: null,
      messages: [],
      message: '',
      chatType: 0,
      mediaMessageOperate: null,
      offer: null,
      answer: null,
      candidate: null,
      messageType: 0,
      currentChatUser: {
        userId: 2,
        username: '客服'
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo'])
  },
  beforeDestroy () {
    if (this.stompClient) {
      this.stompClient.disconnect()
    }
  },
  methods: {
    openContact () {
      this.visible = true

      this.initWebSocket()
    },
    async imageChange (files) {
      console.log('imageChange: ', files, files.length)
      if (files.length === 0) {
        return this.$notify({
          type: 'error',
          message: '请选择图片！',
          customClass: 'message-content',
          duration: 0
        })
      }

      this.uploader = new Uploader({
        files: files,
        language: 'EN',
        beforeUpload: (uploader) => {
          console.log('回调uploader', uploader)

          for (let i = 0; i < uploader.fileList.length; i++) {
            uploader.fileList[i].start()
          }
        },
        uploading: (file) => {
          console.log('回调uploading', file)
        },
        uploadSuccess: (file) => {
          console.log('回调uploadSuccess', file)
          // 使用 FileReader 读取文件对象
          const reader = new FileReader()
          // 读取完毕后获取结果
          reader.onload = event => {
            if (file.type.indexOf('image') !== -1) {
              this.messageType = 1
            }

            if (file.type.indexOf('video') !== -1) {
              this.messageType = 2
            }

            this.message = `${process.env.IMAGE_PREFIX}/${file.url}`

            this.sendSingleMessage()
          }
          // 把文件对象作为一个 dataURL 读入
          reader.readAsDataURL(file)
        },
        uploadFailed: function (file) {
          console.log('回调uploadFailed', file)
        }
      })

      console.log('this.uploader: ', this.uploader)
    },
    videoCall (val) {
      console.log('打视频电话：', val)
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoOffer (val) {
      console.log('offer: ', val)
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoAnswer (val) {
      console.log('answer: ', val)
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoCandidate (val) {
      console.log('candidate: ', val)
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoHang (val) {
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    sendMessage (message) {
      this.chatType = 0
      this.message = message
      if (!this.message) {
        this.$nextTick(() => {
          this.$notify({
            type: 'error',
            message: '消息内容不能为空！',
            customClass: 'message-content'
          })
        })

        return
      }

      this.sendSingleMessage().then((res) => {
        console.log('发送成功！')
      })

      this.message = ''
    },
    handleMessageOperate (data) {
      this.chatType = data.chatType
      this.mediaMessageOperate = data.mediaMessageOperate
      this.offer = data.offer
      this.answer = data.answer
      this.candidate = data.candidate
    },
    sendSingleMessage () {
      const params = {
        isMe: true,
        chatType: this.chatType,
        mediaMessageOperate: this.mediaMessageOperate,
        fromUserId: this.userInfo.userId,
        toUserId: 2,
        message: this.message,
        messageType: this.messageType,
        offer: this.offer,
        answer: this.answer,
        candidate: this.candidate
      }

      if (this.chatType === 0) {
        this.messages.push(params)
      }

      return new Promise((resolve, reject) => {
        sendSingleMessage(params).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    initWebSocket: function () {
      this.stompInit(({ frame, stompClient }) => {
        console.log('frame: ', frame, stompClient)
        this.stompClient = stompClient

        // 订阅来自客服的消息，写死
        stompClient.subscribe(`/queue/${this.userInfo.userId}/single`, res => {
          console.info('订阅点对点消息: ', JSON.parse(res.body))
          const data = JSON.parse(res.body)

          if (data.chatType === 0) {
            this.messages.push(data)

            console.log('this.messages: ', this.messages)
          }

          if (data.chatType === 2) {
            console.log(data.offer, data.answer, data.candidate)
            if (data.mediaMessageOperate === 0) {
              this.$confirm(`${data.fromUser.username}邀请您进行通话, 是否接听?`, '提示', {
                confirmButtonText: '接听',
                cancelButtonText: '拒绝',
                type: 'warning'
              }).then(() => {
                this.$refs['vue-message'].launchOffer()
              }).catch(() => {
                this.mediaMessageOperate = 2
                this.sendSingleMessage()
              })
            }

            if (data.mediaMessageOperate === 2) {
              this.$message.error('对方已拒绝！')
              this.$refs['vue-message'].handleHang()
            }

            if (data.mediaMessageOperate === 3) {
              this.$message.warning('对方已挂断！')
              this.$refs['vue-message'].handleHang()
            }

            if (data.mediaMessageOperate === 4) {
              this.$refs['vue-message'].replyOffer(data.offer)
            }

            if (data.mediaMessageOperate === 5) {
              this.$refs['vue-message'].handleAnswer(data.answer)
            }

            if (data.mediaMessageOperate === 6) {
              this.$refs['vue-message'].handleCandidate(data.candidate)
            }
          }
        })
      }, (err) => {
        console.log('err: ', err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog__wrapper {
  ::v-deep .el-dialog__header {
    display: none;
  }
  ::v-deep .el-dialog__body {
    padding: 0;
  }

  .el-dialog {
    .message-title {
      height: 48px;
      border-bottom: 1px solid #ccc;
      h3 {
        margin: 0;
      }
    }

    .message-list {
      height: 250px;
      overflow-y: auto;
      background-color: #f4f4f5;
      .list-item {
        padding: 10px 5px;
        .left-box,
        .right-box {
          width: 100%;
        }
        .right-box {
          .right-box-inner {
            .message-avatar {
              width: 20px;
              height: 20px;
              border-radius: 4px;
            }
            .message-wrap {
              margin-right: 10px;
              .message-content {
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
            }
          }
        }
        .left-box {
          .left-box-inner {
            .message-avatar {
              width: 20px;
              height: 20px;
              border-radius: 4px;
            }
            .message-wrap {
              margin-left: 10px;
              .message-content {
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

    .message-footer {
      height: 148px;
      text-align: right;
      border-top: 1px solid #ccc;
      .el-textarea {
        ::v-deep .el-textarea__inner {
          border-radius: 0;
          border: none;
          min-height: 80px !important;
          resize: none;
        }
      }
      .send-btn {
        margin-right: 20px;
      }
    }
  }
}
.btn-wrap {
  position: fixed;
  right: 10px;
  bottom: 60px;
}
</style>
