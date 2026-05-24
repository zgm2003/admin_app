# App API v1 Frontend Contract

来源：`E:\admin_go\docs\contracts\admin-api-v1.md` 的 App Auth Baseline，以及 `admin_back_go/internal/module/appauth` 当前运行时代码。

Base namespace:

```text
/api/app/v1
```

## Login

```text
POST /api/app/v1/auth/login
```

Request:

```ts
interface AppLoginPayload {
  account: string
  password: string
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

规则：App password login 不走 admin captcha；前端不解析 JWT 权限。

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

## Runtime verification

2026-05-24 verified against local Docker-first backend:

```text
GET  http://127.0.0.1:8080/health -> code=0
GET  http://127.0.0.1:8080/ready  -> database/redis/token_redis/queue_redis/realtime up
POST /api/app/v1/auth/login        -> code=0, token returned, user.id=1
GET  /api/app/v1/users/me          -> code=0, user.id=1
POST /api/app/v1/auth/logout       -> code=0
```
