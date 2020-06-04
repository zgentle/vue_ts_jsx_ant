import axios, {AxiosRequestConfig, AxiosResponse} from 'axios'
import {noTokenApi, requestApi} from '@/config/requestApi'
import statusCode from '@/config/statusCode'
import router from '@/router'
import {message, Spin, Modal} from 'ant-design-vue';

declare type Methods = 'GET' | 'POST';

declare interface Datas {
  method?: Methods
  [key: string]: any
}

let expiredTime = 0;
// 请求失败
const requestFail = async (res: AxiosResponse) => {
  let errStr = '网络繁忙！';
  let serviceStr = '';
  // 匹配错误码
  switch (res.data.code) {
    // token失效重新登陆
    case statusCode.TOKEN_EXPIRED:
      await router.push({name: 'login'});
      break;
    
  }

  await message.error(serviceStr || res.data.message || errStr);

  // 返回错误
  Promise.reject({
    code: res.data.errcode || res.data.code,
    msg: res.data.message || errStr,
    url: res.config.url,
    res: res
  })
};
// 拦截类
class HttpRequest {
  public queue: any; // 请求的url队列
  public constructor() {
    this.queue = {};
  }
  destroy(url: string) {
    delete this.queue[url];
  }
  interceptors(instance: any, url?: string) {
    // 请求拦截
    instance.interceptors.request.use((config: AxiosRequestConfig) => {
      if (url) {
        this.queue[url] = true
      }
      return config
    }, (error: any) => {
      console.error(error)
    });
    // 响应拦截
    instance.interceptors.response.use((res: AxiosResponse) => {
      if (url) {
        this.destroy(url)
      }
      const {data, status} = res;
      // 请求成功
      if (status === 200 && data && data.code === statusCode.SUCCESS) {
        return data
      }
      // 失败回调
      return requestFail(res)
    }, (error: any) => {
      if (url) {
        this.destroy(url)
      }
      // 只提示一次;
      message.error('服务不可用！')
    })
  }
  async request(options: AxiosRequestConfig) {
    const instance = axios.create();
    await this.interceptors(instance, options.url);
    return instance(options)
  }
}
// 处理提交字段前后空格
const filterSpace = (data: any) => {
  // "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"'
  if (typeof data === 'object') {
    for (let key in data) {
      if (data[key] !== '') {
        switch (typeof data[key]) {
          case 'string':
            data[key] !== '' && (data[key] = data[key].trim());
            break;
          case 'object':
            filterSpace(data[key]);
            break;
        }
      }
    }
  }
  return data;
}
// 合并axios请求参数
const combineOptions = (_opts: any, data: Datas, method: Methods): AxiosRequestConfig => {
  let token = '' // token

  let opts = _opts;

  if (typeof opts === 'string') {
    opts = {url: opts}
  }

  let needToken = noTokenApi.findIndex((item: string) => {
    return opts.url === item
  }) === -1;

  const _data = {...opts.data, ...filterSpace(data)};

  const options: {
    method: 'POST' | 'GET';
    url: string;
    withCredentials: boolean;
    headers: any
  } = {
    method: opts.method || data.method || 'POST',
    url: opts.api
      ? (window as any).g.apiUrl + opts.url
      : (window as any).g.baseUrl + opts.url,
    withCredentials: false,
    headers: {'Content-Type': 'application/json'}
  };

  // 请求头中添加token
  needToken
    ? opts.api
      ? options.headers['Authorization'] = 'Bearer ' + (window as any).g.appId
      : options.headers['X-Authorization'] = 'Bearer ' + token
    : delete options.headers['X-Authorization'];

  return options.method !== 'GET'
    ? Object.assign(options, {data: _data})
    : Object.assign(options, {params: _data})

};

const HTTP = new HttpRequest();

//抛出整个项目的api方法
const Api = (() => {
  let apiObj: any = {};
  const requestList: any = requestApi;
  const fun = (opts: AxiosRequestConfig | string) => {
    return async (data = {}, method: Methods = 'POST') => { // async 异步操作
      // 合并请求参数
      const newOpts = combineOptions(opts, data, method);
      return await HTTP.request(newOpts) // await 等待,等这个执行完成,就执行下面的
    }
  };
  Object.keys(requestApi).forEach((key) => {
    apiObj[key] = fun(requestList[key])
  });
  return apiObj
})();

export default Api as any
