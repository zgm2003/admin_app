export default {
  app: {
    name: 'Zhilan Admin App',
    slogan: 'Mobile operations console',
  },
  common: {
    loading: 'Loading...',
    retry: 'Retry',
    logout: 'Log out',
    confirmLogout: 'Log out of the current account?',
  },
  auth: {
    loginTitle: 'Welcome back',
    loginSubtitle: 'Sign in with your admin account',
    account: 'Account',
    password: 'Password',
    accountPlaceholder: 'Phone or email',
    passwordPlaceholder: 'Password',
    submit: 'Sign in',
    required: 'Account and password are required',
  },
  tabbar: {
    home: 'Home',
    mine: 'Me',
  },
  home: {
    title: 'Home',
    greeting: 'Hello, {name}',
    statusTitle: 'App API connected',
    statusDesc: 'The current session has been verified by /api/app/v1/users/me.',
    rbacTitle: 'RBAC status',
    rbacDesc: 'Phase one uses session guard; guests cannot open Home or Me.',
    nextTitle: 'Next slice',
    nextDesc: 'Extend app bootstrap, menu, capability permissions, and business modules later.',
  },
  mine: {
    title: 'Me',
    accountCard: 'Account',
    userId: 'User ID',
    nickname: 'Nickname',
    avatar: 'Avatar',
    noAvatar: 'No avatar',
  },
}
