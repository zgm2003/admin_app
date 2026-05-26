type RequestConfig = Record<string, unknown>

type Interceptor<T = unknown> = {
  fulfilled?: (value: T) => T | Promise<T>
  rejected?: (error: unknown) => unknown
}

class InterceptorManager<T = unknown> {
  private handlers: Interceptor<T>[] = []

  use(fulfilled?: Interceptor<T>['fulfilled'], rejected?: Interceptor<T>['rejected']) {
    this.handlers.push({ fulfilled, rejected })
    return this.handlers.length - 1
  }

  eject(id: number) {
    if (this.handlers[id]) {
      this.handlers[id] = {}
    }
  }
}

export default class UViewRequestShim {
  config: RequestConfig

  interceptors = {
    request: new InterceptorManager<RequestConfig>(),
    response: new InterceptorManager<unknown>(),
  }

  constructor(config: RequestConfig = {}) {
    this.config = { ...config }
  }

  setConfig(update: (config: RequestConfig) => RequestConfig) {
    this.config = update({ ...this.config })
  }

  request() {
    return Promise.reject(new Error('uview-plus http shim is not used by admin_app'))
  }

  get = this.request
  post = this.request
  put = this.request
  delete = this.request
  upload = this.request
  download = this.request
}
