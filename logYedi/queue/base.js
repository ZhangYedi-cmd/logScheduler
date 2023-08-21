export class BaseQueue {
  constructor() {
    this.requestList = []
  }

  addRequest(req) {
    console.log('添加点位',req.url);
    this.requestList.push(req)
  }

  removeRequest(url) {
    console.log('移除点位',url);
    this.requestList = this.requestList.filter(i => i.url !== url)
  }
}

export class BaseRequest {
  constructor(url) {
    this.url = url
  }
}