export default {
  app: {
    name: '智澜 Admin App',
    slogan: '移动端运营控制台',
  },
  common: {
    loading: '加载中...',
    retry: '重试',
    logout: '退出登录',
    confirmLogout: '确定退出当前账号吗？',
  },
  auth: {
    loginTitle: '欢迎回来',
    loginSubtitle: '使用后台账号登录移动端控制台',
    account: '账号',
    password: '密码',
    accountPlaceholder: '请输入手机号或邮箱',
    passwordPlaceholder: '请输入密码',
    submit: '登录',
    required: '请输入账号和密码',
  },
  tabbar: {
    home: '首页',
    mine: '我的',
  },
  home: {
    title: '首页',
    greeting: '你好，{name}',
    statusTitle: 'App API 已连接',
    statusDesc: '当前会话已通过 /api/app/v1/users/me 验证。',
    rbacTitle: 'RBAC 状态',
    rbacDesc: '第一版使用登录态守卫，未登录无法进入首页和我的。',
    nextTitle: '下一阶段',
    nextDesc: '等待后端 app bootstrap 后扩展菜单、能力权限和业务模块。',
  },
  mine: {
    title: '我的',
    accountCard: '账号信息',
    userId: '用户 ID',
    nickname: '昵称',
    avatar: '头像',
    noAvatar: '暂无头像',
  },
}
