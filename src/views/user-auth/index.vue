<template>
  <section class="auth-content">
    <div class="header">
      <h2>填写认证信息</h2>
    </div>

    <el-form ref="form" :rules="formRules"
             :model="form" label-position="left">
      <h2 class="subtitle">管理员信息</h2>
      <el-form-item label="主体类型" prop="userType">
        <el-radio-group v-model="form.userType">
          <el-radio-button v-for="(item, index) of userTypes"
                           :key="index"
                           :label="item.subjectName">
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="手机号码" prop="phone">
        <el-input class="first-input"
                  v-model="form.phone"
                  placeholder="请输入管理员手机号">
        </el-input>
        <el-button ref="code-btn" type="info"
                   plain @click="getCode">获取验证码
        </el-button>
      </el-form-item>

      <el-form-item label="短信验证码"
                    prop="validateCode">
        <el-input v-model="form.validateCode"
                  placeholder="请输入手机短信收到的6位验证码">
        </el-input>
      </el-form-item>

      <el-form-item class="form-footer">
        <el-button class="btn" type="success"
                   :loading="loading"
                   @click="next">提交审核</el-button>
      </el-form-item>
    </el-form>
  </section>
</template>
<script>
import { sendCode, certifiedUser, getSubjectList } from '@/api/v1/user'

// 手机号校验
const PHONE_REGEX = /^(1[3-9]\d{9})$|^([69]\d{7})$|^([6]\d{5})$|^(09\d{8})$/

export default {
  name: 'UserAuth',
  data () {
    const validatePhone = (rule, value, callback) => {
      if (!PHONE_REGEX.test(value)) {
        callback(new Error('手机号格式错误'))
      } else {
        callback()
      }
    }

    return {
      userId: null,
      loading: false,
      form: {
        userType: '',
        phone: '',
        validateCode: ''
      },
      formRules: {
        userType: [{
          required: true,
          message: '请选择主体类型',
          trigger: ['blur', 'change']
        }],
        phone: [{
          required: true,
          message: '请输入手机号',
          trigger: ['blur', 'change']
        }, {
          validator: validatePhone,
          trigger: 'blur'
        }],
        validateCode: [{
          required: true,
          message: '请输入验证码',
          trigger: ['blur', 'change']
        }]
      },
      userTypes: []
    }
  },
  created () {
    this.getSubjectList().then(({ subjectList }) => {
      this.userTypes = subjectList
    })
  },
  methods: {
    getCode () {
      this.$refs['form'].validateField('phone', (errorMessage) => {
        if (!errorMessage) {
          this.activeDisabled = true
          this.$refs['code-btn'].$el.innerHTML = this.activeSecond + '秒后重发'

          this.sendCode(this.form.phone)

          this.$message.success('验证码已发送')

          clearInterval(this.activeBtnTimer)
          this.activeBtnTimer = window.setInterval(() => {
            if (this.activeSecond > 1) {
              this.activeSecond -= 1
              this.$refs['code-btn'].$el.innerHTML = this.activeSecond + '秒后重发'
            } else {
              window.clearInterval(this.activeBtnTimer)
              this.$refs['code-btn'].$el.innerHTML = '获取验证码'
              this.activeDisabled = false
              this.activeSecond = 60
            }
          }, 1000)
        }
      })
    },
    next () {
      this.$refs['form'].validate(valid => {
        if (valid) {

        }
      })
    },
    getSubjectList () {
      return new Promise((resolve, reject) => {
        getSubjectList().then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => {
          reject(err)
        })
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
    certifiedUser () {
      const params = {
        userId: this.user.userId,
        phone: this.form.phone,
        validateCode: this.form.validateCode
      }

      certifiedUser(params).then()
    }
  }
}
</script>
<style lang="scss" scoped>
.auth-content {
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

.el-radio-button {
  margin-right: 10px;
}

.el-radio-button ::v-deep .el-radio-button__inner {
  background: #f6f7f8;
  border-radius: 4px;
  border: none;
  padding: 20px 40px;
}

.el-radio-button ::v-deep .el-radio-button__inner:hover {
  color: #606266;
  background-color: #f6f7f8;
}

.el-radio-button ::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  color: #3eac27;
  background-color: #eaf8f0;
  box-shadow: none;
}

.reg-msg {
  font-size: 21px;
  font-weight: 400;
  color: #353535;
}

.reg-principal-line {
  margin-bottom: 24px;
}

.reg-principal-name {
  font-size: 18px;
  color: #9a9a9a;
  margin-right: 20px;
}

.third-form-header {
  margin-bottom: 32px;
}

.reg-tips {
  display: inline-block;
  width: 730px;
  font-size: 20px;
  color: #7e8081;
}

.prev-btn {
  margin-left: 50px;
}
.confirm-btn {
  margin-left: 20px;
}

.btn:focus {
  outline: none;
}
</style>
