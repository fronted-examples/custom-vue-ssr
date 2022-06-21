/**
 * 服务端入口，仅运行于服务端
 */
// 创建一个 express 的 server 实例
const express = require('express')
const server = express()
const fs = require('fs')
const favicon = require('serve-favicon')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('../build/setup-dev-server')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
      title: 'vue ssr',
      meta: `<meta name="description" content="vue-SSR">`,
      // entry-server.js用于设置服务器端router的位置
      url: req.url,
    })

    // console.log('html: ', html)

    // /**
    //  * 使用jsdom虚拟化window对象，以免使用SSR的时候报错
    //  */
    // const DOM = new JSDOM(html, {
    //   url: 'http:/localhost:3000',
    //   resources: 'usable',
    //   runScripts: global.UNSAFE_MODE ? 'dangerously' : 'outside-only',
    // })
    // global.window = DOM.window
    // global.document = global.window.document
    // global.navigator = global.window.navigator
    // //因为有些时候我们为了方便直接使用 Node 或者 navigator使用
    // //并没有window.Node window.navigator 所以也得把这些在window下常用的对象扩展到global中
    // global.requestAnimationFrame = global.window.requestAnimationFrame
    // global.cancelAnimationFrame = global.window.cancelAnimationFrame
    // global.Node = global.window.Node
    // global.NodeList = global.window.NodeList
    // global.DOMParser = global.window.DOMParser

    // console.log('global: ', global.window.location, global.window.location.origin)

    // require('../static/flexible')

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(html)
  } catch (error) {
    console.log('err: ', error)
    res.status(500).end('Internal Server Error')
  }
}

// 添加路由
// 服务端路由设置为 *，意味着所有的路由都会进入这里,不然会导致刷新页面，获取不到页面的bug
// 并且vue-router设置的404页面无法进入
server.get('/vue-ssr/*', async (req, res) => {
  // 等待有了 Renderer 渲染器以后，调用 render 函数
  await onReady
  render(req, res)
})

server.listen(3000, () => {
  console.log('server running at port 3000')
})
