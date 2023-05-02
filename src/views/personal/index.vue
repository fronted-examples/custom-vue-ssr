<template>
  <section class="personal-content">
    <el-row :gutter="20"
            v-if="user">
      <el-col :span="8"
              :xs="24">
        <el-card class="personal-info">
          <div slot="header"
               class="clearfix">
            <span class="info-title">个人信息</span>
            <el-button style="float: right; padding: 3px 0"
                       type="text"
                       :disabled="auditedStatus[user.audited].disabled"
                       :style="{ color: auditedStatus[user.audited].color}"
                       @click="toAuth">
              {{ auditedStatus[user.audited].operate }}
            </el-button>
          </div>
          <div class="info-avatar">
            <user-avatar class="user-avatar"
                         :avatar="defaultAvatar" />
          </div>
          <ul class="list-group list-group-striped">
            <li class="list-group-item">
              <svg-icon icon-class="user" />用户名称
              <div class="pull-right">
                {{ user.username }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="phone" />手机号码
              <div class="pull-right">
                {{ user.phone }}</div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="email" />用户邮箱
              <div class="pull-right">
                {{ user.email }}
              </div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="peoples" />
              所属角色
              <div class="pull-right">
                {{ user.role }}
              </div>
            </li>
            <li class="list-group-item">
              <svg-icon icon-class="date" />创建日期
              <div class="pull-right">
                {{ user.createTime }}</div>
            </li>
          </ul>
        </el-card>
      </el-col>

      <el-col :span="16"
              :xs="24">
        <el-card class="edit-info">
          <div slot="header"
               class="clearfix">
            <span class="info-title">基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料"
                         name="userinfo">
              <user-info :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码"
                         name="resetPwd">
              <reset-pwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import { getUserInfo } from '@/api/v1/user'
import { formatDate } from '@/utils/formateDate'
import UserAvatar from '@/components/UserAvatar/index'
import UserInfo from './userInfo'
import ResetPwd from './resetPwd'

export default {
  name: 'Personal',
  components: {
    UserAvatar,
    UserInfo,
    ResetPwd
  },
  data () {
    return {
      auditedStatus: {
        '0': {
          operate: '去认证',
          color: '#e6a23c',
          disabled: false
        },
        '1': {
          operate: '认证中',
          color: '#409eff',
          disabled: true
        },
        '2': {
          operate: '认证成功',
          color: '#67c23a',
          disabled: true
        }
      },
      user: null,
      activeTab: 'userinfo'
    }
  },
  computed: {
    defaultAvatar () {
      return `${process.env.IMAGE_PREFIX}/file/images/default_avatar.svg`
    }
  },
  created () {
    this.getUserInfo().then(({ userInfo }) => {
      this.user = {
        userId: userInfo.userId || null,
        username: userInfo.username || '-',
        phone: userInfo.phone || '-',
        email: userInfo.email || '-',
        sex: userInfo.sex,
        role: userInfo.role ? userInfo.role.map(item => item.replace('ROLE_', '')).join(',') : '-',
        createTime: formatDate(new Date(userInfo.createTime), 'YYYY-MM-DD hh:mm:ss') || '-',
        audited: userInfo.audited
      }
    })
  },
  methods: {
    toAuth () {
      this.$router.push({
        name: 'userAuth',
        query: {
          userId: this.user.userId
        }
      })
    },
    getUserInfo () {
      return new Promise((resolve, reject) => {
        getUserInfo().then(({ code, data }) => {
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
.personal-content {
  padding: 20px 50px;
}

.personal-info,
.edit-info {
  .info-title {
    font-size: 16px;
  }
  .info-avatar {
    text-align: center;
    transform: scale(0.75);
  }

  .list-group-striped > .list-group-item {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .list-group {
    padding-left: 0px;
    list-style: none;
  }

  .list-group-item {
    border-bottom: 1px solid #e7eaec;
    border-top: 1px solid #e7eaec;
    margin-bottom: -1px;
    padding: 11px 0px;
    font-size: 13px;
  }

  .list-group-item .svg-icon {
    margin-right: 5px;
  }

  .list-group-item .pull-right {
    float: right !important;
  }
}
.user-avatar {
  display: inline-block;
}
</style>
