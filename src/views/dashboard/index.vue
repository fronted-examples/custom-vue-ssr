<template>
  <section class="dashboard">
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="always">
          <h3>用户</h3>
          <div class="flex-row main-between">
            <label>总量</label>
            <label></label>
          </div>
          <div class="flex-row main-between">
            <label>增量</label>
            <label></label>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always">
          <h3>应用</h3>
          <div class="flex-row main-between">
            <label>总量</label>
            <label></label>
          </div>
          <div class="flex-row main-between">
            <label>增量</label>
            <label></label>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="chart"></div>
  </section>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data () {
    return {
      chart: null,
      option: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        legend: {
          data: ['Evaporation', 'Precipitation', 'Temperature']
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Precipitation',
            min: 0,
            max: 250,
            interval: 50,
            axisLabel: {
              formatter: '{value} ml'
            }
          },
          {
            type: 'value',
            name: 'Temperature',
            min: 0,
            max: 25,
            interval: 5,
            axisLabel: {
              formatter: '{value} °C'
            }
          }
        ],
        series: [
          {
            name: 'Evaporation',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              }
            },
            data: [
              2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
            ]
          },
          {
            name: 'Precipitation',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' ml'
              }
            },
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ]
          },
          {
            name: 'Temperature',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' °C'
              }
            },
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
          }
        ]
      }
    }
  },
  created () {
    this.$nextTick(() => {
      this.chart = echarts.init(document.querySelector('.chart'))
      this.chart.setOption(this.option)
    })
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  min-height: 630px; /**解决父子元素底部margin合并的问题 */

  h3 {
    margin: 0;
    font-weight: 400;
    font-style: normal;
    text-align: center;
  }
  .chart {
    width: 100%;
    height: 450px;
    margin-top: 10px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
}
</style>
