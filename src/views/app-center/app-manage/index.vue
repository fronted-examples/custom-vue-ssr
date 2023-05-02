<template>
  <section class="app-content">
    <section class="header flex-row">
      <el-input class="header-search"
                placeholder="应用名称" clearable
                @keyup.enter.native="searchUser"
                v-model="keyword">
        <el-button slot="append"
                   icon="el-icon-search"
                   @click="searchApp"></el-button>
      </el-input>

    </section>

    <section class="header flex-row main-end">
      <div class="bubble_tips bubble_right">
        <div class="bubble_tips_inner">
          <p class="mass_send_tips" id="tips">
            <span>还可创建 10 个网站应用</span>
          </p>
        </div>
        <i class="bubble_tips_arrow out"></i>
        <i class="bubble_tips_arrow in"></i>
      </div>
      <el-button type="success"
                 @click="createApp">创建新应用
      </el-button>
    </section>

    <section class="table-wrap">
      <el-table :data="tableData"
                :header-row-class-name="setTableHeaderStyle">
        <el-table-column label="应用名称"
                         prop="appName"
                         align="center" />
        <el-table-column label="状态"
                         align="center">
          <template slot-scope="scope">
            <el-tag
                    :type="auditedStatus[scope.row.audited].type">
              {{auditedStatus[scope.row.audited].txt}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作"
                         align="center">
          <template slot-scope="scope">
            <el-button type="text"
                       @click="checkApp(scope)">查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script>
import { getAppListByKeyword } from '@/api/v1/user'

export default {
  name: 'AppManage',
  data () {
    return {
      auditedStatus: {
        '0': {
          txt: '审核中',
          type: 'warning'
        },
        '1': {
          txt: '审核通过',
          type: 'success'
        },
        '2': {
          txt: '审核未通过',
          type: 'danger'
        }
      },
      tableData: [],
      visible: false,
      keyword: '',
      pageInfo: {
        pageIndex: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      this.getAppListByKeyword().then(({ appList }) => {
        this.tableData = appList
      })
    },
    searchApp () {
      this.initData()
    },
    createApp () {
      this.$router.push({
        name: 'appCreate'
      })
    },
    checkApp ({ row }) {
      this.$router.push({
        name: 'appDetail',
        query: {
          appId: row.appId
        }
      })
    },
    getAppListByKeyword () {
      const params = {
        keyword: this.keyword
      }

      return new Promise((resolve, reject) => {
        getAppListByKeyword(params).then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => { reject(err) })
      })
    },
    setTableHeaderStyle ({ row, column, rowIndex, columnIndex }) {
      console.log('columnIndex: ', rowIndex)
      if (rowIndex === 0) {
        return 'table-header'
      }

      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.app-content {
  padding: 20px;
}
.app-content::after {
  content: '';
  display: block;
  width: 0;
  height: 50px;
}

.header {
  box-sizing: border-box;
}
.header-search {
  width: 280px;
  height: 45px;
  margin-right: 10px;
}
.header-search ::v-deep .el-input__inner {
  height: 100%;
  line-height: 100%;
}

.bubble_left {
  margin-left: 6px;
}

.bubble_right {
  margin-right: 12px;
}

.bubble_tips {
  display: inline-block;
  vertical-align: middle;
  position: relative;
  color: #c1c2c3;
}

.bubble_tips_inner {
  box-sizing: border-box;
  word-wrap: normal;
  word-break: normal;
  padding: 10px 12px;
  border: 1px solid #e6e7ec;
  background-color: #fff;
}

.mass_send_tips {
  font-size: 12px;
  color: #9e9f9f;
  margin: 0;
}

.bubble_left .bubble_tips_arrow {
  position: absolute;
  top: 50%;
  margin-top: -6px;
  display: inline-block;
  width: 0;
  height: 0;
  border-width: 6px;
  border-style: dashed;
  border-color: transparent;
  border-left-width: 0;
  border-right-color: #fff;
  border-right-style: solid;
}

.bubble_right .bubble_tips_arrow {
  position: absolute;
  top: 50%;
  margin-top: -6px;
  display: inline-block;
  width: 0;
  height: 0;
  border-width: 6px;
  border-style: dashed;
  border-color: transparent;
  border-right-width: 0;
  border-left-color: #fff;
  border-left-style: solid;
}

.bubble_left .bubble_tips_arrow.out {
  border-right-color: #e6e7ec;
  left: -6px;
}

.bubble_right .bubble_tips_arrow.out {
  border-left-color: #e6e7ec;
  right: -6px;
}

.bubble_left .bubble_tips_arrow.in {
  left: -5px;
}

.bubble_right .bubble_tips_arrow.in {
  right: -5px;
}

.table-wrap {
  box-sizing: border-box;
  margin-top: 20px;
}

.el-table ::v-deep .table-header th {
  background-color: #ebeef0;
}
</style>
