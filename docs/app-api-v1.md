# App API v1 Frontend Contract

来源：`E:\admin_go\docs\contracts\admin-api-v1.md` 的 App Auth Baseline，以及 `admin_back_go/internal/module/appauth` 当前运行时代码。

Base namespace:

```text
/api/app/v1
```

Default H5/backend base URL:

```text
http://192.168.5.20:8080/api/app/v1
```

规则：前端不在 Vite/HBuilderX 上反代 `/api/app/v1`；`src/lib/http/env.ts` 默认直连 Go 后端，部署环境可用 `VITE_APP_API_BASE_URL` 覆盖，跨域由 Go 后端 CORS 负责。

## Login config

```text
GET /api/app/v1/auth/login-config
```

Response `data`:

```ts
interface AppLoginConfig {
  login_type_arr: Array<{ label: string; value: 'password' | 'email' | 'phone' }>
  captcha_enabled: boolean
  captcha_type: 'slide'
}
```

规则：后端强制按 `platform=app` 查询 `auth_platforms`，前端不伪造 admin 登录方式。

## Captcha

```text
GET /api/app/v1/auth/captcha
```

Response `data`:

```ts
interface AppSlideCaptchaChallenge {
  captcha_id: string
  captcha_type: 'slide'
  master_image: string
  tile_image: string
  tile_x: number
  tile_y: number
  tile_width: number
  tile_height: number
  image_width: number
  image_height: number
  expires_in: number
}
```

## Send code

```text
POST /api/app/v1/auth/send-code
```

Request:

```ts
interface AppSendCodePayload {
  account: string
  scene: 'login'
}
```

Response `data`: `null` or empty object, callers do not depend on payload.

## Login

```text
POST /api/app/v1/auth/login
```

Request:

```ts
type AppLoginPayload =
  | {
      login_type: 'password'
      login_account: string
      password: string
      captcha_id: string
      captcha_answer: { x: number; y: number }
    }
  | {
      login_type: 'email' | 'phone'
      login_account: string
      code: string
    }
```

Response `data`:

```ts
interface AppLoginResult {
  token: string
  user: {
    id: number
    nickname: string
    avatar: string
  }
}
```

规则：App password login 现在遵守 `auth_platforms.captcha_type=slide`，必须提交 slide captcha；前端不解析 JWT 权限。

## Current user

```text
GET /api/app/v1/users/me
Authorization: Bearer <token>
```

Response `data`:

```ts
interface AppUser {
  id: number
  nickname: string
  avatar: string
}
```

## Logout

```text
POST /api/app/v1/auth/logout
Authorization: Bearer <token>
```

Response `data`: `null`。


## Profile

```text
GET /api/app/v1/profile
PUT /api/app/v1/profile
Authorization: Bearer <token>
```

规则：`我的` tab 只读取资料摘要用于账号总览；头像上传、昵称、性别、生日、地址、简介编辑在 `views/profile/edit` 独立页面完成。

## Upload token

```text
POST /api/app/v1/upload-tokens
Authorization: Bearer <token>
```

规则：头像等 App 侧媒体上传走当前 COS-only upload token runtime。前端统一通过 `AppMediaUploader` 选择文件并上传；H5 由浏览器文件选择器接管权限，App 在打开相册/相机前必须先走权限前置。前端用 `cos-js-sdk-v5` 直传，不走 Vite 反代，不使用 uview-plus `autoUpload`。App 本地路径必须先通过 `plus.io` 读取成 Blob，获取 upload token 后、PUT COS 前再按 `token.rule` 做一次大小和后缀校验。

## Settings

设置是前端本机偏好页：语言、白天/黑夜模式持久化在 `admin_app:locale` / `admin_app:theme`。清理缓存只清 `admin_app:cache:` 和 `admin_app:tmp:` 前缀，不能删除 `access_token`、`current_user`、语言和主题偏好。

## Headers

`src/lib/http/index.ts` 统一附加：

```text
Authorization: Bearer <token>
platform: app
Accept-Language: zh-CN
```

页面不得绕过 API client 自己拼请求。

## H5 direct backend connection

HBuilderX/Vite H5 页面直接请求 `http://192.168.5.20:8080/api/app/v1/*`。如果手工在浏览器地址栏访问 `http://localhost:5173/api/app/v1/*`，那仍然是 Vite 前端路径，不代表 Go 后端接口；接口 smoke 应打 `http://192.168.5.20:8080/api/app/v1/*`。

## Verification

当前切片验证命令：

```powershell
cd E:\admin_go\admin_app
npm run test:unit
npm run type-check
npm run build:h5
```
