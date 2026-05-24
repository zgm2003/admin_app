<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { appAuthClient } from '@/api/appAuth'
import { AppCaptchaOverlay } from '@/components/AppCaptcha'
import { usePreferences } from '@/composables/usePreferences'
import { useSession } from '@/composables/useSession'
import { redirectToHome } from '@/router/guards'
import type { AppLoginType, AppLoginTypeOption, AppSlideCaptchaChallenge } from '@/types/auth'
import type { AppLocale } from '@/types/preferences'

const { t } = useI18n()
const authSession = useSession()
const preferences = usePreferences()

const currentLocale = computed(() => preferences.state.locale)
const loginTypeValues = ref<AppLoginType[]>(['password'])
const activeLoginType = ref<AppLoginType>('password')
const showPassword = ref(false)
const rememberAccount = ref(true)
const agreementAccepted = ref(false)
const captchaVisible = ref(false)
const captchaLoading = ref(false)
const captchaChallenge = shallowRef<AppSlideCaptchaChallenge | null>(null)
const captchaSliderX = ref(0)
const sendCodeLoading = ref(false)
const CAPTCHA_MIN_MOVE_OFFSET = 16

const form = reactive({
  loginAccount: '',
  password: '',
  code: '',
})

const loginTypes = computed<AppLoginTypeOption[]>(() => {
  currentLocale.value
  return loginTypeValues.value.map((value) => ({
    label: t(`auth.loginTypes.${value}`),
    value,
  }))
})

const localeOptions = computed<Array<{ label: string; value: AppLocale }>>(() => [
  { label: t('mine.localeZh'), value: 'zh-CN' },
  { label: t('mine.localeEn'), value: 'en-US' },
])

const passwordToggleText = computed(() => (showPassword.value ? t('common.hide') : t('common.show')))

const activeTypeConfig = computed(() => ({
  label: t(`auth.loginTypes.${activeLoginType.value}`),
  accountLabel: activeLoginType.value === 'email'
    ? t('auth.email')
    : activeLoginType.value === 'phone'
      ? t('auth.phone')
      : t('auth.account'),
  accountPlaceholder: activeLoginType.value === 'email'
    ? t('auth.emailPlaceholder')
    : activeLoginType.value === 'phone'
      ? t('auth.phonePlaceholder')
      : t('auth.accountPlaceholder'),
}))

const canSubmit = computed(() => {
  if (!form.loginAccount.trim()) {
    return false
  }
  if (activeLoginType.value === 'password') {
    return form.password.length > 0
  }
  return form.code.trim().length > 0
})

onLoad(() => {
  void loadLoginConfig()
})

onShow(() => {
  void authSession.hydrate().then(() => {
    if (authSession.isAuthenticated.value) {
      redirectToHome()
    }
  })
})

async function loadLoginConfig() {
  try {
    const config = await appAuthClient.loginConfig()
    const availableTypes = config.login_type_arr.map((item) => item.value)
    if (availableTypes.length) {
      loginTypeValues.value = availableTypes
      if (!availableTypes.includes(activeLoginType.value)) {
        activeLoginType.value = availableTypes[0]
      }
    }
  } catch {
    loginTypeValues.value = ['password']
    activeLoginType.value = 'password'
  }
}

function switchLoginType(type: AppLoginType) {
  if (!loginTypeValues.value.includes(type)) {
    return
  }
  activeLoginType.value = type
  form.password = ''
  form.code = ''
  captchaVisible.value = false
}

function ensureAgreementAccepted(): boolean {
  if (agreementAccepted.value) {
    return true
  }
  uni.showToast({ title: t('auth.agreementRequired'), icon: 'none' })
  return false
}

function ensureFormReady(): boolean {
  if (canSubmit.value) {
    return true
  }
  uni.showToast({ title: t('auth.required'), icon: 'none' })
  return false
}

function setLocale(locale: AppLocale): void {
  preferences.setLocale(locale)
}

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}

