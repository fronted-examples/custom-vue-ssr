import Vue from 'vue'
import Router from 'vue-router'


import Login from '@/views/login/index'
import Layout from '@/layout/index'

const Register = resolve => require(['@/views/register/index'], resolve)

// 使用了vue-routerd的[Lazy Loading Routes](https://router.vuejs.org/en/advanced/lazy-loading.html)
const dashboard = resolve => require(['@/views/dashboard/index'], resolve)

const personal = resolve => require(['@/views/personal/index'], resolve)

const userAuth = resolve => require(['@/views/user-auth/index'], resolve)

const appManage = resolve =>
  require(['@/views/app-center/app-manage/index'], resolve)
const appCreate = resolve =>
  require(['@/views/app-center/app-create/index'], resolve)
const appDetail = resolve =>
  require(['@/views/app-center/app-detail/index'], resolve)

const noticeManage = resolve =>
  require(['@/views/app-center/notice-manage/index'], resolve)

const roleManage = resolve =>
  require(['@/views/system-manage/role-manage/index'], resolve)
const userManage = resolve =>
  require(['@/views/system-manage/user-manage/index'], resolve)
const userDetail = resolve =>
  require(['@/views/system-manage/user-detail/index'], resolve)

const schedules = resolve =>
  require(['@/views/system-manage/schedules-manage/index'], resolve)
const dictionaryManage = resolve =>
  require(['@/views/system-manage/dictionary-manage/index'], resolve)

const messageManage = resolve =>
  require(['@/views/system-manage/message-manage/index'], resolve)

const approval = resolve =>
  require(['@/views/system-manage/approval/index'], resolve)

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) {
    return originalPush.call(this, location, onResolve, onReject)
  }
  return originalPush.call(this, location).catch(err => err)
}

// 所有权限通用路由表
// 如首页和登录页和一些不用权限的公用页面
export const constantRoutes = [
  {
    path: '/redirect', // tagsView用来进行刷新重定向
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/personal',
    component: Layout,
    redirect: '/personal/index',
    hidden: true,
    children: [{
      path: 'index',
      component: personal,
      name: 'personal',
      meta: {
        title: '个人账户',
        icon: 'user'
      }
    }, {
      path: 'user-auth',
      component: userAuth,
      name: 'userAuth',
      meta: {
        title: '个人认证',
        icon: 'user'
      }
    }]
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  }
]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: 'main',
    roles: ['ROLE_user', 'ROLE_admin', 'ROLE_superAdmin'], // you can set roles in root nav, ROLE_user1：普通用户，ROLE_admin：管理员，ROLE_admin：超级管理员
    children: [
      {
        path: 'dashboard',
        component: dashboard,
        name: 'dashboard',
        meta: {
          title: '首页',
          icon: 'dashboard',
          affix: true // 固定该路由在tagsView上，true为固定，false为不固定
        }
      }
    ]
  },
  {
    path: '/app-center',
    component: Layout,
    redirect: '/app-center/app-manage',
    meta: {
      title: '应用中心',
      icon: 'menu',
      roles: ['ROLE_user']
    },
    children: [
      {
        path: 'app-manage',
        component: appManage,
        name: 'appManage',
        meta: {
          title: '应用管理',
          icon: 'app-manage',
          affix: false
        }
      },
      {
        path: 'app-create',
        component: appCreate,
        name: 'appCreate',
        meta: {
          title: '应用创建',
          icon: 'app-create',
          affix: false
        }
      },
      {
        path: 'notice-manage',
        component: noticeManage,
        name: 'noticeManage',
        meta: {
          title: '通知管理',
          icon: 'message',
          affix: false
        }
      },
      {
        path: 'app-detail',
        component: appDetail,
        name: 'appDetail',
        meta: {
          title: '应用详情',
          affix: false,
          exclude: true
        }
      }
    ]
  },
  {
    path: '/system-manage',
    component: Layout,
    redirect: '/system-manage/schedules',
    name: 'system-manage',
    meta: {
      title: '系统管理',
      icon: 'setting',
      roles: ['ROLE_admin', 'ROLE_superAdmin']
    },
    children: [
      {
        path: 'message-manage',
        component: messageManage,
        name: 'messageManage',
        meta: {
          title: '消息管理',
          icon: 'message',
          affix: false
        }
      },
      {
        path: 'user-manage',
        component: userManage,
        name: 'userManage',
        meta: {
          title: '用户管理',
          icon: 'people',
          affix: false
        }
      },
      {
        path: 'user-detail',
        name: 'userDetail',
        component: userDetail,
        meta: {
          title: '用户详情',
          exclude: true,
          hiddenTagView: false
        }
      },
      {
        path: 'role-manage',
        component: roleManage,
        name: 'roleManage',
        meta: {
          title: '角色管理',
          icon: 'role',
          affix: false
        }
      },
      {
        path: 'approval',
        component: approval,
        name: 'approval',
        meta: {
          title: '应用管理',
          icon: 'approval',
          affix: false
        }
      },
      {
        path: 'dictionary-manage',
        component: dictionaryManage,
        name: 'dictionaryManage',
        meta: {
          title: '字典管理',
          icon: 'dict',
          affix: false
        }
      },
      {
        path: 'schedules',
        component: schedules,
        name: 'schedules',
        meta: {
          title: '定时任务',
          icon: 'task',
          affix: false
        }
      }
    ]
  },
  {
    /**
     * 通配符路由必须放在所有路由的最后面
     * 不能放在constantRoutes最后
     * 否则通过addRoutes动态添加asyncRoutes
     * 会将asyncRoutes添加到通配符路由后
     * 路由匹配是从上到下按顺序匹配的
     * 这样会出现登陆后即进入404页面
     */
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

export function createRouter () {
  return new Router({
    mode: 'history', // 同构应用不能使用 hash 路由，应该使用 history 模式，兼容前后端
    base: '/vue-ssr-template/',
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })
}

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // 重置路由
}