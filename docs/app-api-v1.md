# App API v1 Frontend Contract

来源：`E:\admin_go\docs\contracts\admin-api-v1.md` 的 App Auth Baseline，以及 `admin_back_go/internal/module/appauth` 当前运行时代码。

Base namespace:

```text
/api/app/v1
```

Default H5/backend base URL:

```text
http://127.0.0.1:8080/api/app/v1
```

规则：前端不在 Vite/HBuilderX 上反代 `/api/app/v1`；`src/config/env.ts` 默认直连 Go 后端，部署环境可用 `VITE_APP_API_BASE_URL` 覆盖，跨域由 Go 后端 CORS 负责。

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

## Headers

`src/api/http.ts` 统一附加：

```text
Authorization: Bearer <token>
platform: app
Accept-Language: zh-CN
```

页面不得绕过 API client 自己拼请求。

## H5 direct backend connection

HBuilderX/Vite H5 页面直接请求 `http://127.0.0.1:8080/api/app/v1/*`。如果手工在浏览器地址栏访问 `http://localhost:5173/api/app/v1/*`，那仍然是 Vite 前端路径，不代表 Go 后端接口；接口 smoke 应打 `http://127.0.0.1:8080/api/app/v1/*`。

## Verification

当前切片验证命令：

```powershell
cd E:\admin_go\admin_app
npm run test:unit
npm run type-check
npm run build:h5
```
