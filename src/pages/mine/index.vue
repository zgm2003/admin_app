<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { useSession } from '@/composables/useSession'
import { redirectToLogin, requireAuthenticatedPage } from '@/router/guards'

const { t } = useI18n()
const authSession = useSession()

const user = computed(() => authSession.state.user)
const avatarInitial = computed(() => user.value?.nickname?.slice(0, 1) || 'A')

onShow(() => {
  void requireAuthenticatedPage()
})

async function handleLogout() {
  uni.showModal({
    title: t('common.logout'),
    content: t('common.confirmLogout'),
    success: async (result) => {
      if (!result.confirm) {
        return
      }
      await authSession.logout()
      redirectToLogin()
    },
  })
}
</script>

<template>
  <view class="mine-page">
    <view class="mine-header">
      <text class="mine-title">{{ t('mine.title') }}</text>
      <text class="mine-subtitle">{{ t('mine.accountCard') }}</text>
    </view>

    <view class="profile-card">
      <view class="avatar-wrap">
        <image v-if="user?.avatar" class="avatar-image" :src="user.avatar" mode="aspectFill" />
        <text v-else class="avatar-text">{{ avatarInitial }}</text>
      </view>
      <view class="profile-main">
        <text class="profile-name">{{ user?.nickname || '-' }}</text>
        <text class="profile-id">{{ t('mine.userId') }} #{{ user?.id || '-' }}</text>
      </view>
    </view>

    <view class="detail-card">
      <view class="detail-row">
        <text class="detail-label">{{ t('mine.nickname') }}</text>
        <text class="detail-value">{{ user?.nickname || '-' }}</text>
      </view>
      <view class="detail-row">
        <text class="detail-label">{{ t('mine.avatar') }}</text>
        <text class="detail-value">{{ user?.avatar || t('mine.noAvatar') }}</text>
      </view>
    </view>

    <u-button
      :text="t('common.logout')"
      :loading="authSession.state.loading"
      shape="circle"
      type="error"
      :custom-style="{
        height: '96rpx',
        marginTop: '48rpx',
        border: '1rpx solid rgba(255, 120, 120, 0.24)',
        borderRadius: '28rpx',
        color: '#ffb9b9',
        fontWeight: '800',
        fontSize: '30rpx',
        background: 'rgba(255, 91, 91, 0.1)',
      }"
      @click="handleLogout"
    />
  </view>
</template>

<style scoped>
.mine-page {
  min-height: 100vh;
  padding: 96rpx 34rpx 48rpx;
  background:
    radial-gradient(circle at 50% 0%, rgba(109, 245, 194, 0.14), transparent 26%),
    linear-gradient(180deg, #06111a 0%, #091723 100%);
}

.mine-header {
  margin-bottom: 36rpx;
}

.mine-title,
.mine-subtitle,
.profile-name,
.profile-id,
.detail-label,
.detail-value {
  display: block;
}

.mine-title {
  color: #f3f8ff;
  font-size: 48rpx;
  font-weight: 900;
}

.mine-subtitle {
  margin-top: 10rpx;
  color: #8eacc8;
  font-size: 26rpx;
}

.profile-card,
.detail-card {
  border: 1rpx solid rgba(142, 172, 200, 0.16);
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.07);
  box-shadow: 0 24rpx 60rpx rgba(0, 0, 0, 0.18);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 26rpx;
  padding: 34rpx;
  margin-bottom: 26rpx;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 118rpx;
  height: 118rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #57d2ff 0%, #6df5c2 100%);
}

.avatar-image {
  width: 118rpx;
  height: 118rpx;
}

.avatar-text {
  color: #04141e;
  font-size: 48rpx;
  font-weight: 900;
}

.profile-name {
  color: #f5fbff;
  font-size: 36rpx;
  font-weight: 900;
}

.profile-id {
  margin-top: 10rpx;
  color: #8eacc8;
  font-size: 24rpx;
}

.detail-card {
  padding: 10rpx 30rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 92rpx;
  border-bottom: 1rpx solid rgba(142, 172, 200, 0.12);
}

.detail-row:last-child {
  border-bottom: 0;
}

.detail-label {
  color: #8eacc8;
  font-size: 26rpx;
}

.detail-value {
  max-width: 420rpx;
  color: #eef6ff;
  font-size: 26rpx;
  text-align: right;
  word-break: break-all;
}
</style>
