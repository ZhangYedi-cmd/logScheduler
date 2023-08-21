import { BaseQueue, BaseRequest } from './base.js';
import { RowImage } from '../proxy/index.js';

/**
 * 打点队列
 */
export class LogQueue extends BaseQueue {
  constructor(limit) {
    super();
    this.limit = limit;
    this.lock = false;
  }

  async watchRequestQueueLen(getRequestQueueLen) {
    let { limit } = this;
    if (await getRequestQueueLen() <= limit) {
      console.log('一开始请求队列就小 开始执行打点队列');
      this.consumeLogs();
    }
  }

  consumeLogs() {
    let that = this;
    let { requestList,closeLock } = that;
    if (requestList.length === 0) {
      that.lock = false
      return
    }
    requestList.map(async logReq => {
      // 发完了之后再往下走
      await logReq.send(closeLock.bind(that));
      that.removeRequest(logReq.url);
    });
  }

  // 关锁时机：每一个请求执行完成后看一下队列的长度
  closeLock() {
    if (this.requestList.length === 1) {
      this.lock = false
    }
  }
}

export class LogRequest extends BaseRequest {
  constructor(url) {
    super(url);
  }

  send(closeLock) {
    let { url } = this;
    return new Promise(resolve => {
      let logReq = new RowImage(0, 0);
      // 异步关锁
      logReq.success = logReq.onerror = function() {
        logReq = null;
        closeLock()
        resolve(url);
      };
      logReq.src = url;
      logReq = null;// 垃圾回收
    });
  }
}
