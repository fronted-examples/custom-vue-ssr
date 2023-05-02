<template>
  <section class="create-content">
    <section class="form-wrap">
      <el-form ref="base-form" :model="form"
               :rules="formRules">
        <el-form-item label="网站名称" prop="appName">
          <el-input v-model="form.appName" />
          <p class="form-tip">
            请注意，名称将在微信登录等操作时被用户看到，需在2到40个字节之间，一个中文占两个字节，半年只能修改一次
          </p>
        </el-form-item>
        <el-form-item label="授权回调域"
                      prop="appRedirectUrl">
          <el-input
                    v-model="form.appRedirectUrl" />
          <p class="form-tip">
            请填写开发需要的合法域名，用户登录后，只能回调至该域名下的页面</p>
        </el-form-item>
        <el-form-item label="网站描述"
                      prop="appDescription">
          <el-input v-model="form.appDescription"
                    type="textarea" />
          <p class="form-tip">最多80字</p>
        </el-form-item>
        <el-form-item
                      class="flex-row main-center">
          <el-button type="success"
                     :loading="loading"
                     @click="submitAuth">提交审核</el-button>
        </el-form-item>
      </el-form>
    </section>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import { addApp } from '@/api/v1/user'

export default {
  name: 'AppCreate',
  data () {
    return {
      loading: false,
      form: {
        appName: '',
        appDescription: '',
        appRedirectUrl: ''
      },
      formRules: {
        appName: [{
          required: true,
          message: '请输入网站名称',
          trigger: 'blur'
        }],
        appDescription: [{
          required: true,
          message: '请输入网站描述',
          trigger: 'blur'
        }],
        appRedirectUrl: [{
          required: true,
          message: '请输入授权回调域',
          trigger: 'blur'
        }]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo'])
  },
  methods: {
    submitAuth () {
      this.$refs['base-form'].validate(validated => {
        if (validated) {
          this.loading = true

          this.addApp().then(() => {
            this.$message.success('应用创建成功')
            this.$router.go(-1)
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    addApp () {
      const params = {
        userId: this.userInfo.userId,
        appName: this.form.appName,
        appRedirectUrl: this.form.appRedirectUrl,
        appDescription: this.form.appDescription
      }

      return new Promise((resolve, reject) => {
        addApp(params).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => { reject(err) })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.create-content {
  padding: 20px;
  text-align: center;
}
.form-wrap {
  width: 670px;
  display: inline-block;
}
.el-form ::v-deep .el-form-item__label {
  width: 120px;
}
.el-form ::v-deep .el-form-item__content {
  margin-left: 120px;
  margin-bottom: 20px;
  text-align: left;
}

.el-form ::v-deep .el-textarea__inner {
  resize: none;
  padding: 8px 0 8px 15px;
}

.form-tip {
  padding-top: 10px;
  color: #c1c2c3;
  line-height: 1.6;
  margin: 0;
}
</style>
