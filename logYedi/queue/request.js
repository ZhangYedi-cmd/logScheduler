import {BaseQueue, BaseRequest} from './base.js'

/**
 * 业务请求队列
 */
export class RequestQueue extends BaseQueue {
  constructor() {
    super();
  }

  getQueueLength() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.requestList.length)
      })
    })
  }
}