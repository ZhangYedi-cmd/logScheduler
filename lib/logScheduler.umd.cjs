(function(i,s){typeof exports=="object"&&typeof module<"u"?module.exports=s():typeof define=="function"&&define.amd?define(s):(i=typeof globalThis<"u"?globalThis:i||self,i.logScheduler=s())})(this,function(){"use strict";var I=Object.defineProperty;var R=(i,s,u)=>s in i?I(i,s,{enumerable:!0,configurable:!0,writable:!0,value:u}):i[s]=u;var l=(i,s,u)=>(R(i,typeof s!="symbol"?s+"":s,u),u);const i=Image;let s=!1;function u(r){s||(s=!0,window.Image=function(...e){const t=new i(...e);return new Proxy(t,{get(c,n){return c[n]},set(c,n,h){return n=="src"&&r(h)?(c[n]="",!0):(c[n]=h,!0)}})})}class a{constructor(e={}){this.interceptor=e,this.setRequestHandler(),this.setResponseHandler()}setRequestHandler(){const{open:e,send:t}=XMLHttpRequest.prototype,o=this;XMLHttpRequest.prototype.open=function(c,n,h,w,y){o.interceptor.request(n),e.apply(this,arguments)}}setResponseHandler(){const e=this;new PerformanceObserver(function(o,c){o.getEntries().forEach(n=>{["img","xmlhttprequest"].includes(n.initiatorType)&&e.interceptor.response(n.name)})}).observe({entryTypes:["resource"]})}}class p{constructor(){this.list=[]}add(e){this.list.push(e)}delete(e){const t=this.list.findIndex(o=>o==e);t!=-1&&this.list.splice(t,1)}getLength(){return this.list.length}clear(){for(;this.list.length;)this.list.pop()}}function d(r){let e=document.querySelector("body"),t={childList:!0,attributes:!0,subtree:!0};new MutationObserver(r).observe(e,t)}class g extends p{constructor(){super(),d(this.getCurrentImageResquest.bind(this))}getCurrentImageResquest(){Array.from(document.querySelectorAll("img[src]")).filter(t=>!t.complete).forEach(t=>{this.add(t.currentSrc),t.addEventListener("error",()=>{this.delete(t.currentSrc)})})}}class f extends p{constructor(e={}){super(),this.options=e}isLogger(e){const t=new RegExp(this.options.log||/.gif/);return typeof e!="string"?!1:!!t.test(e)}async requestLog(){const e=this.list.map(t=>new Promise((o,c)=>{const n=new i;n.src=t,o()}));await Promise.all(e)}}function L(r){return new g(r)}function q(r){return new f(r)}class m{constructor(e,t,o={}){this.requestList=e,this.logList=t}createRequestInterceptor(){return function(e){return this.logList.isLogger(e)?(this.logList.add(e),!0):(this.requestList.add(e),!1)}.bind(this)}createResponseInterceptor(){return function(e){if(!this.logList.isLogger(e))this.requestList.delete(e);else return;this.requestList.getLength()==0&&this.logList.requestLog()}.bind(this)}}class b{constructor(e){l(this,"options");l(this,"requestHandler");l(this,"requestList");l(this,"logList");l(this,"interceptor",{request:null,response:null});this.options=e,this.initRequestQueue(),this.initInterceptor(),this.initObserver()}initObserver(){u(this.interceptor.request),this.requestHandler=new a(this.interceptor)}initRequestQueue(){this.requestList=L(this.options),this.logList=q(this.options)}initInterceptor(){const e=new m(this.requestList,this.logList);this.interceptor.request=e.createRequestInterceptor(),this.interceptor.response=e.createResponseInterceptor()}}return b});
//# sourceMappingURL=logScheduler.umd.cjs.map
