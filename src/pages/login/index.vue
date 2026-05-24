<script setup lang="ts">
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { useSession } from '@/composables/useSession'
import { redirectToHome } from '@/router/guards'

const { t } = useI18n()
const authSession = useSession()
const form = reactive({
  account: '',
  password: '',
})

const canSubmit = computed(() => form.account.trim().length > 0 && form.password.length > 0)

onShow(() => {
  void authSession.hydrate().then(() => {
    if (authSession.isAuthenticated.value) {
      redirectToHome()
    }
  })
})

async function handleLogin() {
  if (!canSubmit.value) {
    uni.showToast({ title: t('auth.required'), icon: 'none' })
    return
  }
  try {
    await authSession.login({
      account: form.account.trim(),
      password: form.password,
    })
    redirectToHome()
  } catch (error) {
    const message = error instanceof Error ? error.message : t('auth.required')
    uni.showToast({ title: message, icon: 'none' })
  }
}
</script>

<template>
  <view class="login-page">
    <view class="login-orb login-orb-primary" />
    <view class="login-orb login-orb-secondary" />

    <view class="login-hero">
      <text class="login-kicker">APP API</text>
      <text class="login-title">{{ t('auth.loginTitle') }}</text>
      <text class="login-subtitle">{{ t('auth.loginSubtitle') }}</text>
    </view>

    <view class="login-panel">
      <view class="field-group">
        <text class="field-label">{{ t('auth.account') }}</text>
        <input
          v-model="form.account"
          class="field-input"
          type="text"
          :placeholder="t('auth.accountPlaceholder')"
          placeholder-class="field-placeholder"
        />
      </view>

      <view class="field-group">
        <text class="field-label">{{ t('auth.password') }}</text>
        <input
          v-model="form.password"
          class="field-input"
          type="password"
          password
          :placeholder="t('auth.passwordPlaceholder')"
          placeholder-class="field-placeholder"
        />
      </view>

      <u-button
        :text="authSession.state.loading ? t('common.loading') : t('auth.submit')"
        :loading="authSession.state.loading"
        shape="circle"
        :custom-style="{
          height: '98rpx',
          border: '0',
          borderRadius: '28rpx',
          color: '#03131c',
          fontWeight: '800',
          fontSize: '30rpx',
          background: 'linear-gradient(135deg, #57d2ff 0%, #6df5c2 100%)',
          boxShadow: '0 18rpx 42rpx rgba(87, 210, 255, 0.24)',
        }"
        @click="handleLogin"
      />
    </view>
  </view>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  padding: 128rpx 42rpx 56rpx;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(87, 210, 255, 0.16), transparent 32%),
    linear-gradient(180deg, #07111c 0%, #081723 100%);
}

.login-orb {
  position: absolute;
  border-radius: 9999rpx;
  filter: blur(8rpx);
  opacity: 0.65;
}

.login-orb-primary {
  top: 70rpx;
  right: -96rpx;
  width: 280rpx;
  height: 280rpx;
  background: rgba(87, 210, 255, 0.22);
}

.login-orb-secondary {
  left: -150rpx;
  bottom: 140rpx;
  width: 360rpx;
  height: 360rpx;
  background: rgba(79, 255, 184, 0.11);
}

.login-hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  margin-bottom: 72rpx;
}

.login-kicker {
  width: fit-content;
  padding: 10rpx 18rpx;
  color: #57d2ff;
  font-size: 22rpx;
  letter-spacing: 3rpx;
  border: 1rpx solid rgba(87, 210, 255, 0.38);
  border-radius: 999rpx;
  background: rgba(87, 210, 255, 0.08);
}

.login-title {
  color: #f2f8ff;
  font-size: 62rpx;
  font-weight: 800;
  letter-spacing: -2rpx;
}

.login-subtitle {
  max-width: 560rpx;
  color: #8eacc8;
  font-size: 28rpx;
  line-height: 1.7;
}

.login-panel {
  position: relative;
  z-index: 1;
  padding: 38rpx;
  border: 1rpx solid rgba(142, 172, 200, 0.18);
  border-radius: 36rpx;
  background: rgba(9, 22, 33, 0.78);
  box-shadow: 0 28rpx 72rpx rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(20rpx);
}

.field-group {
  margin-bottom: 30rpx;
}

.field-label {
  display: block;
  margin-bottom: 14rpx;
  color: #cfe2f6;
  font-size: 24rpx;
}

.field-input {
  width: 100%;
  height: 96rpx;
  padding: 0 28rpx;
  color: #f2f8ff;
  font-size: 30rpx;
  border: 1rpx solid rgba(142, 172, 200, 0.2);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.06);
}

.field-placeholder {
  color: rgba(142, 172, 200, 0.58);
}
</style>
