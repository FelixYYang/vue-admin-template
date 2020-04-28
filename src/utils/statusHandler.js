import { Message, MessageBox } from 'element-ui'
import Router from '@/router'
import store from '../store'
import service from './request'

export const handleAuthException = () => {
  store.dispatch('user/logout').then(() => {
    Router.replace({ path: '/login' })
    MessageBox.alert('登录状态已失效，请重新登录！', '', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      callback: () => {
        Router.replace({ path: '/login' })
      }
    })
  })
}

// 保证刷新token唯一
let isRefreshing = false
let subscribers = []

// 刷新token
export const refreshToken = config => {
  if (!isRefreshing) {
    isRefreshing = true
    store.dispatch('user/refreshToken', store.getters.token).then(res => {
      const subs = subscribers
      subscribers = []
      isRefreshing = false
      subs.forEach(subscriber => { subscriber() })
    }).catch(error => {
      handleAuthException()
      return error
    })
  }

  const nConfig = ['data', 'method', 'params', 'url'].reduce((carry, key) => {
    carry[key] = config[key]
    return carry
  }, { baseURL: '/' })

  return new Promise((resolve) => {
    subscribers.push(() => {
      resolve(service(nConfig))
    })
  })
}

const handler = (error) => {
  const res = error.response || error
  const errors = res.errors
  let message = res.message
  switch (res.status_code) {
    case 401:
      if (location.hash.match(/^#\/login/)) {
        break
      }

      handleAuthException()
      break

    case 422:
      if (errors) {
        const keys = Object.keys(errors)
        message = errors[keys[0]]
      }
      Message({
        message: message,
        type: 'error',
        duration: 5 * 1000
      })
      break

    case 403:
      Message({
        message: '您没有此操作权限，请与管理员联系',
        type: 'error',
        duration: 5 * 1000
      })
      break

    default:
      Message({
        message: res.message,
        type: 'error',
        duration: 5 * 1000
      })
  }
}

export default handler
