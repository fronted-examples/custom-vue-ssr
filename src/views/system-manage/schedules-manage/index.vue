<template>
  <section class="schedule-container">
    <section class="flex-row main-between">
      <div class="search flex-inline">
        <el-input v-model="searchValue"
                  placeholder="请输入bean名称或方法名"
                  clearable></el-input>
        <el-button icon="el-icon-search"
                   type="primary" @click="search">
          搜索</el-button>
      </div>

      <el-button-group>
        <el-button type="success" plain
                   icon="el-icon-plus"
                   @click="newSchedule">新增
        </el-button>
        <el-button type="danger" plain
                   icon="el-icon-delete"
                   @click="multiDel">批量删除
        </el-button>
      </el-button-group>
    </section>

    <el-table class="table" border
              :data="tableData"
              @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="60"
                       header-align="center"
                       align="center" />
      <el-table-column prop="id" label="任务id"
                       header-align="center"
                       align="center" />
      <el-table-column prop="beanName"
                       label="bean名称"
                       header-align="center"
                       align="center" />
      <el-table-column prop="methodName"
                       label="方法名"
                       header-align="center"
                       align="center" />
      <el-table-column prop="methodParams"
                       label="方法参数"
                       header-align="center"
                       align="center" />
      <el-table-column prop="cronExpression"
                       label="cron表达式"
                       header-align="center"
                       align="center" />
      <el-table-column label="状态"
                       header-align="center"
                       align="center">
        <template slot-scope="scope">
          <span
                :style="{ color: scope.row.status ? 'green' : 'red' }">{{ scope.row.statusText }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注"
                       header-align="center"
                       align="center" />
      <el-table-column label="操作"
                       header-align="center"
                       align="center">
        <template slot-scope="scope">
          <el-button type="text"
                     v-if="scope.row.status === 0"
                     style="color:#67c23a"
                     @click="startOrPauseSchedule(scope)">
            执行</el-button>
          <el-button type="text"
                     v-if="scope.row.status === 0"
                     style="color:#409eff"
                     @click="edit(scope)">编辑
          </el-button>
          <el-button type="text"
                     v-if="scope.row.status === 1"
                     style="color:#e6a23c"
                     @click="startOrPauseSchedule(scope)">
            暂停</el-button>
          <el-button type="text"
                     style="color:#f56c6c"
                     @click="delSchedule(scope)">
            删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <el-dialog :visible.sync="dialogVisible"
               width="70%" title="设置参数" center>
      <el-form label-width="130px"
               label-position="right">
        <el-form-item label="bean名称" required>
          <el-input v-model="form.beanName"
                    placeholder="bean名称">
          </el-input>
        </el-form-item>

        <el-form-item label="方法名" required>
          <el-input v-model="form.methodName"
                    placeholder="方法名"></el-input>
        </el-form-item>

        <el-form-item label="方法参数">
          <el-input v-model="form.methodParams"
                    placeholder="方法参数"></el-input>
        </el-form-item>

        <el-form-item label="cron表达式" required>
          <el-input v-model="form.cronExpression"
                    placeholder="cron表达式">
            <el-button slot="append"
                       :icon="`el-icon-arrow-${buttonIcon}`"
                       @click="toggleCronPanel"></el-button>
          </el-input>
        </el-form-item>

        <el-form-item v-if="form.cronVisible">
          <el-tabs v-model="form.activeName">
            <el-tab-pane label="秒" name="1">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每秒</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>秒</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="0"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>秒开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>秒执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 59"
                               :key="index"
                               :label="item >= 10 ? item : `0${item}`"></el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="分" name="2">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每分</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>分</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="0"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>分开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>分执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 59"
                               :key="index"
                               :label="item >= 10 ? item : `0${item}`"></el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="时" name="3">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每时</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>时</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="0"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>时开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>时执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 23"
                               :key="index"
                               :label="item >= 10 ? item : `0${item}`"></el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="日" name="4">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每日</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>日</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="0"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>日开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>日执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">工作日</el-radio>

                <span>本月</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1" :max="7"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>号，最近的工作日</span>
              </div>

              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="5" border
                          size="mini">本月最后一天</el-radio>
              </div>

              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="6" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 31"
                               :key="index"
                               :label="item >= 10 ? item : `0${item}`"></el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="月" name="5">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每月</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>月</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="0"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>月开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1"
                                 :max="59"
                                 size="small"
                                 style="width:100px"></el-input-number>
                <span>月执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 12"
                               :key="index"
                               :label="item"></el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="周" name="6">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每周</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从星期</span>
                <el-select size="mini"
                           style="width:100px;"
                           v-model="form.week">
                  <el-option v-for="(item, index) of form.weekOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
                <span>至星期</span>
                <el-select size="mini"
                           style="width:100px;"
                           v-model="form.week">
                  <el-option v-for="(item, index) of form.weekOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">循环</el-radio>
                <span>从星期</span>
                <el-select size="mini"
                           style="width:100px;"
                           v-model="form.week">
                  <el-option v-for="(item, index) of form.weekOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
                <span>周开始，每</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1" :max="7"
                                 size="small"
                                 style="width:100px;"></el-input-number>
                <span>天执行一次</span>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">指定周</el-radio>
                <span>本月第</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="1" :max="7"
                                 size="small"
                                 style="width:100px;"></el-input-number>
                <span>周，星期</span>
                <el-select size="mini"
                           style="width:100px;"
                           v-model="form.week">
                  <el-option v-for="(item, index) of form.weekOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="3" border
                          size="mini">本月最后一个</el-radio>
                <span>星期</span>
                <el-select size="mini"
                           style="width:100px;"
                           v-model="form.week">
                  <el-option v-for="(item, index) of form.weekOptions"
                             :key="index"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="4" border
                          size="mini">指定</el-radio>
                <el-checkbox-group size="mini"
                                   v-model="form.checkList">
                  <el-checkbox size="mini"
                               v-for="(item, index) of 7"
                               :key="index"
                               :label="item" />
                </el-checkbox-group>
              </div>
            </el-tab-pane>

            <el-tab-pane label="年" name="7">
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="1" border
                          size="mini">每年</el-radio>
              </div>
              <div class="el-tab-item">
                <el-radio v-model="form.secondType"
                          label="2" border
                          size="mini">周期</el-radio>
                <span>从</span>
                <el-input-number v-model="form.cycleStartNum"
                                 :min="1"
                                 :max="59"
                                 size="small"></el-input-number>
                <span>至</span>
                <el-input-number v-model="form.cycleEndNum"
                                 :min="2"
                                 :max="59"
                                 size="small"></el-input-number>
                <span>年</span>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="(item, index) in form.statuses"
                      :key="index"
                      :label="item.value">
              {{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input type="textarea"
                    v-model="form.remark"
                    placeholder="备注"></el-input>
        </el-form-item>

        <el-form-item size="large">
          <el-button type="primary"
                     @click="onSubmit"
                     :loading="loadingCreate">
            {{ submitText }}</el-button>
          <el-button @click="onCancel">取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </section>
</template>

<script>
// import { getAllSchedules, addSchedule, editSchedule, changeScheduleStatus, deleteSchedule } from '@/api/v1/system'

export default {
  data () {
    return {
      searchValue: '',
      dialogVisible: false,
      loadingCreate: false,
      tableData: [],
      scheduleIds: [],
      submitText: '立即创建',
      buttonIcon: 'down',
      buttonIconUp: 'up',
      buttonIconDown: 'down',
      form: {
        id: '',
        beanName: '',
        methodName: '',
        methodParams: '',
        cronExpression: '',
        status: 1,
        remark: '',
        cronVisible: false,
        activeName: '1',
        secondType: '1',
        cycleStartNum: 0,
        cycleEndNum: 0,
        checkList: [],
        week: 0,
        weekOptions: [{
          label: '日',
          value: 0
        }, {
          label: '一',
          value: 1
        }, {
          label: '二',
          value: 2
        }, {
          label: '三',
          value: 3
        }, {
          label: '四',
          value: 4
        }, {
          label: '五',
          value: 5
        }, {
          label: '六',
          value: 6
        }],
        statuses: [{
          label: '正常',
          value: 1
        }, {
          label: '暂停',
          value: 0
        }]
      },
      pageInfo: {
        pageIndex: 1,
        pageSize: 20,
        total: 0,
        pageSizes: [5, 10, 20, 50]
      }
    }
  },
  watch: {
    form: {
      handler (newVal) {
        console.log('newVal: ', newVal)
      },
      deep: true
    }
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      // this.getSchedules().then(({ pageInfo, scheduleList }) => {
      //   this.pageInfo.pageIndex = pageInfo.pageIndex
      //   this.pageInfo.total = pageInfo.totalSize
      //   this.tableData = scheduleList

      //   this.tableData.forEach((item) => {
      //     item.statusText = item.status ? '正常' : '暂停'
      //   })
      // })
    },
    search () {
      this.initData()
    },
    newSchedule () {
      this.dialogVisible = true
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
    handleSelectionChange (val) {
      this.scheduleIds = val.map((item) => {
        return item.id
      })
    },
    multiDel () {
      this.delCommon(this.scheduleIds)
    },
    toggleCronPanel () {
      if (this.buttonIcon === this.buttonIconDown) {
        this.buttonIcon = this.buttonIconUp
        this.form.cronVisible = true
      } else {
        this.buttonIcon = this.buttonIconDown
        this.form.cronVisible = false
      }
    },
    edit ({ row }) {
      this.form.id = row.id
      this.form.beanName = row.beanName
      this.form.methodName = row.methodName
      this.form.methodParams = row.methodParams
      this.form.cronExpression = row.cronExpression
      this.form.status = row.status
      this.form.remark = row.remark

      this.dialogVisible = true
      this.submitText = '立即修改'
    },
    startOrPauseSchedule ({ row }) {
      row.status = row.status ? 0 : 1
      row.statusText = row.status ? '正常' : '暂停'

      this.changeScheduleStatus(row).then(() => {
        if (row.status) {
          this.toastInfo('开启成功')
        }

        if (!row.status) {
          this.toastInfo('暂停成功')
        }
      })
    },
    delSchedule ({ row }) {
      this.delCommon([row.id])
    },
    delCommon (scheduleIds) {
      this.$confirm('此操作将永久删除该定时任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteSchedule(scheduleIds)
            .then(() => {
              this.toastInfo('删除成功')

              scheduleIds.forEach((id) => {
                this.tableData.forEach((item, index) => {
                  if (item.id === id) {
                    this.tableData.splice(index, 1)
                  }
                })
              })
            })
        })
        .catch(() => {
        })
    },
    onSubmit () {
      if (!this.form.beanName) {
        return this.toastInfo('bean名称不能为空', 'error')
      }

      if (!this.form.methodName) {
        return this.toastInfo('方法名称不能为空', 'error')
      }

      if (!this.form.cronExpression) {
        return this.toastInfo('cron表达式不能为空', 'error')
      }

      this.loadingCreate = true

      if (!this.form.id) {
        return this.addSchedule()
          .then(() => {
            this.toastInfo('添加成功')

            this.dialogVisible = false
            this.initData()
          })
          .finally(() => {
            this.loadingCreate = false
          })
      }

      this.editSchedule().then(() => {
        this.toastInfo('编辑成功')
        this.form.id = ''
        this.dialogVisible = false
        this.submitText = '立即创建'
        this.initData()
      }).finally(() => {
        this.loadingCreate = false
      })
    },
    onCancel () {
      if (this.form.id) {
        this.form.id = ''
        this.form.beanName = ''
        this.form.methodName = ''
        this.form.methodParams = ''
        this.form.cronExpression = ''
        this.form.status = 1
        this.form.remark = ''
      }

      this.dialogVisible = false
      this.submitText = '立即创建'
    }
    // addSchedule () {
    //   return new Promise((resolve, reject) => {
    //     const params = {
    //       beanName: this.form.beanName,
    //       methodName: this.form.methodName,
    //       methodParams: this.form.methodParams,
    //       cronExpression: this.form.cronExpression,
    //       status: this.form.status,
    //       remark: this.form.remark
    //     }
    //     addSchedule(params).then((res) => {
    //       if (res.success) {
    //         const result = res.data

    //         resolve(result)
    //       }
    //     }).catch((err) => {
    //       reject(err)
    //     })
    //   })
    // },
    // editSchedule () {
    //   return new Promise((resolve, reject) => {
    //     const params = {
    //       id: this.form.id,
    //       beanName: this.form.beanName,
    //       methodName: this.form.methodName,
    //       methodParams: this.form.methodParams,
    //       cronExpression: this.form.cronExpression,
    //       status: this.form.status,
    //       remark: this.form.remark
    //     }
    //     editSchedule(params).then((res) => {
    //       if (res.success) {
    //         resolve(true)
    //       }
    //     }).catch((err) => {
    //       reject(err)
    //     })
    //   })
    // },
    // changeScheduleStatus (schedule) {
    //   return new Promise((resolve, reject) => {
    //     const params = {
    //       status: schedule.status
    //     }

    //     changeScheduleStatus(schedule.id, params).then((res) => {
    //       if (res.success) {
    //         resolve()
    //       }
    //     }).catch((err) => {
    //       reject(err)
    //     })
    //   })
    // },
    // deleteSchedule (ids) {
    //   return new Promise((resolve, reject) => {
    //     const params = {
    //       ids: ids
    //     }

    //     deleteSchedule(params).then((res) => {
    //       if (res.success) {
    //         resolve()
    //       }
    //     }).catch((err) => {
    //       reject(err)
    //     })
    //   })
    // },
    // getSchedules () {
    //   return new Promise((resolve, reject) => {
    //     const params = {
    //       keyword: this.searchValue
    //     }

    //     const pageInfo = {
    //       pageIndex: this.pageInfo.pageIndex,
    //       pageSize: this.pageInfo.pageSize
    //     }

    //     getAllSchedules(params, pageInfo).then((res) => {
    //       if (res.success) {
    //         const result = res.data
    //         resolve(result)
    //       }
    //     }).catch((err) => {
    //       reject(err)
    //     })
    //   })
    // }
  }
}
</script>

<style lang="scss" scoped>
.schedule-container {
  padding: 20px 50px;
}
.search {
  width: 350px;
  .el-input ::v-deep .el-input__inner {
    height: 100%;
  }
  .el-button {
    width: 100px;
    height: unset;
    margin-left: 10px;
    font-size: 14px;
  }
}
.table {
  margin-top: 20px;
}
.footer {
  box-sizing: border-box;
  padding: 20px 0 20px 50px;
  justify-content: flex-end;
}

.el-dialog__wrapper {
  ::v-deep .el-dialog,
  ::v-deep .el-dialog__header {
    border-radius: 10px;
  }
  ::v-deep .el-dialog__header {
    background-color: #de7f4c;
    padding: 10px 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    .el-dialog__title {
      font-size: 25px;
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

.el-tabs {
  padding: 20px;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);
  .el-tab-item {
    margin-top: 10px;
  }
}
</style>
