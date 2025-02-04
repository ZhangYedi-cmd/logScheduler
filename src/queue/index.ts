import RequestList from './request';
import LogList from './log';

let request: RequestList | null = null;
let log: LogList | null = null;

//这里工厂+单例，方便后期动态修改或添加配置
export function requestListFactory(): RequestList {
  if (!request) {
    return new RequestList();
  }
  return request;
}

export function logListFactory(options: Options): LogList {
  if (!log) {
    return new LogList(options);
  }
  return log;
}

export function logObjectFactory(url: url, type: LogType, xhrInstance?: XMLHttpRequest, data?: XMLHttpRequestData): LogListItem {
  return {
    url: url.toString(),
    type,
    instance: xhrInstance,
    data,
  };
}

// 解耦工具类，将主类和队列类进行解耦
export class InterceptorIOCTool {
  private requestList: RequestList;
  private logList: LogList;

  constructor(requestList: RequestList, logList: LogList) {
    this.requestList = requestList;
    this.logList = logList;
    this.logList.getCurrentRequestImpl(this.getCurrentRequest.bind(this));
  }

  // 获取当前正在进行的请求
  public getCurrentRequest() {
    return this.requestList.getLengthAsync();
  }

  // 创建请求拦截器
  public createRequestInterceptor() {
    const vm = this;
    return function(url: url, type: LogType) {
      const logObject = logObjectFactory(url, type);
      if (vm.logList.isLogger(url)) {
        vm.logList.add(logObject);
        return true;
      }
      vm.requestList.add(url.toString());
      return false;
    };
  }

  // 创建响应拦截器
  public createResponseInterceptor(options: Options) {
    const vm = this;
    return async function(url: string | URL) {
      if (!vm.logList.isLogger(url)) {
        vm.requestList.delete(url.toString());
      } else {
        // 如果是log,直接返回，防止递归死循环
        return false;
      }
      if (await vm.requestList.getLengthAsync() <= options.trigger) {
        vm.logList.requestLog();
      }
      return true;
    };
  }
}
