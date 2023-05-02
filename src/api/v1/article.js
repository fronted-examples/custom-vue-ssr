import request from '@/utils/request'

/**
 * 发布文章
 * @param {*} data
 * @returns
 */
export const publishArticle = data => {
  return request({
    url: '/article/publishArticle',
    method: 'post',
    data
  })
}

/**
 * 获取epub图书的目录
 * @param {*} params
 * @returns
 */
export const getEpubMenusContent = params => {
  return request({
    url: '/epub/getEpubMenusContent',
    method: 'get',
    params
  })
}
