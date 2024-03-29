/**
 * 服务端入口，仅运行于服务端
 */

// 创建一个 express 的 server 实例
const express = require('express')
const server = express()

const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('../build/setup-dev-server')
const proxyMiddleware = require('http-proxy-middleware')
const config = require('../config')

let renderer
let onReady

// 开发模式 --> 监视打包构建（客户端 + 服务端） --> 重新生成 Renderer 渲染器
onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
  renderer = createBundleRenderer(serverBundle, {
    template, // (可选) 设置页面模板
    clientManifest, // (可选) 客户端构建
  })
})

// server.use(favicon('./static/favicon.ico'))

// 开头的路径，需要与 output 中设置的 publicPath 保持一致
server.use('/dist', express.static('../dist'))

const render = async (req, res) => {
  try {
    // renderToString支持promise
    const html = await renderer.renderToString({
      // 在模板中使用外部数据(可选第二个参数)
      title: '购物天堂',
      meta: `<meta name="description" content="购物天堂">`,
      // entry-server.js用于设置服务器端router的位置
      url: req.url,
    })

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch (error) {
    console.log('err: ', error)
    res.status(500).end('Internal Server Error')
  }
}

Object.keys(config.dev.proxyTable).forEach(function (context) {
  var options = config.dev.proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }

  server.use(proxyMiddleware(options.filter || context, options))
})

/**
 * 添加路由
 * 服务端路由设置为 *，意味着所有的路由都会进入这里,不然会导致刷新页面，获取不到页面的bug
 * 并且vue-router设置的404页面无法进入
 */
server.get('/*', async (req, res) => {
  // 等待有了 Renderer 渲染器以后，调用 render 函数
  await onReady
  render(req, res)
})

server.listen(config.port, () => {
  console.log(`server running at port ${config.port}`)
})
