<template>
  <el-form ref="form" :model="form"
           :rules="rules">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="form.oldPassword"
                placeholder="请输入旧密码"
                type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="form.newPassword"
                placeholder="请输入新密码"
                type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码"
                  prop="confirmPassword">
      <el-input v-model="form.confirmPassword"
                placeholder="请确认新密码"
                type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini"
                 @click="submit">保存</el-button>
      <el-button type="danger" size="mini"
                 @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { changePassword } from '@/api/v1/user'

// 密码校验
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$/

export default {
  props: {
    user: {
      type: Object
    }
  },
  data () {
    const equalToPassword = (rule, value, callback) => {
      if (this.form.newPassword !== value) {
        callback(new Error('两次输入的密码不一致'))
      } if (!PASSWORD_REGEX.test(value)) {
        callback(new Error('密码必须包含数字、大小字母'))
      } else {
        callback()
      }
    }
    return {
      form: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 表单校验
      rules: {
        oldPassword: [
          { required: true, message: '旧密码不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { required: true, validator: equalToPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.changePassword().then(() => {
            this.$message.success('修改成功')
          })
        }
      })
    },
    changePassword () {
      const params = {
        userId: this.user.userId,
        oldPassword: this.form.oldPassword,
        newPassword: this.form.newPassword
      }

      return new Promise((resolve, reject) => {
        changePassword(params).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    close () {
      this.$tab.closePage()
    }
  }
}
</script>
<style lang="scss" scoped>
.el-form ::v-deep .el-form-item {
  margin-bottom: 40px;
}
.el-form ::v-deep .el-form-item__label {
  width: 100px;
}
.el-form ::v-deep .el-form-item__content {
  margin-left: 100px;
}
.el-form ::v-deep .el-form-item__error {
  padding-top: 10px;
}
</style>
