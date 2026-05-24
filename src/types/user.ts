export interface AppUser {
  id: number
  nickname: string
  avatar: string
}

export interface AppDictOption<T = string | number> {
  label: string
  value: T
}

export interface AppAddressOption {
  label: string
  value: number
  children?: AppAddressOption[]
}

export interface AppProfile {
  user_id: number
  nickname: string
  email: string
  phone: string
  avatar: string
  sex: number
  birthday: string
  address_id: number
  detail_address: string
  bio: string
}

export interface AppProfileDict {
  sexArr: AppDictOption<number>[]
  auth_address_tree: AppAddressOption[]
}

export interface AppProfileResponse {
  profile: AppProfile
  dict: AppProfileDict
}

export interface AppProfileUpdatePayload {
  nickname: string
  avatar: string
  sex: number
  birthday: string
  address_id: number
  detail_address: string
  bio: string
}

export interface AppProfileUpdateResult {
  user: AppUser
}
