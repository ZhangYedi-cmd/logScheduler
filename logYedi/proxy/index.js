export const RowImage = Image

/**
 * 重写Image类，返回一个Proxy
 */
export function overWriteImage(callback) {
  window.Image = function(width, height) {
    let log = new RowImage(width,height)
    return new Proxy(log, {
      get(target, p, receiver) {
        return Reflect.get(target, p, receiver);
      },
      // 如果更新了src属性 拦截请求&放入请求队列中
      set(target, p, newValue) {
        // callback 的作用是，是否拦截此次src属性的更改
        // Image 有两类，正常的图片请求和打点请求
        // 页面图片的请求，我们只需要放到业务请求队列即可
        // 打点请求移入打点请求队列
        if (p === 'src' && callback(newValue)) {
          target[p] = '';
          return true;
        }
        return Reflect.set(target, p, newValue);
      },
    });
  }
}
