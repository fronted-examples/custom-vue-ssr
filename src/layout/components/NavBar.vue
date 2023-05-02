<template>
  <div
       class="navbar flex-row main-between secondary-center">
    <section class="flex-row secondary-center">
      <hamburger id="hamburger-container"
                 :is-active="sidebar.opened"
                 class="hamburger-container"
                 @toggleClick="toggleSideBar" />

      <breadcrumb id="breadcrumb-container"
                  class="breadcrumb-container" />
    </section>

    <div
         class="right-menu flex-row secondary-center">
      <el-tooltip class="message-wrap"
                  effect="dark" content="消息"
                  v-if="messageVisible">
        <el-badge is-dot :hidden="messageHidden">
          <i @click="toMessage"
             class="icon el-icon-chat-dot-round"></i>
        </el-badge>
      </el-tooltip>
      <el-tooltip class="message-wrap"
                  effect="dark" content="通知"
                  v-if="noticeVisible">
        <el-badge is-dot :hidden="noticeHidden">
          <i @click="toNotice"
             class="icon el-icon-message-solid"></i>
        </el-badge>
      </el-tooltip>
      <el-dropdown class="avatar-container right-menu-item hover-effect"
                   trigger="click">
        <div class="avatar-wrapper">
          <img :src="defaultAvatar"
               class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/personal">
            <el-dropdown-item>
              <span
                    style="display:block;">个人中心</span>
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided
                            @click.native="logout">
            <span
                  style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Hamburger from '@/components/Hamburger'
import Breadcrumb from '@/components/Breadcrumb'
import { mapGetters } from 'vuex'
import StompMixin from '@/mixins/StompMixin'
import { sessionMemory } from '@/utils/Storage.js'

export default {
  components: {
    Hamburger,
    Breadcrumb
  },
  mixins: [StompMixin],
  data () {
    return {
      noticeHidden: true,
      messageHidden: true,
      stompClient: null
    }
  },
  computed: {
    ...mapGetters('app', ['sidebar']),
    userInfo () {
      return sessionMemory.getItem('userInfo')
    },
    defaultAvatar () {
      if (this.userInfo && this.userInfo.avatarUrl) {
        return this.userInfo.avatarUrl
      }

      return `${process.env.IMAGE_PREFIX}/file/images/default_avatar.svg`
    },
    isActive () {
      return this.sidebar && this.sidebar.opened
    },
    noticeVisible () {
      if (this.userInfo) {
        return this.userInfo.role.indexOf('ROLE_user') !== -1
      }

      return false
    },
    messageVisible () {
      if (this.userInfo) {
        return this.userInfo.role.indexOf('ROLE_superAdmin') !== -1
      }

      return false
    }
  },
  mounted () {
    if (this.noticeVisible) {
      this.initWebSocket()
    }
  },
  beforeDestroy () {
    if (this.stompClient) {
      this.stompClient.disconnect()
    }
  },
  methods: {
    toggleSideBar () {
      this.$store.dispatch('app/toggleSidebar')
    },
    async logout () {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('user/logout').then(() => {
          // window.location.href = '/login'
          this.$router.replace('/login')
        })
      }).catch(() => { })
    },
    initWebSocket: function () {
      this.stompInit(({ frame, stompClient }) => {
        console.log('frame: ', frame, stompClient)
        this.stompClient = stompClient

        stompClient.subscribe(`/queue/${this.userInfo.userId}/unicastMessage`, res => {
          console.info('订阅通知: ', res)
          this.noticeHidden = false

          this.$message({
            message: res.body,
            type: 'success',
            duration: 3000
          })
        })
      }, (err) => {
        console.log('err: ', err)
      })
    },
    toMessage () {
      this.$router.push({
        name: 'messageManage'
      })
    },
    toNotice () {
      this.$router.push({
        name: 'noticeManage'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  padding-top: 10px;
  padding-bottom: 10px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .message-wrap {
      cursor: pointer;
      margin-right: 10px;
      .icon {
        font-size: 28px;
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        width: 40px;
        height: 40px;

        .user-avatar {
          cursor: pointer;
          width: 100%;
          height: 100%;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 50%;
          font-size: 12px;
          transform: translateY(-50%);
        }
      }
    }
  }
}
</style>