async function handleSendCode() {
  if (!form.loginAccount.trim()) {
    uni.showToast({ title: t('auth.accountRequired'), icon: 'none' })
    return
  }
  sendCodeLoading.value = true
  try {
    await appAuthClient.sendCode({ account: form.loginAccount.trim(), scene: 'login' })
    uni.showToast({ title: t('common.sendCode'), icon: 'none' })
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.required')
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    sendCodeLoading.value = false
  }
}

async function openCaptcha() {
  captchaVisible.value = true
  captchaLoading.value = true
  captchaChallenge.value = null
  captchaSliderX.value = 0
  try {
    const challenge = await appAuthClient.captcha()
    captchaChallenge.value = challenge
    captchaSliderX.value = challenge.tile_x
  } catch (error) {
    captchaVisible.value = false
    const message = error instanceof Error ? error.message : t('auth.captchaLoadFailed')
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    captchaLoading.value = false
  }
}

async function handleLogin() {
  if (!ensureAgreementAccepted() || !ensureFormReady()) {
    return
  }
  if (activeLoginType.value === 'password') {
    await openCaptcha()
    return
  }
  await submitLogin()
}

async function submitLogin() {
  try {
    await authSession.login({
      login_type: activeLoginType.value,
      login_account: form.loginAccount.trim(),
      password: activeLoginType.value === 'password' ? form.password : undefined,
      code: activeLoginType.value === 'password' ? undefined : form.code.trim(),
    })
    redirectToHome()
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.required')
    uni.showToast({ title: message, icon: 'none' })
  }
}

