<template>
  <section class="user-content">
    <section class="header flex-row">
      <el-input class="header-search"
                placeholder="用户名/手机号/邮箱" clearable
                @keyup.enter.native="searchUser"
                v-model="form.keyword">
        <el-button slot="append"
                   icon="el-icon-search"
                   @click="searchUser"></el-button>
      </el-input>

      <el-select class="header-select"
                 v-model="form.audited"
                 placeholder="审核状态"
                 @change="searchUser">
        <el-option v-for="(item, index) of auditedOptions"
                   :key="index"
                   :label="item.label"
                   :value="item.value" />
      </el-select>

      <el-date-picker class="header-datetime"
                      v-model.number="form.createTime"
                      type="date"
                      placeholder="创建日期"
                      value-format="timestamp"
                      @change="searchUser">
      </el-date-picker>

      <el-button type="danger"
                 icon="el-icon-delete">批量删除
      </el-button>
    </section>

    <div class="table-wrap">
      <el-table border :data="form.tableData"
                @selection-change="selectUsers">
        <el-table-column align="center"
                         type="selection"
                         width="55" />
        <el-table-column align="center" width="55"
                         prop="userId"
                         label="id" />
        <el-table-column align="center"
                         width="140"
                         prop="username"
                         label="用户名" />
        <el-table-column align="center"
                         width="140" prop="phone"
                         label="手机号" />
        <el-table-column align="center"
                         width="140" prop="email"
                         label="邮箱" />
        <el-table-column align="center"
                         width="120"
                         prop="auditedTxt"
                         label="审核状态">
          <template slot-scope="scope">
            <el-tag size="mini"
                    :type="auditedStatus[scope.row.audited].type">{{auditedStatus[scope.row.audited].txt}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center"
                         label="操作">
          <template slot-scope="scope">
            <el-button size="mini"
                       @click="singleUserDetail(scope)">详情</el-button>
            <el-button size="mini" type="danger"
                       @click="delSingleUser(scope)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <section class="footer flex-row">
      <el-pagination class="pagination" background
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="pageInfo.pageIndex"
                     :page-sizes="pageInfo.pageSizes"
                     :page-size="pageInfo.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="pageInfo.total"></el-pagination>
    </section>
  </section>
</template>

<script>
import { getUserListByKeyword, deleteUser, banUser } from '@/api/v1/user'

export default {
  data () {
    return {
      auditedStatus: {
        '0': {
          txt: '待审核',
          type: 'warning'
        },
        '1': {
          txt: '认证通过',
          type: 'success'
        },
        '2': {
          txt: '认证失败',
          type: 'danger'
        }
      },
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
      form: {
        userIds: '',
        keyword: '',
        audited: null,
        createTime: null,
        tableData: [],
        deleteIds: []
      },
      pageInfo: {
        pageIndex: 1,
        pageSize: 10,
        pageSizes: [5, 10, 20, 50],
        total: 0
      }
    }
  },
  created () {
    this.pageInfo.pageIndex = this.$route.query.page ? parseInt(this.$route.query.page) : 1
    this.initData()
  },
  watch: {
    // 如果路由有变化，会再次执行该方法
    '$route' (newValue) {
      console.log('location:', window.location)
      this.initData()
    } // 只有这个页面初始化之后，这个监听事件才开始生效
  },
  methods: {
    initData () {
      this.getUserListByKeyword().then(({ pageInfo, userList }) => {
        this.form.tableData = userList.map((item) => ({
          userId: item.userId,
          username: item.username,
          realName: item.realName || '-',
          phone: item.phone || '-',
          email: item.email || '-',
          roles: item.roles.map((role) => role.replace('ROLE_', '')),
          audited: item.audited
        }))
        this.pageInfo.total = pageInfo.total
      })
    },
    addUser () {
      this.$router.push({
        name: 'addUser'
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
    // 查找用户
    searchUser () {
      this.initData()
    },
    selectUsers (row) {
      this.form.userIds = row.map((item) => item.id).join(',')
    },
    // 封号、解封
    bannedUser (scope) {
      let userId = scope.row.id
      let disabled = scope.row.disabled ? 1 : 0

      this.banUser(userId, disabled).then(() => {
        if (!disabled) {
          this.toastInfo('解封成功', 'success')
        }

        if (disabled) {
          this.toastInfo('封号成功', 'success')
        }
      }).catch(() => {
        scope.row.disabled = false
      })
    },
    // 用户详情
    singleUserDetail ({ row }) {
      this.$router.push({
        name: 'userDetail',
        query: {
          userId: row.userId
        }
      })
    },
    deleteSingleUser () { },
    // 删除用户
    delUser (scope) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteUser(scope.row.id)
            .then(() => {
              this.toastInfo('删除成功', 'success')
              this.form.tableData.forEach((item, index) => {
                if (item.id === scope.row.id) {
                  this.form.tableData.splice(index, 1)
                }
              })
            })
        })
        .catch(() => {
          this.toastInfo('已取消', 'info')
        })
    },
    getUserListByKeyword () {
      const params = {
        keyword: this.form.keyword,
        audited: this.form.audited,
        createTime: this.form.createTime,
        pageIndex: this.pageInfo.pageIndex,
        pageSize: this.pageInfo.pageSize
      }

      return new Promise((resolve, reject) => {
        getUserListByKeyword(params)
          .then(({ code, data }) => {
            if (code === 200) {
              resolve(data)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 删除用户
    deleteUser (userId) {
      return new Promise((resolve, reject) => {
        deleteUser(userId)
          .then(res => {
            if (res.success) {
              resolve(true)
            }
          })
          .catch(err => {
            reject(err)
          })
      })
    },
    // 解封或封号
    banUser (userId, disabled) {
      const params = {
        userId: userId,
        disabled: disabled
      }

      return new Promise((resolve, reject) => {
        banUser(params).then((res) => {
          if (res.success) {
            resolve(true)
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
}

.switch ::v-deep .el-switch__core {
  width: 40px !important;
}
.avatar {
  width: 50px;
  height: 50px;
}
.footer {
  box-sizing: border-box;
  padding: 20px 50px;
  justify-content: flex-end;
}
</style>
