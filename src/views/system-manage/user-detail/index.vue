<template>
  <section class="user-content">
    <div class="header flex-row main-between"
         v-if="user">
      <div class="user-logo">
        <user-avatar class="user-avatar"
                     :avatar="defaultAvatar" />
        <span class="header-item">
          <div>
            <label class="label">姓名</label>：{{ user.username }}
          </div>
          <div>
            <label class="label">性别</label>：{{ sexStatus[user.sex] }}
          </div>
          <div>
            <label class="label">年龄</label>：{{ user.age }}
          </div>
        </span>
      </div>
      <span class="header-item">
        <span class="label">认证状态：</span>
        <el-tag :type="auditedStatus[user.audited].type">
          {{ auditedStatus[user.audited].txt }}
        </el-tag>
      </span>
    </div>

    <div class="body"></div>

    <div class="footer">
      <el-button type="danger"
                 plain>拒绝
      </el-button>
      <el-button type="success">通过</el-button>
    </div>
  </section>
</template>

<script>
import { getUserById } from '@/api/v1/user'
import UserAvatar from '@/components/UserAvatar/index'

export default {
  name: 'UserDetail',
  components: {
    UserAvatar
  },
  data () {
    return {
      auditedStatus: {
        '0': {
          txt: '未认证',
          type: 'warning'
        },
        '1': {
          txt: '待审核',
          type: 'info'
        },
        '2': {
          txt: '认证通过',
          type: 'success'
        },
        '3': {
          txt: '认证失败',
          type: 'danger'
        }
      },
      sexStatus: {
        0: '男',
        1: '女'
      },
      userId: null,
      user: null
    }
  },
  computed: {
    defaultAvatar () {
      return `${process.env.IMAGE_PREFIX}/file/images/default_avatar.svg`
    }
  },
  created () {
    this.userId = this.$route.query.userId

    this.getUserById().then(({ user }) => {
      this.user = user.user
    })
  },
  methods: {
    getUserById () {
      return new Promise((resolve, reject) => {
        getUserById(this.userId).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => {
          reject(err)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-content {
  padding: 20px 50px;
}

.header {
  padding: 20px;
  box-shadow: rgb(0 0 0 / 15%) 0px 2px 15px;
  .user-avatar {
    float: left;
  }
  .header-item {
    display: inline-block;
    font-size: 22px;
    font-weight: 500;
    font-style: normal;
    margin-left: 15px;
    margin-top: 20px;
  }
}

.body {
}

.footer {
  padding: 20px;
  margin-top: 40px;
  text-align: center;
  .el-button {
    padding: 20px 40px;
    font-size: 22px;
  }
}

.label {
  font-size: 18px;
  font-weight: 400;
  color: #131313;
}
</style>