async function confirmCaptchaLogin() {
  const challenge = captchaChallenge.value
  if (!challenge) {
    uni.showToast({ title: t('auth.captchaLoadFailed'), icon: 'none' })
    return
  }
  if (captchaSliderX.value < challenge.tile_x + CAPTCHA_MIN_MOVE_OFFSET) {
    uni.showToast({ title: t('auth.captchaRequired'), icon: 'none' })
    return
  }
  try {
    await authSession.login({
      login_type: 'password',
      login_account: form.loginAccount.trim(),
      password: form.password,
      captcha_id: challenge.captcha_id,
      captcha_answer: {
        x: Math.round(captchaSliderX.value),
        y: challenge.tile_y,
      },
    })
    captchaVisible.value = false
    redirectToHome()
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.required')
    uni.showToast({ title: message, icon: 'none' })
    await openCaptcha()
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-background">
      <view class="mesh-gradient" />
      <view class="dot-pattern" />
      <view class="deco-blob blob-1" />
      <view class="deco-blob blob-2" />
      <view class="deco-blob blob-3" />
    </view>

    <view class="content-wrapper">
      <view class="form-section login-mobile-sheet">
        <view class="login-mobile-brand">
          <view class="brand-group">
            <view class="logo-box">
              <text class="logo-mark">Z</text>
            </view>
            <view class="brand-info">
              <text class="brand-name">{{ t('auth.brandTitle') }}</text>
              <text class="brand-tagline">{{ t('auth.brandTagline') }}</text>
            </view>
          </view>

          <view class="language-switch">
            <view class="language-switch__label">{{ t('mine.language') }}</view>
            <view class="language-switch__row">
              <view
                v-for="item in localeOptions"
                :key="item.value"
                class="language-switch__chip"
                :class="{ active: currentLocale === item.value }"
                @click="setLocale(item.value)"
              >
                {{ item.label }}
              </view>
            </view>
          </view>
        </view>

        <view class="login-form-card">
          <view class="header-text">
            <text class="welcome-title">{{ t('auth.loginTitle') }}</text>
            <text class="welcome-desc">{{ t('auth.loginPanelDesc') }}</text>
          </view>

          <view class="method-tabs">
            <view
              v-for="type in loginTypes"
              :key="type.value"
              class="tab-btn"
              :class="{ active: activeLoginType === type.value }"
              @click="switchLoginType(type.value)"
            >
              <text>{{ type.label }}</text>
            </view>
          </view>

          <view class="field-group">
            <text class="field-label">{{ activeTypeConfig.accountLabel }}</text>
            <input
              v-model="form.loginAccount"
              class="field-input"
              type="text"
              :placeholder="activeTypeConfig.accountPlaceholder"
              placeholder-class="field-placeholder"
            />
          </view>

          <view v-if="activeLoginType === 'password'" class="field-group">
            <text class="field-label">{{ t('auth.password') }}</text>
            <view class="password-field">
              <input
                v-model="form.password"
                class="field-input password-input"
                :type="showPassword ? 'text' : 'password'"
                :password="!showPassword"
                :placeholder="t('auth.passwordPlaceholder')"
                placeholder-class="field-placeholder"
              />
              <text class="password-toggle" @click="togglePasswordVisibility()">
                {{ passwordToggleText }}
              </text>
            </view>
          </view>

          <view v-else class="field-group">
            <text class="field-label">{{ t('auth.code') }}</text>
            <view class="code-field">
              <input
                v-model="form.code"
                class="field-input code-input"
                type="number"
                :placeholder="t('auth.codePlaceholder')"
                placeholder-class="field-placeholder"
              />
              <button class="send-code-btn" :disabled="sendCodeLoading" @click="handleSendCode">
                {{ sendCodeLoading ? t('common.sending') : t('common.sendCode') }}
              </button>
            </view>
          </view>

          <view class="form-options">
            <label class="remember-row">
              <checkbox :checked="rememberAccount" color="#409eff" @click="rememberAccount = !rememberAccount" />
              <text>{{ t('auth.remember') }}</text>
            </label>
          </view>

          <label class="agreement-row">
            <checkbox :checked="agreementAccepted" color="#409eff" @click="agreementAccepted = !agreementAccepted" />
            <text class="agreement-copy">
              {{ t('auth.agreementPrefix') }}
              <text class="agreement-link">{{ t('auth.serviceAgreement') }}</text>
              /
              <text class="agreement-link">{{ t('auth.privacyPolicy') }}</text>
            </text>
          </label>

          <u-button
            :text="authSession.state.loading ? t('common.loading') : t('auth.submit')"
            :loading="authSession.state.loading"
            shape="circle"
            :custom-style="{
              height: '92rpx',
              border: '0',
              borderRadius: '24rpx',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '30rpx',
              background: 'linear-gradient(135deg, #409eff 0%, #2563eb 100%)',
              boxShadow: '0 18rpx 42rpx rgba(64, 158, 255, 0.24)',
            }"
            @click="handleLogin"
          />
        </view>
      </view>
    </view>

    <AppCaptchaOverlay
      v-model="captchaVisible"
      class="captcha-overlay"
      :challenge="captchaChallenge"
      :slider-x="captchaSliderX"
      :loading="captchaLoading"
      :verifying="authSession.state.loading"
      @update:slider-x="captchaSliderX = $event"
      @refresh="openCaptcha"
      @complete="confirmCaptchaLogin"
    />
  </view>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f5f8fc;
  color: #0f172a;
}

.login-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.mesh-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(64, 158, 255, 0.2), transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.14), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(64, 158, 255, 0.1), transparent 46%);
  filter: blur(60rpx);
}

.dot-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: radial-gradient(#409eff 1rpx, transparent 1rpx);
  background-size: 34rpx 34rpx;
}

.deco-blob {
  position: absolute;
  border-radius: 9999rpx;
  filter: blur(80rpx);
  opacity: 0.36;
  background: rgba(64, 158, 255, 0.22);
}

.blob-1 {
  top: -160rpx;
  left: -130rpx;
  width: 520rpx;
  height: 520rpx;
}

.blob-2 {
  right: -140rpx;
  bottom: -100rpx;
  width: 430rpx;
  height: 430rpx;
  background: rgba(59, 130, 246, 0.16);
}

.blob-3 {
  top: 26%;
  right: 8%;
  width: 300rpx;
  height: 300rpx;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  padding: 24rpx;
  align-items: center;
  justify-content: center;
}

