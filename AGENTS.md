# Admin App Agent Guidance

## 定位

`admin_app` 是 `E:\admin_go` 工作区里的 UniApp Vue3 移动端 runtime。它只接 `/api/app/v1` 用户端 API，不复用后台 `/api/admin/v1` 菜单、按钮或 cookie 鉴权策略。

默认接入 root agent 框架：

```text
root AGENTS.md / docs/architecture/* = 工作区治理
admin_app/AGENTS.md                  = UniApp 子仓执行规则
admin_app/docs/architecture.md        = app runtime 架构事实
admin_app/docs/app-api-v1.md          = app-api 前端契约摘要
```

## 当前主角色

默认按 root `agents/frontend-adapter.md` 的精神工作：前端只适配已经明确的 Go App API 契约，不让页面自造后端字段。

## 技术栈

```text
UniApp Vue3 + TypeScript + Composition API
vue-i18n
uview-plus
Vitest for pure TS contract/session tests
```

## 硬规则

```text
1. 新页面默认使用 <script setup lang="ts">。
2. API 只能通过 src/api/*，页面不直接调用 uni.request。
3. 会话状态只能通过 src/composables/useSession.ts，页面不直接读写 token storage。
4. 第一版 RBAC = app 登录态守卫：未登录不能进入首页/我的；不要伪造 admin 菜单/按钮权限。
5. 只接 /api/app/v1/auth/login、/api/app/v1/users/me、/api/app/v1/auth/logout。
6. 新增可见文案进 src/locales/zh-CN.ts 和 src/locales/en-US.ts。
7. 组件边界保持薄页面 + store/composable/service；不要把请求、存储、跳转和模板全塞进单个页面。
8. 先写最小测试锁住 API/session 行为，再改实现。
```

## 验证

最小验证：

```powershell
npm run test:unit
npm run type-check
npm run build:h5
```

如果改了 root governance/docs，还要回到 `E:\admin_go` 跑 root governance gate。
