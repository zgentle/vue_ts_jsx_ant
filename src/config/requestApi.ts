declare interface requestType {
  [propName: string]: string | {
    url: string;
    method: 'GET' | 'POST',
    api?: boolean // 区分api接口
  };
}
// 需要鉴权
export const requestApi: requestType = {
  postTest: {
    url: '/auth/login',
    method: 'POST',
    api: true
  },
}

// 无需鉴权 无需发送token
export const noTokenApi: Array<string> = [
  '/systemInfo/get',// 系统信息
]