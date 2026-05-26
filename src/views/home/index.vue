<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { useSession } from '@/hooks/useSession'
import { requireAuthenticatedPage } from '@/router/guards'

const { t } = useI18n()
const authSession = useSession()

const displayName = computed(() => authSession.state.user?.nickname || t('app.name'))

onShow(() => {
  void requireAuthenticatedPage()
})
</script>

<template>
  <view class="home-page">
    <view class="home-orbit orbit-a" />
    <view class="home-orbit orbit-b" />

    <view class="home-header">
      <view>
        <text class="home-kicker">{{ t('app.slogan') }}</text>
        <text class="home-title">{{ t('home.greeting', { name: displayName }) }}</text>
      </view>
      <view class="home-live-badge">
        <text class="home-live-dot" />
        <text>{{ t('home.live') }}</text>
      </view>
    </view>

    <view class="home-hero-card">
      <view class="hero-copy">
        <text class="card-label">{{ t('home.statusTitle') }}</text>
        <text class="card-value">App API</text>
        <text class="card-desc">{{ t('home.statusDesc') }}</text>
      </view>
      <view class="hero-chip">/api/app/v1</view>
    </view>

    <view class="home-feature-grid">
      <view class="info-card">
        <view class="info-icon icon-blue">✓</view>
        <text class="info-title">{{ t('home.rbacTitle') }}</text>
        <text class="info-desc">{{ t('home.rbacDesc') }}</text>
      </view>
      <view class="info-card">
        <view class="info-icon icon-green">↗</view>
        <text class="info-title">{{ t('home.nextTitle') }}</text>
        <text class="info-desc">{{ t('home.nextDesc') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 92rpx 34rpx 48rpx;
  background:
    radial-gradient(circle at 12% 0%, rgba(90, 150, 255, 0.18), transparent 34%),
    radial-gradient(circle at 90% 18%, rgba(76, 220, 181, 0.16), transparent 28%),
    var(--app-bg);
}

.home-orbit {
  position: absolute;
  border: 1rpx solid rgba(37, 99, 235, 0.08);
  border-radius: 9999rpx;
  pointer-events: none;
}

.orbit-a {
  top: -160rpx;
  right: -180rpx;
  width: 460rpx;
  height: 460rpx;
}

.orbit-b {
  top: 80rpx;
  left: -220rpx;
  width: 360rpx;
  height: 360rpx;
}

.home-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 38rpx;
}

.home-kicker,
.home-title,
.card-label,
.card-value,
.card-desc,
.info-title,
.info-desc {
  display: block;
}

.home-kicker {
  margin-bottom: 12rpx;
  color: var(--app-primary);
  font-size: 24rpx;
  font-weight: 800;
}

.home-title {
  color: var(--app-text);
  font-size: 46rpx;
  font-weight: 900;
  letter-spacing: -1rpx;
}

.home-live-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 18rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 999rpx;
  color: var(--app-text-muted);
  background: var(--app-card-soft-bg);
  font-size: 22rpx;
  box-shadow: 0 10rpx 32rpx rgba(37, 67, 134, 0.08);
}

.home-live-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #22c55e;
  box-shadow: 0 0 0 8rpx rgba(34, 197, 94, 0.12);
}

.home-hero-card {
  position: relative;
  z-index: 1;
  min-height: 310rpx;
  padding: 38rpx;
  margin-bottom: 28rpx;
  overflow: hidden;
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 38rpx;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(240, 246, 255, 0.86)),
    radial-gradient(circle at 88% 18%, rgba(76, 220, 181, 0.24), transparent 30%);
  box-shadow: var(--app-shadow);
}

.home-hero-card::after {
  position: absolute;
  right: -50rpx;
  bottom: -80rpx;
  width: 250rpx;
  height: 250rpx;
  content: '';
  border-radius: 80rpx;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(76, 220, 181, 0.18));
  transform: rotate(24deg);
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.card-label {
  color: var(--app-text-muted);
  font-size: 24rpx;
}

.card-value {
  margin: 30rpx 0 18rpx;
  color: var(--app-text);
  font-size: 62rpx;
  font-weight: 900;
  letter-spacing: -3rpx;
}

.card-desc {
  max-width: 560rpx;
  color: var(--app-text-muted);
  font-size: 27rpx;
  line-height: 1.65;
}

.hero-chip {
  position: absolute;
  right: 28rpx;
  top: 30rpx;
  z-index: 1;
  padding: 12rpx 18rpx;
  border-radius: 999rpx;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
  font-size: 22rpx;
  font-weight: 800;
}

.home-feature-grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-card {
  padding: 30rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 34rpx;
  background: var(--app-card-bg);
  box-shadow: 0 16rpx 44rpx rgba(37, 67, 134, 0.08);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 900;
}

.icon-blue {
  background: #2563eb;
}

.icon-green {
  background: #16a085;
}

.info-title {
  margin-bottom: 14rpx;
  color: var(--app-text);
  font-size: 30rpx;
  font-weight: 900;
}

.info-desc {
  color: var(--app-text-muted);
  font-size: 26rpx;
  line-height: 1.6;
}
</style>
