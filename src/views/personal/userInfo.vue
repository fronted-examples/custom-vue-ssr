<template>
  <el-form ref="form" :model="user" :rules="rules"
           v-if="user">
    <el-form-item label="用户昵称" prop="username">
      <el-input v-model="user.username"
                maxlength="30" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="user.phone"
                maxlength="11" disabled />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email"
                maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio :label="0">男</el-radio>
        <el-radio :label="1">女</el-radio>
      </el-radio-group>
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
import { editUserById } from '@/api/v1/user'

export default {
  props: {
    user: {
      type: Object
    }
  },
  data () {
    return {
      // 表单校验
      rules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    submit () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.editUserById().then(() => {
            this.$message.success('修改成功')
          })
        }
      })
    },
    editUserById () {
      const params = {
        userId: this.user.userId,
        username: this.user.username,
        phone: this.user.phone,
        email: this.user.email,
        sex: this.user.sex
      }

      return new Promise((resolve, reject) => {
        editUserById(params).then(({ code }) => {
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
.el-form ::v-deep .el-form-item__label {
  width: 120px;
}
.el-form ::v-deep .el-form-item__content {
  margin-left: 120px;
}
</style>
