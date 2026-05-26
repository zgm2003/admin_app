# Admin App Architecture

状态：UniApp To C app shell with app auth captcha.

## 定位

`admin_app` 是 To C 业务端，不是管理系统 App。当前业务还未定义，因此第一阶段只保留用户端登录壳和登录态守卫，不引入 admin 菜单、按钮、RBAC 或 cookie 鉴权策略。

## 目标

当前闭环：

```text
读取 app 登录配置 -> 获取 slide captcha / 验证码 -> 登录 -> 保存 app token -> 拉取当前用户 -> 首页 / 我的 -> 修改资料 / 设置 -> 退出登录
```

## 组件与数据流

```text
src/views/login/index.vue       -> appAuthClient.loginConfig/captcha/sendCode
src/views/login/index.vue       -> useSession.login -> appAuthClient.login -> POST /auth/login
src/views/home/index.vue        -> requireAuthenticatedPage -> session.state.user
src/views/mine/index.vue        -> account hub + profile/settings entry + logout
src/views/profile/edit.vue      -> appProfileClient.profile/updateProfile + AppMediaUploader
AppMediaUploader -> App permission preflight on APP-PLUS, no native permission preflight on H5
AppMediaUploader -> /api/app/v1/upload-tokens + COS-only upload runtime
src/views/settings/index.vue    -> usePreferences language/theme + local cache management
```

通用边界：

```text
src/api/appAuth.ts              # app-auth 登录配置、验证码、登录、me、logout
src/api/appProfile.ts           # profile read/update client
src/api/appUpload.ts            # upload-token client
src/lib/http/env.ts             # default http://192.168.5.20:8080/api/app/v1, override by VITE_APP_API_BASE_URL
src/lib/http/index.ts           # 统一响应解析、Authorization、platform=app header
src/lib/upload/appUploadRuntime.ts # COS-only upload runtime
src/store/session.ts            # injectable session controller
src/store/preferences.ts        # injectable preferences controller
src/hooks/useSession.ts         # runtime singleton
src/hooks/usePreferences.ts     # runtime singleton
src/i18n/locales/*              # visible copy
src/enums/storage.ts            # stable storage keys
src/platform/*                  # App/uview runtime boundary
src/utils/localCache.ts         # 只清理 admin_app:cache/tmp，不清 token/user/locale/theme
src/utils/storage.ts            # uni storage adapter
```

## RBAC 第一版

后端当前 App API 不返回菜单树、router 或 buttonCodes。因此第一版不伪造 admin RBAC，采用 app scope 登录态守卫：

```text
未登录或 token 失效 -> reLaunch 到 /views/login/index
已登录 -> 允许进入 tabbar 首页/我的，并可从我的进入修改资料/设置详情页
```

后续如果后端新增 `/api/app/v1/users/init`，再扩展 app 菜单/能力权限。

## UI 选型

采用 `uview-plus` + UniApp 原生组件作为 H5 + App 基线，不做小程序。当前实现通过 easycom 按需引入组件，并只安装本地 `$u` runtime，不使用 `uview-plus` 全量 plugin install。

## 上传平台规则

上传只支持 H5 + App，不做小程序。

`AppMediaUploader` 是 App 侧共享上传组件。它可以使用 `uview-plus` 的 `up-upload` 做移动端预览和选择 UI，但不使用 `up-upload` 的 `autoUpload`；真实上传继续走 `/api/app/v1/upload-tokens` 和项目 COS-only runtime。

H5 不做 native permission preflight，由浏览器文件选择器接管。App 打开相册或相机前必须先检查是否已授权；已授权直接打开选择器，未授权或未知状态才展示用途说明并请求对应权限。权限拒绝时不打开选择器、不请求 upload token、不改变表单值。`manifest.json` 必须声明 Android CAMERA/READ_MEDIA_IMAGES/READ_MEDIA_VIDEO/READ_EXTERNAL_STORAGE 和 iOS NSCameraUsageDescription/NSPhotoLibraryUsageDescription。

登录页视觉参考 PC 后台登录页的移动端结构：背景氛围层、mobile brand header、白色 mobile sheet、登录方式 tabs、协议勾选和 captcha overlay。slide captcha 的内层验证器复用 `go-captcha-vue` 官方 `Slide` 组件和样式，不再手写 UniApp slider。

产品层级：`我的` 是账号 hub，不承载长表单；修改资料独立在 `views/profile/edit`；设置独立在 `views/settings/index`，后续清理缓存、隐私、安全等能力继续放设置页扩展。

## 验证策略

```text
Vitest：锁 API 解析、app-auth 调用、session controller、偏好/缓存 controller、后端 base URL 不走 Vite proxy、登录页结构文案、Mine hub 与独立资料/设置页结构。
vue-tsc：锁 TypeScript 和 SFC 类型。
build:h5：证明浏览器/H5 构建链路可跑。
build:app：证明 UniApp App target 可编译；真机权限流仍需要后续设备 smoke。
```
