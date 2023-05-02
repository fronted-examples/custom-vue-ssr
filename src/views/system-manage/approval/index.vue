<template>
  <section class="approval-content">
    <section class="header flex-row">
      <el-input class="header-search"
                placeholder="应用名" clearable
                @keyup.enter.native="searchApp"
                v-model="keyword">
        <el-button slot="append"
                   icon="el-icon-search"
                   @click="searchApp" />
      </el-input>

      <el-select class="header-select"
                 v-model="audited"
                 placeholder="审核状态"
                 @change="searchApp">
        <el-option v-for="(item, index) of auditedOptions"
                   :key="index"
                   :label="item.label"
                   :value="item.value" />
      </el-select>

      <el-date-picker class="header-datetime"
                      v-model.number="createTime"
                      type="date"
                      placeholder="创建日期"
                      value-format="timestamp"
                      @change="searchApp">
      </el-date-picker>
    </section>

    <div class="table-wrap">
      <el-table :data="tableData"
                :header-row-class-name="setTableHeaderStyle">
        <el-table-column align="center"
                         min-width="20"
                         prop="appId"
                         label="appId" />
        <el-table-column align="center"
                         prop="appName"
                         label="应用名称" />
        <el-table-column align="center"
                         prop="createTime"
                         label="创建日期" />
        <el-table-column align="center"
                         label="操作">
          <template slot-scope="scope">
            <el-button type="text"
                       v-if="!scope.row.audited"
                       @click="singleAppDetail(scope)">
              审 核</el-button>
            <el-button type="text"
                       v-if="scope.row.audited"
                       @click="singleAppDetail(scope)">
              查 看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <section class="footer flex-row main-end">
      <el-pagination class="pagination" background
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="pageInfo.pageIndex"
                     :page-sizes="pageInfo.pageSizes"
                     :page-size="pageInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="pageInfo.total" />
    </section>

    <el-dialog title="审核"
               :visible.sync="dialogVisible"
               width="50%"
               :close-on-click-modal="false"
               v-if="appInfo" center>
      <div class="app-detail">
        <div class="app-item flex-row">
          <label class="app-label">应用名称：</label>
          <div class="app-input">
            {{ appInfo.appName }}</div>
        </div>

        <div class="app-item flex-row">
          <label class="app-label">授权回调域：</label>
          <div class="app-input">
            {{ appInfo.appRedirectUrl }}</div>
        </div>

        <div class="app-item flex-row">
          <label class="app-label">应用描述：</label>
          <div class="app-input">
            {{ appInfo.appDescription }}</div>
        </div>

        <div class="app-item flex-row">
          <label class="app-label">审核操作：</label>
          <div class="app-input">
            <el-radio-group v-model="appInfo.audited"
                            @change="selectAuditedStatus">
              <el-radio :label="1"
                        data-type="approve">通
                过</el-radio>
              <el-radio :label="2"
                        data-type="reject">拒
                绝</el-radio>
            </el-radio-group>

            <span v-if="auditedTipVisible"
                  class="error-tip">请选择审核操作</span>
          </div>
        </div>

        <div class="app-item flex-row"
             v-if="appInfo.audited === 2">
          <label class="app-label">拒绝原因：</label>
          <div class="app-input">
            <el-input v-model="rejectRemark"
                      placeholder="拒绝理由"
                      type="textarea"
                      @blur="inputRejectRemark" />
            <span v-if="remarkTipVisible"
                  class="error-tip">请输入拒绝理由</span>
          </div>
        </div>

      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success"
                   :loading="loading"
                   @click="confirm">
          确 认</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { getUnAuditedAppListByKeyword, auditApp } from '@/api/v1/user'
import { formatDate } from '@/utils/formateDate'

