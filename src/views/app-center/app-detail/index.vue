<template>
  <section class="app-detail"
           v-if="appInfo">
    <div class="header">
      <div class="img-wrap">
        <img class="app-img"
             src="" />
      </div>
      <span class="header-middle">
        <span class="middle-txt">{{appInfo.appName}}</span>
        <p class="audit-tip"
           :style="{ color: auditStatus[appInfo.audited].color }">
          <i :class="`el-icon-${auditStatus[appInfo.audited].type}`">{{auditStatus[appInfo.audited].txt}}</i>
        </p>
        <label class="error-tip">{{appInfo.auditText}}</label>
      </span>
      <span class="header-operate">
        <el-button type="danger"
                   @click="deleteApp">删除应用
        </el-button>
      </span>
    </div>
    <div class="body">
      <div class="body-item">
        <h3>接口信息</h3>
        <div class="table-wrap">
          <table class="table"
                 cellspacing="0">
            <thead class="thead">
              <tr>
                <th class="table-cell tl">接口名称</th>
                <th class="table-cell tl">接口介绍</th>
                <th class="table-cell tl">接口状态</th>
                <th class="table-cell tr"
                    style="width: 140px;">操作</th>
              </tr>
            </thead>
            <tbody class="tbody">
              <tr v-for="(item, index) of tableData"
                  :key="index">
                <td class="table-cell tl">
                  {{ item.scope }}</td>
                <td class="table-cell tl">
                  {{ item.description }}</td>
                <td class="table-cell tl">
                  {{ item.statusText }}</td>
                <td class="table-cell tr">
                  <el-button type="text">申请开通
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="body-item">
        <h3>基本信息</h3>
        <div class="form-item">
          <label class="form-label">应用名称</label>
          <span class="form-label-txt">{{appInfo.appName}}</span>
        </div>
        <div class="form-item">
          <label class="form-label">应用描述</label>
          <span class="form-label-txt">{{appInfo.appDescription}}</span>
        </div>
        <div class="form-item">
          <label class="form-label">应用图标</label>
          <span class="form-label-txt">
            <img class="app-icon"
                 src="" />
          </span>
        </div>
      </div>
      <div class="body-item">
        <h3>开发信息</h3>
        <div class="form-item">
          <label class="form-label">授权回调域</label>
          <span class="form-label-txt">{{appInfo.appRedirectUrl}}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { getAppById, delAppById } from '@/api/v1/user'

export default {
  name: 'AppDetail',
  data () {
    return {
      auditStatus: {
        '0': {
          type: 'warning',
          txt: '审核中',
          color: '#e6a23c'
        },
        '1': {
          type: 'success',
          txt: '通过审核',
          color: '#67c23a'
        },
        '2': {
          type: 'error',
          txt: '未通过审核',
          color: '#f56c6c'
        }
      },
      appId: null,
      appInfo: null,
      tableData: [{
        scope: '第三方授权登录',
        description: '使用注册的appId和appSecret进行第三方授权登录',
        statusText: '未获得',
        status: 0
      }]
    }
  },
  created () {
    this.appId = this.$route.query.appId
    this.initData()
  },
  methods: {
    initData () {
      this.getAppById().then(({ appInfo }) => {
        this.appInfo = appInfo
      })
    },
    deleteApp () {
      this.$confirm('此操作将永久删除该应用, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.delAppById().then(() => {
            this.$message.success('删除成功')
            this.$tab.closePage()
          })
        })
        .catch(() => {
        })
    },
    delAppById () {
      return new Promise((resolve, reject) => {
        delAppById(this.appId).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => { reject(err) })
      })
    },
    getAppById () {
      const params = {
        appId: this.appId
      }

      return new Promise((resolve, reject) => {
        getAppById(params).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => { reject(err) })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-detail {
  border: 1px solid #e6e6e6;
  margin: 20px 50px 70px 50px;
  .header {
    padding: 32px;
    display: flex;
    .img-wrap {
      .app-img {
        padding: 100px;
      }
    }
    .header-middle {
      width: 80%;
      margin-left: 25px;
      font-size: 25px;
      font-weight: 400;
      .middle-txt {
        display: inline-block;
        padding-top: 10px;
        overflow: hidden;
      }
      p {
        margin: 0;
      }
      .audit-tip {
        margin-top: 50px;
        font-size: 22px;
        font-style: normal;
      }
      .error-tip {
        font-size: 22px;
        font-style: normal;
        color: #9e9f9f;
      }
    }
    .header-operate {
      margin-left: 20px;
    }
  }
  .body {
    .body-item {
      h3 {
        font-size: 22px;
        font-weight: 400;
        font-style: normal;
        line-height: 55px;
        background-color: #ebebeb;
        padding: 0 32px;
        margin: 0;
      }

      .table {
        width: 100%;
        font-size: 14px;
        background-color: #fff;
        text-align: center;
        border: 0;
        border-spacing: 0;
        .thead {
          width: 100%;
          height: 40px;
          background: 0;
          line-height: 40px;
          .table-cell {
            border-left-color: #dfdfdf;
            border-bottom-color: #dfdfdf;
            padding: 10px 32px;
            padding-top: 0;
            padding-bottom: 0;
            line-height: 46px;
            font-weight: 400;
            font-style: normal;
          }
        }
        .tbody {
          .table-cell {
            padding: 10px 32px;
            padding-top: 12px;
            padding-bottom: 12px;
            border-top: 1px solid #e6e6e6;
            font-weight: 400;
            font-style: normal;
          }
          tr:first-child .table-cell {
            border-top-width: 0;
          }
        }
      }

      .form-item {
        padding: 10px 32px;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        .form-label {
          display: inline-block;
          width: 216px;
        }
        .app-icon {
          padding: 50px;
        }
      }
    }
  }
  .tl {
    text-align: left;
  }
  .tc {
    text-align: center;
  }
  .tr {
    text-align: right;
  }
}
</style>
