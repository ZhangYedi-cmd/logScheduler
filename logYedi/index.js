import { InterceptorUtils } from './interceptor/index.js';
import {LogQueue} from './queue/log.js'
import {RequestQueue} from './queue/request.js'

export class LogSchedulerYD {
  constructor(config) {
    console.log('LogSchedulerYD init');
    this.config = config;
    this.logQueue = new LogQueue(2)
    this.requestQueue = new RequestQueue()
    this.interceptorUtils = new InterceptorUtils()
    this.interceptorUtils.initInterceptors(this.requestQueue,this.logQueue)
  }
}

