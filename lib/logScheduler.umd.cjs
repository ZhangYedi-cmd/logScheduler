(function(i,r){typeof exports=="object"&&typeof module<"u"?module.exports=r():typeof define=="function"&&define.amd?define(r):(i=typeof globalThis<"u"?globalThis:i||self,i.logScheduler=r())})(this,function(){"use strict";var x=Object.defineProperty;var C=(i,r,u)=>r in i?x(i,r,{enumerable:!0,configurable:!0,writable:!0,value:u}):i[r]=u;var o=(i,r,u)=>(C(i,typeof r!="symbol"?r+"":r,u),u);const i=Image;let r=!1;function u(s){r||(r=!0,window.Image=function(t,e){const n=new i(t,e);return new Proxy(n,{get(l,c,h){return Reflect.get(l,c,h)},set(l,c,h,v){return c=="src"&&s(h)?(l[c]="",!0):Reflect.set(l,c,h,v)}})})}class p{constructor(t){o(this,"interceptor");this.interceptor=t,this.setRequestHandler(),this.setResponseHandler()}setRequestHandler(){const{open:t}=XMLHttpRequest.prototype,e=this;XMLHttpRequest.prototype.open=function(n,g,l,c,h){e.interceptor.request(g),t.call(this,n,g,l,c,h)}}setResponseHandler(){const t=this;new PerformanceObserver(function(n){n.getEntries().forEach(g=>{console.log("23"),["img","xmlhttprequest"].includes(g.initiatorType)&&t.interceptor.response(g.name)})}).observe({entryTypes:["resource"]})}}class a{constructor(){o(this,"list",[])}add(t){this.list.push(t)}delete(t){const e=this.list.findIndex(n=>n==t);e!=-1&&this.list.splice(e,1)}getLength(){return this.list.length}clear(){for(;this.list.length;)this.list.pop()}}function d(s){let t=document.querySelector("body")||document.createElement("div"),e={childList:!0,attributes:!0,subtree:!0};new MutationObserver(s).observe(t,e)}class f extends a{constructor(){super(),d(this.getCurrentImageResquest.bind(this))}async getLengthAsync(){return new Promise(t=>{setTimeout(()=>{t(this.getLength())},0)})}getCurrentImageResquest(){Array.from(document.querySelectorAll("img[src]")).filter(e=>!e.complete).forEach(e=>{this.add(e.currentSrc),e.addEventListener("error",()=>{this.delete(e.currentSrc)})})}}class L extends a{constructor(e){super();o(this,"options");o(this,"getCurrentRequestFn");this.options=e}async add(e){this.list.push(e),await this.getCurrentRequestFn()<=this.options.trigger&&this.requestLog()}getCurrentRequestImpl(e){this.getCurrentRequestFn=e}isLogger(e){const n=new RegExp(this.options.log);return typeof e!="string"?!1:!!n.test(e)}async requestLog(){this.list.forEach(e=>{q(e)}),this.clear()}}function q(s){return new Promise(t=>{const e=new i;e.src=s,e.onload=function(){t(s)},e.onerror=function(){t(s)}})}function m(){return new f}function R(s){return new L(s)}class y{constructor(t,e){o(this,"requestList");o(this,"logList");this.requestList=t,this.logList=e,this.logList.getCurrentRequestImpl(this.getCurrentRequest.bind(this))}getCurrentRequest(){return this.requestList.getLengthAsync()}createRequestInterceptor(){const t=this;return function(e){return t.logList.isLogger(e)?(t.logList.add(e.toString()),!0):(t.requestList.add(e.toString()),!1)}}createResponseInterceptor(t){const e=this;return async function(n){if(!e.logList.isLogger(n))e.requestList.delete(n.toString());else return!1;return await e.requestList.getLengthAsync()<=t.trigger&&e.logList.requestLog(),!0}}}const I={max:5,trigger:3,log:/log.gif/};function b(s){return Object.assign(I,s)}class w{constructor(t){o(this,"options");o(this,"requestHandler");o(this,"requestList");o(this,"logList");o(this,"interceptor",{request:()=>!0,response:()=>new Promise(t=>{t(!0)})});this.options=b(t),this.initRequestQueue(),this.initInterceptor(),this.initObserver()}initObserver(){u(this.interceptor.request),this.requestHandler=new p(this.interceptor)}initRequestQueue(){this.requestList=m(),this.logList=R(this.options)}initInterceptor(){const t=new y(this.requestList,this.logList);this.interceptor.request=t.createRequestInterceptor(),this.interceptor.response=t.createResponseInterceptor(this.options)}}return w});
//# sourceMappingURL=logScheduler.umd.cjs.map
