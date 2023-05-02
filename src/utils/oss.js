let OSS = require('ali-oss')
export let client = new OSS({
  region: 'oss-cn-shanghai', // 填你的oss所在区域，例如oss-cn-shenzhen
  accessKeyId: 'LTAI5tEJMRGQGhgSaRZa6a3E', // 填你的oss的accessKeyId
  accessKeySecret: 'c0K5Uv1LfdHYbyJ1VSbZtB38LuxAIk', // 填你的oss的accessSecret
  bucket: 'file-oss-bucket' // 你创建的路径名称
})
