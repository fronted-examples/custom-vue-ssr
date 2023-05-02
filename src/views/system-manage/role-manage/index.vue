<template>
  <section>
    <el-dialog class="modal" :title="dialogTitle"
               :visible.sync="dialogFormVisible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false">
      <el-form ref="form" :model="form"
               :rules="formRules">
        <el-form-item label="角色名称"
                      prop="rolename">
          <el-input v-model="form.rolename"
                    autocomplete="off"
                    placeholder="只能输入字母">
          </el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea"
                    v-model="form.remark"
                    autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">
          取 消</el-button>
        <el-button type="primary"
                   @click="handleConfirm">确 定
        </el-button>
      </div>
    </el-dialog>

    <section class="header flex-row main-end">
      <el-button-group>
        <el-button type="success" plain
                   icon="el-icon-plus"
                   @click="openAddDialog">新增
        </el-button>
        <el-button type="danger" plain
                   icon="el-icon-delete"
                   @click="delRole">批量删除
        </el-button>
      </el-button-group>
    </section>

    <section class="table-wrap">
      <el-table border :data="tableData"
                id="export" max-height="800"
                ref="multipleTable"
                @selection-change="selectRoles">
        <el-table-column type="selection"
                         width="55"
                         align="center" />
        <el-table-column prop="roleId" label="id"
                         width="55"
                         align="center" />
        <el-table-column prop="roleName"
                         label="角色名"
                         align="center" />
        <el-table-column prop="remark" label="备注"
                         align="center" />
        <el-table-column prop="createTime"
                         label="创建日期"
                         align="center" />
        <el-table-column prop="updateTime"
                         label="更新日期"
                         align="center" />
        <el-table-column align="center"
                         label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="mini"
                       @click="editSingleRole(scope)">
              编辑
            </el-button>
            <el-button type="danger" size="mini"
                       @click="delSingleRole(scope)">
              删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script>
import { getRoleList, addRole, deleteRole, editRole } from '@/api/v1/user'
import { formatDate } from '@/utils/formateDate'

const EN_REGEX = /[A-Za-z]+/

export default {
  data () {
    const validateRolename = (rule, value, callback) => {
      if (value && !EN_REGEX.test(value)) {
        callback(new Error('只能输入英文大小写'))
      } else {
        callback()
      }
    }

    return {
      dialogTitle: '',
      dialogFormVisible: false,
      tableData: [],
      deleteIds: [],
      form: {
        id: null,
        rolename: '',
        remark: ''
      },
      formRules: {
        rolename: [{
          require: true,
          message: '请输入角色名称',
          triggle: 'blur'
        }, {
          validator: validateRolename,
          triggle: 'change'
        }]
      }
    }
  },
  created () {
    this.initData()
  },
  beforeUpdate () {
    this.$nextTick(() => {
      // 在数据加载完，重新渲染表格
      this.$refs['multipleTable'].doLayout()
    })
  },
  methods: {
    initData () {
      this.getRoleList().then(({ roleList }) => {
        this.tableData = roleList.map((item) => {
          return {
            roleId: item.roleId,
            roleName: item.roleName.replace('ROLE_', ''),
            remark: item.remark,
            createTime: formatDate(new Date(item.createTime), 'YYYY-MM-DD hh:mm:ss'),
            updateTime: formatDate(new Date(item.updateTime), 'YYYY-MM-DD hh:mm:ss')
          }
        })
      })
    },
    openAddDialog () {
      this.dialogTitle = '新增角色'
      this.dialogFormVisible = true
    },
    handleCancel () {
      this.dialogFormVisible = false
      this.form = { id: null, rolename: '', remark: '' }
    },
    handleConfirm () {
      this.$refs['form'].validate((validated) => {
        if (validated) {
          if (!this.form.id) {
            this.addRole().then(() => {
              this.toastInfo('添加成功', 'success')

              this.form = { id: null, rolename: '', remark: '' }

              this.initData()
            }).finally(() => {
              this.dialogFormVisible = false
            })
          } else {
            this.editRole().then(() => {
              this.toastInfo('修改成功', 'success')
              this.form = { id: null, rolename: '', remark: '' }

              this.initData()
            }).finally(() => {
              this.dialogFormVisible = false
            })
          }
        }
      })
    },
    selectRoles (val) {
      this.deleteIds = val.map((item) => ({
        id: item.id,
        roleName: item.roleName
      }))
    },
    // 编辑角色
    editSingleRole ({ row }) {
      this.dialogTitle = '编辑角色'
      this.dialogFormVisible = true
      this.form = {
        id: row.id,
        rolename: row.roleName,
        remark: row.remark
      }

      console.log('form: ', this.form)
    },
    delSingleRole ({ row }) {
      this.$refs.multipleTable.toggleRowSelection(row)
      this.delRole()
    },
    delRole () {
      if (!this.deleteIds.length) {
        return this.$message.error('请选择要删除的角色')
      }

      let roleNames = ''
      for (let i = 0; i < this.deleteIds.length; i++) {
        if (i === this.deleteIds.length - 1) {
          roleNames += this.deleteIds[i].roleName
        } else {
          roleNames += this.deleteIds[i].roleName + ';'
        }
      }

      this.$confirm(`此操作将永久删除${roleNames}, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'messageBox'
      })
        .then(() => {
          for (let i = 0; i < this.deleteIds.length; i++) {
            this.deleteRole(this.deleteIds[i].id).then(() => {
              this.toastInfo('删除成功', 'success')

              this.tableData.forEach((item, index) => {
                if (item.id === this.deleteIds[i].id) {
                  this.tableData.splice(index, 1)
                }
              })
            })
          }

          this.$refs.multipleTable.clearSelection()
        })
        .catch(() => {
          this.$refs.multipleTable.clearSelection()
        })
    },
    addRole () {
      const params = {
        roleName: this.form.rolename,
        remark: this.form.remark
      }

      return new Promise((resolve, reject) => {
        addRole(params).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    getRoleList () {
      return new Promise((resolve, reject) => {
        getRoleList().then(({ code, data }) => {
          if (code === 200) {
            resolve(data)
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    deleteRole (id) {
      return new Promise((resolve, reject) => {
        deleteRole(id).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    editRole () {
      const params = {
        id: this.form.id,
        roleName: this.form.rolename,
        remark: this.form.remark
      }

      return new Promise((resolve, reject) => {
        editRole(params).then(({ code }) => {
          if (code === 200) {
            resolve()
          }
        }).catch((err) => {
          reject(err)
        })
      })
    }
  }
}
</script>
<style>
.messageBox {
  width: auto;
}
</style>
<style lang="scss" scoped>
.modal ::v-deep .el-dialog {
  width: 450px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 0 !important;
}

.el-form ::v-deep .el-form-item__content {
  margin-left: 80px;
  margin-bottom: 10px;
}

.el-form ::v-deep .el-form-item__label {
  min-width: 80px;
}
.el-form ::v-deep .el-input,
.el-form ::v-deep .el-textarea {
  width: 320px;
}
.el-form ::v-deep .el-form-item__error {
  padding-top: 10px;
}

.header {
  box-sizing: border-box;
  padding: 20px 50px;
}

.table-wrap {
  box-sizing: border-box;
  padding: 0 50px;
}
</style>
