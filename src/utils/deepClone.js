/**
 * 获取数据类型
 * @param {All} [o] 需要检测的数据
 * @returns {String}
 */
export function getType (o) {
  return Object.prototype.toString.call(o).slice(8, -1)
}

/**
 * 判断是否是指定数据类型
 * @param {All} [o] 需要检测的数据
 * @param {String} [type] 数据类型
 * @returns {Boolean}
 */
export function isKeyType (o, type) {
  return getType(o).toLowerCase() === type.toLowerCase()
}

/**
 * 深拷贝，支持常见类型 object Date Array等引用类型
 * @param {Any} sth
 * @return {Any}
 */
export function deepClone (sth) {
  let copy
  if (sth == null || typeof sth !== 'object') return sth
  if (isKeyType(sth, 'date')) {
    copy = new Date()
    copy.setTime(sth.getTime())
    return copy
  }
  if (isKeyType(sth, 'array')) {
    copy = []
    for (let i = 0, len = sth.length; i < len; i++) {
      copy[i] = deepClone(sth[i])
    }
    return copy
  }
  if (isKeyType(sth, 'object')) {
    copy = {}
    for (let attr in sth) {
      if (sth.hasOwnProperty(attr)) copy[attr] = deepClone(sth[attr])
    }
    return copy
  }
  return null
}
