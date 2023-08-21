import { BaseRequest } from '../queue/base.js';
import { LogRequest } from '../queue/log.js';
import { overWriteImage } from '../proxy/index.js';

/**
 * 请求拦截器
 * 主要拦截两类请求：图片和业务接口
 */
export class RequestInterceptor {
  constructor(vm) {
    this.vm = vm;
    let { initMutationObserver, getLoadingImg, judgeLogRequest } = this;
    this.getLoadingImg();
    overWriteImage(judgeLogRequest.bind(this));
    initMutationObserver(getLoadingImg.bind(this));
  }

  /**
   * 初始化监听器，监听根元素下所有属性变动
   * @param callback
   */
  initMutationObserver(callback) {
    // 从根元素开始监听
    let root = document.querySelector('#root');
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
    };
    let observer = new MutationObserver(callback);
    observer.observe(root, config);
  }

  /**
   * 拦截图片请求: DOM级别变动
   */
  getLoadingImg() {
    let { requestQueue } = this.vm;
    // 获取正在请求的图片
    let imgList = Array.from(document.querySelectorAll('img[src]'));
    imgList.filter(img => !img.complete).forEach(i => {
      let req = new BaseRequest(i.src);
      // 放到请求业务的队列中
      requestQueue.addRequest(req);
    });
  }

  /**
   * 拦截打点请求：src属性变动
   */
  judgeLogRequest(src) {
    let { requestQueue, logQueue } = this.vm;
    if (!src.endsWith('.gif')) {
      requestQueue.addRequest(new BaseRequest(src));
      return false;
    } else {
      logQueue.addRequest(new LogRequest(src));
      return true;
    }
  }
}

/**
 * 响应拦截器
 */
export class ResponseInterceptor {
  constructor(vm) {
    this.vm = vm;
    let { initPerformanceObserver, removeCompleteImg } = this;
    initPerformanceObserver(removeCompleteImg.bind(this));
  }

  /**
   * 初始化PerformanceObserver 监听所有的图片响应
   * @param callback
   */
  initPerformanceObserver(callback) {
    let observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Observer的回调，将完成的请求移出请求队列
   * @param entries
   */
  async removeCompleteImg(entries) {
    let { requestQueue, logQueue } = this.vm;
    entries.getEntries().map(ci => {
      if (ci.name.endsWith('.gif')) {
        return
      }
      requestQueue.removeRequest(ci.name);
    });
    if (await requestQueue.getQueueLength() <= logQueue.limit &&!logQueue.lock) {
      logQueue.lock = true
      logQueue.consumeLogs()
    }
  }
}

export class InterceptorUtils {
  initInterceptors(requestQueue, logQueue) {
    this.requestQueue = requestQueue;
    this.logQueue = logQueue;
    this.requestInterceptor = new RequestInterceptor(this);
    this.responseInterceptor = new ResponseInterceptor(this);
    logQueue.watchRequestQueueLen(requestQueue.getQueueLength.bind(requestQueue));
  }
}
