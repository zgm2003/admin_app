# Admin App Architecture

状态：UniApp To C app shell with app auth captcha.

## 定位

`admin_app` 是 To C 业务端，不是管理系统 App。当前业务还未定义，因此第一阶段只保留用户端登录壳和登录态守卫，不引入 admin 菜单、按钮、RBAC 或 cookie 鉴权策略。

## 目标

当前闭环：

```text
读取 app 登录配置 -> 获取 slide captcha / 验证码 -> 登录 -> 保存 app token -> 拉取当前用户 -> 首页 / 我的 -> 退出登录
```

## 组件与数据流

```text
pages/login/index.vue  -> appAuthClient.loginConfig/captcha/sendCode
pages/login/index.vue  -> useSession.login -> appAuthClient.login -> POST /auth/login
pages/home/index.vue   -> requireAuthenticatedPage -> session.state.user
pages/mine/index.vue   -> useSession.logout -> appAuthClient.logout -> POST /auth/logout
```

通用边界：

```text
src/api/http.ts        # 统一响应解析、Authorization、platform=app header
src/api/appAuth.ts     # app-auth 登录配置、验证码、登录、me、logout
src/config/env.ts      # 默认直连 http://127.0.0.1:8080/api/app/v1，可用 VITE_APP_API_BASE_URL 覆盖
src/stores/session.ts  # 依赖注入的 session controller，可测试
src/composables/useSession.ts # runtime singleton
src/utils/storage.ts   # uni storage adapter
src/locales/*          # 可见文案
```

## RBAC 第一版

后端当前 App API 不返回菜单树、router 或 buttonCodes。因此第一版不伪造 admin RBAC，采用 app scope 登录态守卫：

```text
未登录或 token 失效 -> reLaunch 到 /pages/login/index
已登录 -> 允许进入 tabbar 首页/我的
```

后续如果后端新增 `/api/app/v1/users/init`，再扩展 app 菜单/能力权限。

## UI 选型

采用 `uview-plus` + UniApp 原生组件，原因：它适合 App/H5/小程序多端基线。当前实现通过 easycom 按需引入组件，并只安装本地 `$u` runtime，不使用 `uview-plus` 全量 plugin install。

登录页视觉参考 PC 后台登录页的移动端结构：背景氛围层、mobile brand header、白色 mobile sheet、登录方式 tabs、协议勾选和 captcha overlay。但实现保持 UniApp-native，不直接搬 Element Plus / go-captcha-vue。

## 验证策略

```text
Vitest：锁 API 解析、app-auth 调用、session controller、后端 base URL 不走 Vite proxy、登录页结构文案。
vue-tsc：锁 TypeScript 和 SFC 类型。
build:h5：先证明 H5 构建链路可跑；App 真机包作为后续发布切片。
```
