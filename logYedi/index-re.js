// 打点调度 将所有的打点请求后置，优先请求业务接口 / 图片

// 劫持所有的打点请求，放入到一个队列中，等某一时刻浏览器空闲时执行打点队列中的请求

// 1.首先要监听到所有的打点请求，将其放置到一个队列中
// 例如使用log进行打点

class BaseQueue {
  constructor() {
    this.requestList = [];
  }

  addRequest(req) {
    this.requestList.push(req);
    console.log(`添加点位`, req,this.requestList);
  }
  getQueue() {
    return this.requestList;
  }

  getQueueLength() {
    return this.requestList.length;
  }
}

/**
 * log 工厂
 */
class LogFactory {
  constructor() {
  }

  sendLog(url) {
    console.log(`执行打点${url}`);
    return new Promise((resolve, reject) => {
      let logReq = new rowImage(0, 0);
      logReq.src = url;
      logReq.onload = function() {
        resolve(url);
      };
      logReq.onerror = function() {
        resolve(url);
      };
    });
  }
}

/**
 * 打点请求队列
 *    拦截打点请求：通过重写Image类的构造器 返回一个Proxy代理对象，监听src属性的变化
 *    image.src = 'xxx'
 */
class LogQueue extends BaseQueue {
  constructor() {
    super();
    this.logFactory = new LogFactory();
    let { overWriteImage, getLogRequest } = this;
    overWriteImage(getLogRequest.bind(this));
  }

  /**
   * 从队列中取url进行打点
   */
  async watchRequestsQueueLength(getRequestsQueueLength) {
    let { requestList, logFactory } = this;
    if (await getRequestsQueueLength() <= 2) {
      console.log('开始时就小于阈值！开始执行打点');
      while (requestList.length) {
        let logUrl = requestList.shift()
        await logFactory.sendLog(logUrl)
      }
    }
  }

  /**
   * 将拦截到的请求放置请求队列中
   * @param req
   */
  getLogRequest(req) {
    this.addRequest(req);
    return true;
  }

  /**
   * 拦截打点请求
   * @param callback
   */
  overWriteImage(callback) {
    // 用Proxy代理 重写原生的Image类
    window.Image = function(width, height) {
      let log = new rowImage(width, height);
      return new Proxy(log, {
        get(target, p, receiver) {
          return Reflect.get(target, p, receiver);
        },
        // 如果更新了src属性 拦截请求&放入请求队列中
        set(target, p, newValue) {
          if (p === 'src' && callback(newValue)) {
            target[p] = '';
            return true;
          }
          return Reflect.set(target, p, newValue);
        },
      });
    };
  }
}

/**
 * 业务请求队列
 *   get到浏览器当前请求的数量
 *   1. 拦截图片请求和响应
 *       请求：通过MutationObserver监听根元素下img标签的src属性变化，将未完成的请求放置请求队列
 *       响应：PerformanceObserver请求中返回的图片，将请求队列中对应的请求移除
 *   2. 拦截XHR请求
 *       重写XHRHttpRequest的open方法，open时将请求放置到请求队列中
 */
class OtherQueue extends BaseQueue {
  constructor() {
    super();
    let { getLoadingImg, initMutationObserver, initPerformanceObserver, removeCompleteImg } = this;
    // 初始化页面时 获取所有加载的图片
    // this.getLoadingImg()
    initMutationObserver(getLoadingImg.bind(this));
    initPerformanceObserver(removeCompleteImg.bind(this));
  }

  //初始化监听器，监听根元素下所有属性变动
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

  // 连续增长情况下，异步返回队列长度
  getRequestQueueLen() {
    let that = this
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(that.requestList.length);
      });
    });
  }

  // 开始请求图片时，将图片请求移入请求队列
  getLoadingImg() {
    // 获取正在请求的图片
    let imgList = Array.from(document.querySelectorAll('img[src]'));
    imgList.filter(img => !img.complete).forEach(i => {
      // 放到请求业务的队列中
      this.addRequest(i.src);
    });
    console.log(this.requestList);
  }

  initPerformanceObserver(callback) {
    let observer = new PerformanceObserver(callback);
    observer.observe({ entryTypes: ['resource'] });
  }

  // 监听返回图片响应 将其移除请求队列
  removeCompleteImg(entries) {
    let { requestList } = this;
    entries.getEntries().map(ci => {
      requestList.map((i, index) => {
        if (ci.name === i) {
          requestList[index] = null;
        }
      });
    });
  }
}

// 防止死循环
const rowImage = Image;

let logQueue = new LogQueue();
//
//
let p2 = new Image(200, 200);
p2.src = 'http://127.0.0.1:8000/1.gif';
p2.src = 'http://127.0.0.1:8000/2.gif';
p2.src = 'http://127.0.0.1:8000/3.gif';

// console.log(logQueue.getQueue());


// 2.我们已经实现了对打点请求的拦截，并将其添加到队列中，下面我们需要做的是，监听业务请求和图片请求的状态
//   如果某一时刻浏览器请求量小于阈值，我们就可以执行打点队列中的请求
//   2.1 对请求的图片进行监听 分为两种情况
//      1. new Image() 时发出的请求  上面我们已经处理过
//      2. *html dom 变动发出的请求  监听所有img dom的src属性

let q2 = new OtherQueue();

// logQueue.watchRequestsQueueLength(q2.getRequestQueueLen.bind(q2));


