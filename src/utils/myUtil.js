export function parseTimeStr(str) {
  return new Date(str.replace(/-/g, '/'))
}
export function formatTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || 'y-m-d h:i:s'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (('' + time).length === 10) time = parseInt(time) * 1000
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/([ymdhisa])/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

export function formatTimeFromStr(str, cFormat) {
  return formatTime(parseTimeStr(str), cFormat)
}

/**
 * 对象数组扁平化处理
 * @param arr
 * @param propName
 * @param parent
 * @returns {*}
 */

export function flattenObjectArr(arr, propName, parent) {
  return arr.reduce(function(prev, item) {
    if (parent) {
      item._parent = parent
    }
    prev = prev.concat(item)
    if (Array.isArray(item[propName])) {
      prev = prev.concat(flattenObjectArr(item[propName], propName, item))
    }
    return prev
  }, [])
}

/**
 * 防抖动
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate = false) {
  let timeout, pArgs, context, timestamp, result

  const later = function() {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, pArgs)
        if (!timeout) context = pArgs = null
      }
    }
  }

  return function(...args) {
    context = this
    pArgs = args
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}
