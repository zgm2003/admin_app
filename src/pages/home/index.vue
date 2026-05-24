<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { useSession } from '@/composables/useSession'
import { requireAuthenticatedPage } from '@/router/guards'

const { t } = useI18n()
const authSession = useSession()

const displayName = computed(() => authSession.state.user?.nickname || 'Admin')

onShow(() => {
  void requireAuthenticatedPage()
})
</script>

<template>
  <view class="home-page">
    <view class="home-header">
      <view>
        <text class="home-kicker">{{ t('app.slogan') }}</text>
        <text class="home-title">{{ t('home.greeting', { name: displayName }) }}</text>
      </view>
      <view class="pulse-dot" />
    </view>

    <view class="status-card hero-card">
      <text class="card-label">{{ t('home.statusTitle') }}</text>
      <text class="card-value">/api/app/v1</text>
      <text class="card-desc">{{ t('home.statusDesc') }}</text>
    </view>

    <view class="grid-card">
      <view class="info-card">
        <text class="info-title">{{ t('home.rbacTitle') }}</text>
        <text class="info-desc">{{ t('home.rbacDesc') }}</text>
      </view>
      <view class="info-card muted-card">
        <text class="info-title">{{ t('home.nextTitle') }}</text>
        <text class="info-desc">{{ t('home.nextDesc') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 96rpx 34rpx 48rpx;
  background:
    radial-gradient(circle at 82% 8%, rgba(87, 210, 255, 0.18), transparent 28%),
    linear-gradient(180deg, #06111a 0%, #091723 100%);
}

.home-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 44rpx;
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
  color: #57d2ff;
  font-size: 24rpx;
}

.home-title {
  color: #f3f8ff;
  font-size: 46rpx;
  font-weight: 800;
}

.pulse-dot {
  width: 24rpx;
  height: 24rpx;
  margin-top: 16rpx;
  border-radius: 999rpx;
  background: #6df5c2;
  box-shadow: 0 0 0 14rpx rgba(109, 245, 194, 0.1);
}

.status-card,
.info-card {
  border: 1rpx solid rgba(142, 172, 200, 0.16);
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.18);
}

.hero-card {
  min-height: 300rpx;
  padding: 36rpx;
  margin-bottom: 28rpx;
  background:
    linear-gradient(135deg, rgba(87, 210, 255, 0.22), rgba(109, 245, 194, 0.08)),
    rgba(255, 255, 255, 0.06);
}

.card-label {
  color: #a8c3dd;
  font-size: 24rpx;
}

.card-value {
  margin: 34rpx 0 20rpx;
  color: #f5fbff;
  font-size: 58rpx;
  font-weight: 900;
  letter-spacing: -2rpx;
}

.card-desc {
  color: #b7cee4;
  font-size: 27rpx;
  line-height: 1.65;
}

.grid-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.info-card {
  padding: 30rpx;
}

.muted-card {
  background: rgba(255, 255, 255, 0.045);
}

.info-title {
  margin-bottom: 14rpx;
  color: #eef6ff;
  font-size: 30rpx;
  font-weight: 800;
}

.info-desc {
  color: #8eacc8;
  font-size: 26rpx;
  line-height: 1.6;
}
</style>
