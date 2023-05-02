<template>
  <section>
    <el-form class="form flex-column secondary-center rotate-3D rotate-3D-front"
             :style="{transform:`rotateY(${styleFront.transform}deg) translateY(-50%)`,zIndex:`${styleFront.zIndex}`}"
             label-position="left"
             label-width="80px"
             :model="form_data">
      <el-form-item class="form-item flex-row secondary-center"
                    label="用户名">
        <el-input v-model="form_data.username"
                  placeholder="用户名/邮箱" />
      </el-form-item>
      <el-form-item class="form-item flex-row secondary-center"
                    label="密码">
        <el-input v-model="form_data.password"
                  type="password"
                  auto-complete="new-password"
                  placeholder="密码"
                  show-password />
      </el-form-item>
      <el-form-item class="form-item flex-row main-between secondary-center"
                    label="验证码">
        <el-input class="check-input"
                  v-model="form_data.checkCode"
                  type="text" placeholder="验证码" />
        <img @click="getNewCode" class="check-img"
             :src="form_data.checkCodeUrl" />
      </el-form-item>

      <section class="footer flex-column">
        <el-button type="primary"
                   class="submit-btn"
                   @click="login"
                   :loading="form_data.loading">登录
        </el-button>
        <div
             class="footer-operate flex-row main-between">
          <el-link :underline="false" class="link"
                   type="primary"
                   @click="toRegister">没有账号？注册一个
          </el-link>
          <el-link :underline="false" class="link"
                   type="info" @click="revert">
            忘记密码？</el-link>
        </div>
      </section>
    </el-form>

    <el-form class="form form-back flex-column secondary-center rotate-3D rotate-3D-back"
             :style="{transform:`rotateY(${styleBack.transform}deg) translateY(-50%)`,zIndex:`${styleBack.zIndex}`}"
             label-position="left"
             label-width="120px"
             :model="form_data">
      <el-form-item class="form-item flex-row secondary-center"
                    label="用户名">
        <el-input v-model="form_data.username">
        </el-input>
      </el-form-item>
      <el-form-item class="form-item flex-row secondary-center"
                    label="新密码">
        <el-input v-model="form_data.password"
                  type="password" show-password>
        </el-input>
      </el-form-item>
      <el-form-item class="form-item flex-row secondary-center"
                    label="确认密码">
        <el-input v-model="form_data.confirmPassword"
                  type="password" show-password>
        </el-input>
      </el-form-item>

      <div class="footer flex-column">
        <el-button type="primary"
                   class="submit-btn"
                   @click="login">重置</el-button>
        <div class="footer-operate flex-column">
          <el-link :underline="false" class="link"
                   type="info" @click="revert">
            去登录?</el-link>
        </div>
      </div>
    </el-form>
  </section>
</template>

<script>
import { userLogin, getUserInfo, getCode } from '@/api/v1/user'
import { mapActions } from 'vuex'
import { sessionMemory } from '@/utils/Storage.js'

export default {
  data () {
    return {
      front: true,
      styleFront: {
        transform: 0,
        zIndex: 2
      },
      styleBack: {
        transform: 180,
        zIndex: 1
      },
      form_data: {
        loading: false,
        username: '',
        password: '',
        confirmPassword: '',
        checkCode: '',
        checkCodeUrl: ''
      }
    }
  },
  created () {
    this.getNewCode()
    this.state = this.$route.query.state
    console.log(
      this.code = this.$route)
  },
  methods: {
    ...mapActions({
      updateUserInfo: 'user/updateUserInfo',
      updateToken: 'user/updateToken',
      updateRoles: 'user/updateRoles'
    }),
    getNewCode () {
      this.getCode().then((url) => {
        this.form_data.checkCodeUrl = url
      })
    },
    login () {
      if (!this.form_data.username || !this.form_data.password) return this.toastInfo('请输入用户名和密码', 'error')

      this.form_data.loading = true

      this.userLogin().then(({ accessToken }) => {
        // this.updateToken(accessToken)
        sessionMemory.setItem({ name: 'token', value: accessToken })

        this.getUserInfo().then(({ userInfo }) => {
          let roles = userInfo.role

          sessionMemory.setItem({ name: 'roles', value: roles })
          sessionMemory.setItem({ name: 'userInfo', value: userInfo })

          // 存储用户角色
          // this.updateRoles(roles)

          // this.updateUserInfo(userInfo)
          this.$message.success('登录成功')

          this.$router.push({
            path: '/'
          })
        }).finally(() => {
          this.form_data.loading = false
        })
      }).catch(() => {
        this.form_data.loading = false
      })
    },
    // 切换登录、重置密码
    revert () {
      this.front = !this.front

      this.setStyle()
    },
    toRegister () {
      this.$router.push('/register')
    },
    getCode () {
      return new Promise((resolve, reject) => {
        getCode()
          .then(response => {
            console.log('response: ', response)
            this.form_data.verifyCode = response.headers.cookie
            // 将从后台获取的图片流进行转换
            return 'data:image/png;base64,' + btoa(
              new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
            )
          }).then((url) => {
            resolve(url)
          }).catch((err) => {
            reject(err)
          })
      })
    },
    userLogin () {
      const params = {
        username: this.form_data.username,
        password: this.form_data.password,
        validateCode: this.form_data.checkCode
      }

      return new Promise((resolve, reject) => {
        userLogin(params).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => {
          reject(err)
        })
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
    },
    // 设置翻转样式
    setStyle () {
      if (this.front) {
        this.styleFront.zIndex = 2
        this.styleFront.transform = 0
        this.styleBack.zIndex = 1
        this.styleBack.transform = 180
      }

      if (!this.front) {
        this.styleFront.zIndex = 1
        this.styleFront.transform = 180
        this.styleBack.zIndex = 2
        this.styleBack.transform = 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rotate-3D {
  transition: all 0.65s ease-in-out;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
.rotate-3D-front {
  transform: rotateY(0deg);
  z-index: 2;
}
.rotate-3D-back {
  transform: rotateY(180deg);
  z-index: 1;
}
.form {
  box-shadow: rgb(0 0 0 / 15%) 0px 2px 15px;
  border-radius: 10px;

  width: 610px;

  box-sizing: border-box;
  padding: 50px 60px;

  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-30%, -50%);
}
.form-item {
  width: 100%;
  height: 50px;
}
.form-item ::v-deep .el-form-item__content {
  margin-left: 0 !important;
  width: 100%;
  display: flex;
  align-items: center;
}

.form-item ::v-deep .el-form-item__label {
  height: 50px;
  line-height: 50px;
}

.form-item ::v-deep .el-input__inner {
  height: 50px;
  line-height: 50px;
}

.check-input {
  width: 35%;
}
.check-img {
  width: 60%;
  height: 50px;
  padding: 0;
  margin-left: 10px;
}
.footer {
  width: 100%;
  position: relative;
}
.submit-btn {
  width: 100%;
  height: 55px;
}
.footer-operate {
  padding: 10px 0;
}
.link {
  align-self: flex-end;
  box-sizing: border-box;
}
</style>
