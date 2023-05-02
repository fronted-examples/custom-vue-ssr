<template>
  <section class="register-content">
    <div class="header">
      <h2>用户注册</h2>
    </div>

    <el-form ref="first-form" :model="firstForm"
             label-position="left"
             :rules="firstFormRules">
      <el-form-item label="邮箱" prop="email">
        <el-input class="first-input"
                  v-model="firstForm.email"
                  placeholder="将用作登录账户">
        </el-input>
        <el-button ref="active-btn" type="info"
                   plain class="active-btn"
                   :disabled="activeDisabled"
                   @click="handleActive">激活邮箱
        </el-button>
      </el-form-item>

      <el-form-item label="验证码"
                    prop="validateCode">
        <el-input v-model="firstForm.validateCode"
                  placeholder="请回填邮件中的6位验证码">
        </el-input>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input type="password"
                  placeholder="含数字、字母，区分大小写，最短8位"
                  v-model="firstForm.password"
                  show-password></el-input>
      </el-form-item>

      <el-form-item label="确认密码"
                    prop="confirmPassword">
        <el-input v-model="firstForm.confirmPassword"
                  placeholder="请再次输入密码">
        </el-input>
      </el-form-item>

      <el-form-item class="form-footer">
        <el-button class="btn" type="info" plain
                   @click="submit">注册</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
import { sendCode, userRegister } from '@/api/v1/user'

// 邮箱校验
const EMAIL_REGEX = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/
// 密码校验
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/

export default {
  name: 'register',
  data () {
    const validateEmail = (rule, value, callback) => {
      if (!EMAIL_REGEX.test(value)) {
        callback(new Error('邮箱格式错误'))
      } else {
        callback()
      }
    }

    const validatePassword = (rule, value, callback) => {
      if (value.length > 16 || value.length < 8) {
        callback(new Error('密码长度必须在8~16位'))
      } else if (!PASSWORD_REGEX.test(value)) {
        callback(new Error('密码必须包含数字、大小写字母'))
      } else {
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.firstForm.password) {
        callback(new Error('两次输入的密码一致'))
      } else {
        callback()
      }
    }

    return {
      active: 0,
      activeBtnTimer: null,
      activeSecond: 60,
      activeDisabled: false,
      firstForm: {
        email: '',
        validateCode: '',
        password: '',
        confirmPassword: ''
      },
      firstFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: ['blur', 'change']
          },
          {
            validator: validateEmail,
            trigger: 'blur'
          }
        ],
        validateCode: [{
          required: true,
          message: '请输入验证码',
          trigger: ['blur', 'change']
        }],
        password: [{
          required: true,
          message: '请输入密码',
          trigger: ['blur', 'change']
        }, {
          validator: validatePassword,
          trigger: 'blur'
        }],
        confirmPassword: [{
          required: true,
          message: '请再次输入密码',
          trigger: ['blur', 'change']
        }, {
          validator: validateConfirmPassword,
          trigger: 'blur'
        }]
      }
    }
  },
  beforeDestroy () {
    window.clearInterval(this.activeBtnTimer)
  },
  methods: {
    handleActive () {
      this.$nextTick(() => {
        this.$refs['first-form'].validateField('email', (errorMessage) => {
          if (!errorMessage) {
            this.activeDisabled = true
            this.$refs['active-btn'].$el.innerHTML = this.activeSecond + '秒后重发'

            this.sendCode(this.firstForm.email)

            this.$message.success('验证码已发送')

            clearInterval(this.activeBtnTimer)
            this.activeBtnTimer = window.setInterval(() => {
              if (this.activeSecond > 1) {
                this.activeSecond -= 1
                this.$refs['active-btn'].$el.innerHTML = this.activeSecond + '秒后重发'
              } else {
                window.clearInterval(this.activeBtnTimer)
                this.$refs['active-btn'].$el.innerHTML = '激活邮箱'
                this.activeDisabled = false
                this.activeSecond = 60
              }
            }, 1000)
          }
        })
      })
    },
    submit () {
      this.$refs['first-form'].validate(valid => {
        if (valid) {
          userRegister().then(({ token }) => {
            this.$route.query.token = token

            this.$refs['first-form'].$el.classList.add('hidden')
            this.$refs['second-form'].$el.classList.remove('hidden')

            this.active = 1
          })
        }
      })
    },
    sendCode (phoneOrEmail) {
      const params = {
        phoneOrEmail: phoneOrEmail
      }

      return new Promise((resolve, reject) => {
        sendCode(params).then((res) => {
          if (res.code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    userRegister () {
      const params = {
        email: this.firstForm.email,
        password: this.firstForm.password,
        validateCode: this.firstForm.validateCode
      }

      return new Promise((resolve, reject) => {
        userRegister(params).then(({ code, data }) => {
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
.register-content {
  box-sizing: border-box;
  width: 1221px;
  min-height: 630px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: rgb(0 0 0 / 15%) 0px 2px 15px;
  padding: 40px;
}

.header {
  padding: 0 169px;
  h2 {
    font-weight: 500;
    font-style: normal;
    text-align: center;
  }
}
.el-form {
  margin-top: 40px;
  margin-left: 169px;
}

.el-form .el-form-item {
  margin-bottom: 45px;
}

.el-form ::v-deep .el-form-item__error {
  padding-top: 10px;
}

.el-form ::v-deep .el-form-item__label {
  width: 150px;
  font-size: 20px;
  box-sizing: border-box;
  padding-top: 10px;
  padding-bottom: 10px;
}

.el-form ::v-deep .el-form-item__content {
  margin-left: 150px;
  height: 60px;
  display: flex;
}

.el-form .form-group {
  height: 60px;
}

.el-form .el-input {
  display: inline-block;
  width: 525px;
  height: 100%;
  line-height: 60px;
  margin-right: 10px;
}

.el-form .el-button {
  height: 100%;
  box-sizing: border-box;
}

.el-form ::v-deep .el-input__inner {
  height: 100%;
  font-size: 21px;
}

.first-input {
  width: 380px !important;
}

.form-footer {
  margin-top: 50px;
}

.btn {
  padding: 0 62px;
  margin-left: 169px;
}

.subtitle {
  font-size: 24px;
  font-family: PingFang SC;
  font-weight: 500;
  color: #1a1b1c;
  margin: 56px 0 32px;
}
</style>
