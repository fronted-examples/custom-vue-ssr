export const formatDate = (date, fmt) => {
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'D+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

export function formatTime (value, symbol) {
  var secondTime = parseInt(value)// 秒
  var minuteTime = 0// 分
  var hourTime = 0// 小时

  if (secondTime > 60) { // 如果秒数大于60，将秒数转换成整数
    // 获取分钟，除以60取整数，得到整数分钟
    minuteTime = parseInt(secondTime / 60)
    // 获取秒数，秒数取佘，得到整数秒数
    secondTime = parseInt(secondTime % 60)
    // 如果分钟大于60，将分钟转换成小时
    if (minuteTime > 60) {
      // 获取小时，获取分钟除以60，得到整数小时
      hourTime = parseInt(minuteTime / 60)
      // 获取小时后取佘的分，获取分钟除以60取佘的分
      minuteTime = parseInt(minuteTime % 60)
    }
  }

  let time = ''

  if (symbol) {
    time = (minuteTime ? '' : '00:') + (parseInt(secondTime) >= 10 ? `${parseInt(secondTime)}` : `0${parseInt(secondTime)}`)

    if (minuteTime > 0) time = (parseInt(minuteTime) >= 10 ? `${parseInt(minuteTime)}` : `0${parseInt(minuteTime)}`) + ':' + time

    if (hourTime > 0) time = (parseInt(hourTime) >= 10 ? `${parseInt(hourTime)}` : `0${parseInt(hourTime)}`) + ':' + time

    return time
  }

  time = '' + parseInt(secondTime) + '秒'

  if (minuteTime > 0) {
    time = '' + parseInt(minuteTime) + '分' + time
  }
  if (hourTime > 0) {
    time = '' + parseInt(hourTime) + '小时' + time
  }

  return time
}

function padLeftZero (str) {
  return ('00' + str).substr(str.length)
}

export function str2Date (dateStr, separator) {
  if (!separator) {
    separator = '-'
  }
  let dateArr = dateStr.split(separator)
  let year = parseInt(dateArr[0])
  let month
  // 处理月份为04这样的情况
  if (dateArr[1].indexOf('0') === 0) {
    month = parseInt(dateArr[1].substring(1))
  } else {
    month = parseInt(dateArr[1])
  }
  let day = parseInt(dateArr[2])
  let date = new Date(year, month - 1, day)
  return date
}