export default {
  name: 'Approval',
  data () {
    return {
      dialogVisible: false,
      auditedTipVisible: false,
      remarkTipVisible: false,
      loading: false,
      keyword: '',
      auditedOptions: [{
        label: '全部',
        value: null
      }, {
        label: '待审核',
        value: 0
      }, {
        label: '审核通过',
        value: 1
      }, {
        label: '未通过审核',
        value: 2
      }],
      tableData: [],
      appIds: [],
      appInfo: null,
      audited: null,
      createTime: null,
      rejectRemark: '',
      pageInfo: {
        pageIndex: 1,
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        total: 0
      }
    }
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    '$route' (newValue) {
      console.log('location:', window.location)
      this.initData()
    }
  },
  created () {
    this.pageInfo.pageIndex = this.$route.query.page ? parseInt(this.$route.query.page) : 1
    this.initData()
  },
  methods: {
    initData () {
      this.getUnAuditedAppListByKeyword().then(({ appList, pageInfo }) => {
        this.tableData = appList.map((app) => {
          return {
            appId: app.appId,
            appName: app.appName,
            appRedirectUrl: app.appRedirectUrl,
            appDescription: app.appDescription || '-',
            audited: app.audited,
            createTime: formatDate(new Date(app.createTime), 'YYYY-MM-DD hh:mm:ss')
          }
        })

        this.pageInfo.total = pageInfo.total
      })
    },
    searchApp () {
      this.initData()
    },
    singleAppDetail ({ row }) {
      this.dialogVisible = true
      this.appInfo = row
    },
    selectAuditedStatus () {
      this.auditedTipVisible = false
    },
    inputRejectRemark (e) {
      if (e.target.value) {
        this.remarkTipVisible = false
      } else {
        this.remarkTipVisible = true
      }
    },
    confirm () {
      if (this.appInfo && !this.appInfo.audited) {
        // eslint-disable-next-line no-return-assign
        return this.auditedTipVisible = true
      }

      if (this.audited === 2 && !this.rejectRemark) {
        // eslint-disable-next-line no-return-assign
        return this.remarkTipVisible = true
      }

      this.loading = true
      this.auditApp().then((message) => {
        this.$message.success(message)
      }).finally(() => {
        this.loading = false
        this.auditedTipVisible = false
        this.remarkTipVisible = false
        this.audited = null

        this.dialogVisible = false
        this.initData()
      })
    },
    // 当前页的记录数
    handleSizeChange (val) {
      this.pageInfo.pageSize = val
      this.initData()
    },
    // 当前页
    handleCurrentChange (val) {
      this.pageInfo.pageIndex = val

      this.$router.replace({
        path: this.$route.path,
        query: {
          page: val
        }
      })
    },
    auditApp () {
      const params = {
        audited: this.appInfo.audited,
        rejectRemark: this.rejectRemark
      }

      return new Promise((resolve, reject) => {
        auditApp(this.appInfo.appId, params).then(({ code, message }) => {
          if (code === 200) {
            resolve(message)
          }
        }).catch((err) => { reject(err) })
      })
    },
    getUnAuditedAppListByKeyword () {
      const params = {
        keyword: this.keyword,
        audited: this.audited,
        createTime: this.createTime,
        pageIndex: this.pageInfo.pageIndex,
        pageSize: this.pageInfo.pageSize
      }

      return new Promise((resolve, reject) => {
        getUnAuditedAppListByKeyword(params).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => { reject(err) })
      })
    },
    setTableHeaderStyle ({ rowIndex }) {
      if (rowIndex === 0) {
        return 'table-header'
      }

      return ''
    }
  }
}
</script>
<style lang="scss" scoped>
.approval-content {
  &::after {
    content: '';
    display: block;
    height: 60px;
  }
  .header {
    box-sizing: border-box;
    padding: 20px 50px;
  }
  .header-search,
  .header-select,
  .header-datetime {
    width: 240px;
    height: 40px;
    margin-right: 10px;
    ::v-deep .el-input__inner,
    ::v-deep .el-input,
    .el-input__inner {
      height: 100%;
      line-height: 100%;
    }
  }

  .table-wrap {
    box-sizing: border-box;
    padding: 0 50px;

    .el-table {
      max-height: 350px;
      ::v-deep .el-table__body-wrapper {
        max-height: 310px;
        overflow-y: auto;
      }

      ::v-deep .el-table__body {
        width: auto !important;
      }

      ::v-deep .table-header th {
        background-color: #ebeef0;
      }
    }
  }

  .footer {
    box-sizing: border-box;
    padding: 20px 50px;
    justify-content: flex-end;
  }

  .el-dialog__wrapper {
    ::v-deep .el-dialog,
    ::v-deep .el-dialog__header {
      border-radius: 10px;
    }
    ::v-deep .el-dialog__header {
      background-color: #ffcc00;
      padding: 10px 0;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      .el-dialog__title {
        font-size: 18px;
        color: #fff;
      }
      .el-dialog__headerbtn {
        font-size: 25px;
        top: 10px;
        .el-dialog__close {
          color: #fff;
        }
      }
    }
  }
  .el-dialog {
    .app-detail {
      .app-item {
        font-size: 16px;
        font-weight: 400;
        font-style: normal;
        color: #121212;
        margin-bottom: 20px;
        .app-label {
          display: inline-block;
          width: 180px;
        }
        .app-input {
          width: 100%;
          ::v-deep .el-radio__inner {
            width: 18px;
            height: 18px;
          }

          ::v-deep .el-textarea__inner {
            resize: none;
            padding: 8px 0 8px 15px;
          }

          .el-radio[data-type='reject'] {
            ::v-deep .el-radio__input.is-checked + .el-radio__label {
              color: #ff6666;
            }
            ::v-deep .el-radio__input.is-checked .el-radio__inner {
              border-color: #ff6666;
              background-color: #ff6666;
              &::before,
              &::after {
                position: absolute;
                content: ' ';
                background-color: #fff;
                width: 0px;
                height: 14px;
                border: 1px solid #fff;
                left: 8px;
                top: 1px;
                transition: transform 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
              }

              &::before {
                transform: rotate(45deg);
              }

              &::after {
                transform: rotate(-45deg);
              }
            }
          }

          .el-radio[data-type='approve'] {
            ::v-deep .el-radio__input.is-checked + .el-radio__label {
              color: #99cc33;
            }
            ::v-deep .el-radio__input.is-checked .el-radio__inner {
              border-color: #99cc33;
              background-color: #99cc33;
              &::after {
                content: '';
                display: inline-block;
                width: 6px;
                height: 12px;
                background: transparent;
                border-radius: 0;
                border-right: 2px solid #fff;
                border-bottom: 2px solid #fff;
                transform: rotate(40deg);
                transition: transform 0.15s cubic-bezier(0.075, 0.82, 0.165, 1);
                position: absolute;
                top: 0;
                left: 4px;
              }
            }
          }

          .error-tip {
            display: block;
            padding-top: 10px;
            font-size: 12px;
            color: #ff6666;
            font-weight: 400;
            font-style: normal;
          }
        }
      }
    }
  }
}
</style>
