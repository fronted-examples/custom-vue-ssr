/**
 * user相关api的第一代版本
 */
import request from '@/utils/request'

/**
 * 注册
 * @param {Object} data
 * @returns {Promise}
 */
export const userRegister = data => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 发送邮箱或手机验证码
 * @param {Object} params
 * @returns {Promise}
 */
export const sendCode = (params) => {
  return request({
    url: '/auth/sendCode',
    method: 'get',
    params
  })
}

/**
 * 获取验证码
 * @returns
 */
export const getCode = () => {
  return request({
    url: '/auth/getRandomCode',
    method: 'get',
    responseType: 'arraybuffer'
  })
}

/**
 * 登录
 * @param {Object} data
 * @returns {Promise}
 */
export const userLogin = data => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 退出登录
 * @returns {Promise}
 */
export const userLogout = () => {
  return request({
    url: '/logout',
    method: 'post'
  })
}

/**
 * 校验手机号
 * @param {Object} data
 * @returns {Promise}
 */
export const certifiedUser = (data) => {
  return request({
    url: '/user/certifiedUser',
    method: 'post',
    data
  })
}

/**
 * 获取主体类型列表
 * @returns {Promise}
 */
export const getSubjectList = () => {
  return request({
    url: '/subject/getSubjectList',
    method: 'get'
  })
}

/**
 * 获取登录用户信息
 * @returns {Promise}
 */
export const getUserInfo = () => {
  return request({
    url: '/user/getUserInfo',
    method: 'get'
  })
}

/**
 * 删除用户
 * @param {number} id 用户id
 * @returns {Promise}
 */
export const deleteUser = id => {
  return request({
    url: `/user/deleteUser/${id}`,
    method: 'delete'
  })
}

/**
 * 根据关键词获取所有用户
 * @param {Object} params
 * @param {Object} data
 * @returns {Promise}
 */
export const getUserListByKeyword = (params, data) => {
  return request({
    url: '/user/getUserListByKeyword',
    method: 'post',
    params,
    retryTimes: 2 // 重试请求的次数
  })
}

/**
 * 根据userId获取用户信息
 * @param {number} userId
 * @returns {Promise}
 */
export const getUserById = (userId) => {
  return request({
    url: `/user/getUserById/${userId}`
  })
}

/**
 * 编辑用户
 * @param {Object} data
 * @returns {Promise}
 */
export const editUserById = (data) => {
  return request({
    url: '/user/editUserById',
    method: 'patch',
    data
  })
}

/**
 * 封号、解封
 * @param {*} params
 * @returns
 */
export const banUser = (params) => {
  return request({
    url: '/user/banUser',
    method: 'PATCH',
    params
  })
}

/**
 * 修改密码
 * @param {Object} data
 * @returns {Promise}
 */
export const changePassword = data => {
  return request({
    url: '/user/changePassword',
    method: 'patch',
    data
  })
}

/**
 * 获取角色列表
 * @returns {Promise}
 */
export const getRoleList = () => {
  return request({
    url: '/role/getRoleList',
    method: 'get'
  })
}

/**
 * 添加角色
 * @param {Object} data
 * @returns {Promise}
 */
export const addRole = (data) => {
  return request({
    url: '/role/addRole',
    method: 'post',
    data
  })
}

/**
 * 删除角色
 * @param {number} id
 * @returns {Promise}
 */
export const deleteRole = (id) => {
  return request({
    url: `/role/deleteRole/${id}`,
    method: 'delete'
  })
}

/**
 * 编辑角色
 * @param {Object} data
 * @returns {Promise}
 */
export const editRole = (data) => {
  return request({
    url: '/role/editRole',
    method: 'patch',
    data
  })
}

/**
 * 新增应用
 * @param {Object} data
 * @returns {Promise}
 */
export const addApp = (data) => {
  return request({
    url: '/app/addApp',
    method: 'post',
    data
  })
}

/**
 * 根据关键词获取应用列表
 * @param {Object} params
 * @param {Object} data
 * @returns {Promise}
 */
export const getAppListByKeyword = (params, data) => {
  return request({
    url: '/app/getAppListByKeyword',
    method: 'post',
    params,
    data
  })
}

/**
 * 根据appId获取应用信息
 * @param {Object} params
 * @returns {Promise}
 */
export const getAppById = (params) => {
  return request({
    url: '/app/getAppById',
    method: 'get',
    params
  })
}

/**
 * 获取所有待审核的应用
 * @param {Object} params
 * @returns {Promise}
 */
export const getUnAuditedAppListByKeyword = (params) => {
  return request({
    url: '/app/getUnAuditedAppListByKeyword',
    method: 'get',
    params
  })
}

/**
 * 应用审核
 * @param {Number} appId
 * @param {Object} params
 * @returns {Promise}
 */
export const auditApp = (appId, params) => {
  return request({
    url: `/app/auditApp/${appId}`,
    method: 'patch',
    params
  })
}

/**
 * 根据id删除应用
 * @param {Number} appId
 * @returns {Promise}
 */
export const delAppById = (appId) => {
  return request({
    url: `/app/deleteApp/${appId}`,
    method: 'delete'
  })
}

/**
 * 发送即时通讯消息
 * @param {Object} data
 * @returns {Promise}
 */
export const sendSingleMessage = (data) => {
  return request({
    url: '/message/sendSingleMessage',
    method: 'post',
    data
  })
}