.form-section.login-mobile-sheet {
  width: 100%;
  max-width: 720rpx;
  overflow: hidden;
  border: 1rpx solid rgba(255, 255, 255, 0.85);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 24rpx 72rpx rgba(15, 23, 42, 0.14),
    inset 0 0 0 1rpx rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20rpx);
}

.login-mobile-brand {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 24rpx 28rpx 20rpx;
  border-bottom: 1rpx solid rgba(15, 23, 42, 0.06);
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-width: 0;
  flex: 1 1 360rpx;
}

.logo-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: #409eff;
  box-shadow: 0 8rpx 24rpx rgba(64, 158, 255, 0.22);
}

.logo-mark {
  color: #fff;
  font-size: 34rpx;
  font-weight: 900;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.brand-name {
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 900;
}

.brand-tagline {
  color: #64748b;
  font-size: 22rpx;
}

.language-switch {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  flex-shrink: 0;
  padding: 10rpx 12rpx;
  border-radius: 22rpx;
  background: rgba(15, 23, 42, 0.05);
}

.language-switch__label {
  color: #64748b;
  font-size: 20rpx;
  font-weight: 700;
  text-align: right;
}

.language-switch__row {
  display: flex;
  gap: 8rpx;
}

.language-switch__chip {
  min-width: 92rpx;
  padding: 12rpx 18rpx;
  border-radius: 16rpx;
  color: #64748b;
  background: rgba(255, 255, 255, 0.9);
  font-size: 22rpx;
  font-weight: 700;
  text-align: center;
  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.language-switch__chip.active {
  color: #1d4ed8;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.08);
  transform: translateY(-1rpx);
}

.login-form-card {
  padding: 22rpx 28rpx 28rpx;
}

.header-text {
  margin-bottom: 22rpx;
}

.welcome-title,
.welcome-desc,
.field-label,
.captcha-title,
.captcha-hint {
  display: block;
}

.welcome-title {
  color: #0f172a;
  font-size: 44rpx;
  font-weight: 900;
}

.welcome-desc {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 25rpx;
}

.method-tabs {
  display: flex;
  gap: 10rpx;
  padding: 8rpx;
  margin-bottom: 22rpx;
  border-radius: 22rpx;
  background: rgba(15, 23, 42, 0.05);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 68rpx;
  border-radius: 18rpx;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 700;
}

.tab-btn.active {
  color: #1d4ed8;
  background: #fff;
  box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.08);
}

.field-group {
  margin-bottom: 22rpx;
}

.field-label {
  margin-bottom: 12rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 700;
}

.field-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  color: #0f172a;
  font-size: 28rpx;
  border: 1rpx solid #dbe7f6;
  border-radius: 20rpx;
  background: #f8fbff;
}

.field-placeholder {
  color: #94a3b8;
}

.password-field,
.code-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 120rpx;
}

.password-toggle {
  position: absolute;
  right: 24rpx;
  color: #409eff;
  font-size: 24rpx;
  font-weight: 800;
}

.code-input {
  padding-right: 210rpx;
}

.send-code-btn {
  position: absolute;
  right: 10rpx;
  height: 68rpx;
  min-width: 180rpx;
  padding: 0 20rpx;
  border: 0;
  border-radius: 16rpx;
  color: #1d4ed8;
  background: rgba(64, 158, 255, 0.12);
  font-size: 23rpx;
  font-weight: 800;
  line-height: 68rpx;
}

.form-options,
.remember-row,
.agreement-row {
  display: flex;
  align-items: center;
}

.form-options {
  justify-content: space-between;
  min-height: 44rpx;
  margin-bottom: 12rpx;
}

.remember-row,
.agreement-row {
  gap: 8rpx;
  color: #64748b;
  font-size: 23rpx;
}

.agreement-row {
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.agreement-copy {
  flex: 1;
  line-height: 1.5;
}

.agreement-link {
  color: #409eff;
  font-weight: 700;
}

@media (max-width: 480px) {
  .login-mobile-brand {
    align-items: flex-start;
  }

  .language-switch {
    width: 100%;
  }

  .language-switch__label {
    text-align: left;
  }
}

</style>
