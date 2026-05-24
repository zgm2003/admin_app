export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE' | 'CONNECT'

export type RequestData = string | object | ArrayBuffer | undefined

export interface PageResult<T> {
  list: T[]
  page: {
    page_size: number
    current_page: number
    total_page: number
    total: number
  }
}
