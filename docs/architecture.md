# Admin App Architecture

状态：initial UniApp app shell.

## 目标

`admin_app` 第一阶段只做移动端登录壳和两个 tabbar 页面：

```text
登录 -> 保存 app token -> 拉取当前用户 -> 首页 / 我的 -> 退出登录
```

## 组件与数据流

```text
pages/login/index.vue  -> useSession.login -> appAuthClient.login -> POST /auth/login
pages/home/index.vue   -> requireAuthenticatedPage -> session.state.user
pages/mine/index.vue   -> useSession.logout -> appAuthClient.logout -> POST /auth/logout
```

通用边界：

```text
src/api/http.ts        # 统一响应解析、Authorization、platform=app header
src/api/appAuth.ts     # app-auth 三个后端端点
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

采用 `uview-plus`，原因：它是 UniApp/Vue3 生态组件库，适合 App/H5/小程序多端基线；Vant 更偏 Vue mobile web，不作为第一阶段 UniApp 主组件库。当前实现通过 easycom 按需引入组件，并只安装本地 `$u` runtime，不使用 `uview-plus` 全量 plugin install。

视觉方向：深色移动控制台。首页强调“系统在线、当前用户、下一步能力预留”；我的页强调账号身份和退出闭环。

## 验证策略

```text
Vitest：锁 API 解析、app-auth 调用、session controller。
vue-tsc：锁 TypeScript 和 SFC 类型。
build:h5：先证明 H5 构建链路可跑；App 真机包作为后续发布切片。
```
