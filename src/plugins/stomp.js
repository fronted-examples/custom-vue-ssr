import SockJS from 'sockjs-client/dist/sockjs.min.js'
import Stomp from 'stompjs'
import { createStore } from '@/store/index'

const DEFAULT_URL = process.env.VUE_APP_API_SOCKET_URL
const store = createStore()

let websocket = null
let stompClient = null
let checkInterval = null

export default {
  stompInit (success = function () { }, fail = function () { }, url = DEFAULT_URL) {
    if (stompClient == null || !stompClient.connected) {
      if (stompClient != null && websocket.readyState === SockJS.OPEN) {
        stompClient.disconnect(() => {
          this.stompConnect(url, success, fail)
        })
      } else if (stompClient != null && websocket.readyState === SockJS.CONNECTING) {
        console.log('连接正在建立')
        return null
      } else {
        this.stompConnect(url, success, fail)
      }
      if (!checkInterval) {
        checkInterval = setInterval(() => {
          console.log('检测连接：' + websocket.readyState)
          if (stompClient != null && stompClient.connected) {
            clearInterval(checkInterval)
            checkInterval = null
            console.log('重连成功')
          } else if (stompClient != null && websocket.readyState !== SockJS.CONNECTING) {
            // 经常会遇到websocket的状态为open 但是stompClient的状态却是未连接状态，故此处需要把连接断掉 然后重连
            stompClient.disconnect(() => {
              this.stompConnect(url, success, fail)
            })
          }
        }, 2000)
      }
    } else {
      console.log('连接已建立成功，不再执行')

      return stompClient
    }
  },
  /**
   *
   * @param {String} url
   */
  stompConnect (url, success, fail) {
    websocket = new SockJS(url)
    // 获取STOMP子协议的客户端对象
    stompClient = Stomp.over(websocket)

    stompClient.debug = false
    stompClient.heartbeat.outgoing = 5000 // 前端对后台连接心跳监控间隔
    stompClient.heartbeat.incoming = 0 // 后台对前端心跳监控，若为0则不进行心跳监控

    const headers = {
      Authorization: `Bearer ${store.getters['user/token']}`
    }

    // 向服务器发起websocket连接
    stompClient.connect(
      headers, // 此处注意更换自己的用户名，最好以参数形式带入
      frame => {
        console.log('链接成功！')
        success({ frame: frame, stompClient: stompClient })
      },
      // 第一次连接失败和连接后断开连接都会调用这个函数 此处调用重连
      err => {
        console.error(err)
        fail(err)
        setTimeout(() => {
          this.stompInit(success, fail, url)
        }, 1000)
      }
    )
  }
}
