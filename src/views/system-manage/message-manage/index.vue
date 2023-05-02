<template>
  <section class="message-wrap flex-row">
    <vue-message ref="vue-message"
                 :contact-list="contacts"
                 :contact="currentChat"
                 :messages="messages"
                 @onImageChange="imageChange"
                 @download="handleDownload"
                 @call="videoCall"
                 @hang="videoHang"
                 @change="selectChatUser"
                 @send="sendMessage"
                 @offer="videoOffer"
                 @answer="videoAnswer"
                 @candidate="videoCandidate" />
  </section>
</template>

<script>
import { getUserListByKeyword, sendSingleMessage } from '@/api/v1/user'
import { getOffsetList, downloadFile } from '@/api/v1/upload'
import { Uploader } from '@/utils/simple-upload'
import { Download } from '@/utils/simple-download'

import { sessionMemory } from '@/utils/Storage.js'
import StompMixin from '@/mixins/StompMixin'
import MessageTool from '@/components/MessageTool'
import VueMessage from '@/templates/Message'

export default {
  name: 'MessageManage',
  mixins: [StompMixin],
  components: {
    VueMessage,
    MessageTool
  },
  data () {
    return {
      contacts: [],
      currentIndex: -1,
      currentChat: null,
      keyword: '',
      stompClient: null,
      message: '',
      messages: [],
      chatType: 0,
      mediaMessageOperate: null,
      messageType: 0,
      fileId: null,
      fileSize: 0,
      offsetList: [],
      fileContentList: [],
      cancels: [],
      uploadedSize: 0
    }
  },
  created () {
    this.initData()
  },
  beforeDestroy () {
    if (this.stompClient) {
      this.stompClient.disconnect()
    }
  },
  methods: {
    initData () {
      this.getUserListByKeyword().then(({ userList }) => {
        this.contacts = userList
        this.currentChat = userList[0]
        this.currentIndex = 0

        this.initWebSocket()
      })
    },
    selectChatUser (item, index) {
      this.currentIndex = index
      this.currentChat = item
      this.messages = []

      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          this.initWebSocket()
        })
      }
    },
    videoCall (val) {
      console.log('打视频电话：', val)
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoOffer (val) {
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoAnswer (val) {
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoCandidate (val) {
      this.handleMessageOperate(val)

      this.sendSingleMessage()
    },
    videoHang (val) {
      this.handleMessageOperate(val)

      this.sendSingleMessage()
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
            uploader.fileList[i].start(function (file) {
              console.log('开始之后的回调：', file)
            })
          }
        },
        uploading: (file) => {
          console.log('回调uploading', file)
        },
        uploadSuccess: (file) => {
          console.log('回调uploadSuccess', file)
          this.$file.readAsDataURL(file).then(() => {
            // 文件类型
            this.messageType = 4
            this.filename = file.name
            this.fileType = file.type
            this.fileSize = file.size

            if (file.type.indexOf('image') !== -1) {
              this.messageType = 1
            }

            if (file.type.indexOf('video') !== -1) {
              this.messageType = 2
            }

            this.fileId = file.id
            this.message = `${process.env.IMAGE_PREFIX}${file.url}`

            this.sendSingleMessage()
          })
        },
        uploadFailed: function (file) {
          console.log('回调uploadFailed', file)
        }
      })

      console.log('this.uploader: ', this.uploader)
    },
    handleDownload (file) {
      this.fileContentList = []
      console.log('下载文件：', file)

      const files = []
      files.push(file)

      this.download = new Download({
        files: files,
        downloadUrl: '/user-management-service/minio/downloadFile',
        headers: {
          'Authorization': `Bearer ${sessionMemory.getItem('token')}`
        },
        beforeDownload: (download) => {
          for (let i = 0; i < download.fileList.length; i++) {
            download.fileList[i].start({
              target: this.downloadFile,
              success: (file) => {
                console.log('下载成功：', file)
                console.log('排序后的：', this.$sort.objectDescSort(file.blobList.map((blob) => ({ offset: blob.headers['content-range'], blob: blob.data }))))
                const blob = new Blob(this.$sort.objectDescSort(file.blobList.map((blob) => ({ offset: blob.headers['content-range'], blob: blob.data }))).map(item => item.blob))

                console.log('blob: ', blob)

                if ('download' in document.createElement('a')) {
                  // 支持a标签download的浏览器
                  const link = document.createElement('a') // 创建a标签
                  link.download = file.filename // a标签添加属性
                  link.style.display = 'none'
                  link.href = URL.createObjectURL(blob)
                  document.body.appendChild(link)
                  link.click() // 执行下载
                  URL.revokeObjectURL(link.href) // 释放url
                  document.body.removeChild(link) // 释放标签
                } else {
                  // 其他浏览器
                  navigator.msSaveBlob(blob, this.filename)
                }
              },
              fail: function (file) {
                console.log('下载失败：', file)
              }
            })
          }
        },
        downloading: function (file) {
          console.log('下载中：', file)
        }
      })
    },
    sendMessage (message) {
      this.chatType = 0
      this.message = message
      if (!this.message) {
        this.$nextTick(() => {
          this.$notify({
            type: 'error',
            message: '消息内容不能为空！',
            customClass: 'message-content',
            duration: 0
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
    initWebSocket: function () {
      this.stompInit(({ frame, stompClient }) => {
        console.log('frame: ', frame, stompClient)
        this.stompClient = stompClient

        stompClient.subscribe(`/queue/${sessionMemory.getItem('userInfo').userId}/single`, res => {
          console.info('订阅点对点消息: ', JSON.parse(res.body))
          const data = JSON.parse(res.body)

          if (data.chatType === 0) {
            if (this.currentChat.userId !== sessionMemory.getItem('userInfo').userId) {
              this.messages.push(data)
            }
          }

          if (data.chatType === 2) {
            this.chatType = data.chatType
            if (data.mediaMessageOperate === 0) {
              this.$confirm(`${data.fromUser.username}邀请您进行通话, 是否接听?`, '提示', {
                confirmButtonText: '接听',
                cancelButtonText: '拒绝',
                type: 'warning'
              }).then(() => {
                this.$refs['vue-message'].launchOffer()
              }).catch((err) => {
                console.error(err)
                this.mediaMessageOperate = 2
                this.sendSingleMessage()
              })
            }

            if (data.mediaMessageOperate === 1) {
              this.$refs['vue-message'].replyOffer(this.offer)
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
    },
    sendSingleMessage () {
      const params = {
        isMe: true,
        chatType: this.chatType,
        mediaMessageOperate: this.mediaMessageOperate,
        fromUserId: sessionMemory.getItem('userInfo').userId,
        toUserId: this.currentChat.userId,
        message: this.message,
        messageType: this.messageType,
        fileId: this.fileId,
        filename: this.filename,
        fileSize: this.fileSize,
        fileType: this.fileType,
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
    getUserListByKeyword () {
      const params = {
        keyword: this.keyword
      }

      return new Promise((resolve, reject) => {
        getUserListByKeyword(params)
          .then(({ code, data }) => {
            if (code === 200) {
              resolve(data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    getOffsetList (fileId) {
      return new Promise((resolve) => {
        getOffsetList(fileId).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        })
      })
    },
    downloadFile (filename, offset, offsetLength, onCancel, onDownloadProgress, file, chunkIndex) {
      return new Promise((resolve, reject) => {
        const params = {
          filename,
          offset,
          offsetLength
        }

        downloadFile(params, onCancel(file), (event) => {
          onDownloadProgress(event, file, chunkIndex)
        }).then((res) => {
          console.log('res: ', res)
          this.filename = res.headers['content-disposition'].split(';')[1].split('=')[1]

          const params = {
            offset: parseInt(res.headers['content-range']),
            blob: res.data
          }

          this.fileContentList.push(params)

          resolve(res)
        }).catch((err) => {
          console.log('err: ', err)
          reject(err)
        })
      })
    }
  }
}
</script>

<style>
.message-content .el-notification__content {
  margin: 0;
}
</style>
<style lang="scss" scoped>
.message-wrap {
  box-sizing: border-box;
  height: 100%;
  min-height: 350px;

  .contact-list {
    width: 200px;
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
    width: calc(100% - 200px);
    height: 100%;
    .content-title {
      box-sizing: border-box;
      width: 100%;
      height: 48px;
      border-bottom: 1px solid #ccc;
    }
    .content-message {
      height: calc(100% - 196px);
      overflow-y: auto;
      background-color: #f4f4f5;
      .message-item {
        padding: 10px 5px;
        .fromUser,
        .toUser {
          width: 100%;
        }
        .fromUser {
          .fromUser-inner {
            .message-avatar {
              width: 20px;
              height: 20px;
              border-radius: 4px;
            }
            .user-message-wrap {
              margin-right: 10px;
              .user-message-content {
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
        .toUser {
          .toUser-inner {
            .message-avatar {
              width: 20px;
              height: 20px;
              border-radius: 4px;
            }
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
      border-top: 1px solid #ccc;
      .send-message {
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
</style>
