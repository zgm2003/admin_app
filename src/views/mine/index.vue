<script setup lang="ts">
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { appProfileClient } from '@/api/appProfile'
import { useSession } from '@/hooks/useSession'
import { redirectToLogin, requireAuthenticatedPage } from '@/router/guards'
import type { AppProfileResponse } from '@/types/user'

const { t } = useI18n()
const authSession = useSession()

const currentUser = computed(() => authSession.state.user)
const profileSummary = reactive({
  user_id: 0,
  nickname: '',
  avatar: '',
  email: '',
  phone: '',
})

const displayAvatar = computed(() => profileSummary.avatar || currentUser.value?.avatar || '')
const displayName = computed(() => profileSummary.nickname || currentUser.value?.nickname || '-')
const avatarInitial = computed(() => displayName.value.slice(0, 1) || 'A')
const displayUserId = computed(() => profileSummary.user_id || currentUser.value?.id || 0)
const contactLine = computed(() => {
  const contacts = [profileSummary.phone, profileSummary.email].filter(Boolean)
  return contacts.length ? contacts.join(' · ') : t('mine.profileIncomplete')
})

function syncProfileFromSession(profile: AppProfileResponse['profile'] | null = null): void {
  if (profile) {
    profileSummary.user_id = profile.user_id
    profileSummary.nickname = profile.nickname
    profileSummary.avatar = profile.avatar
    profileSummary.email = profile.email
    profileSummary.phone = profile.phone
    return
  }

  profileSummary.user_id = currentUser.value?.id || 0
  profileSummary.nickname = currentUser.value?.nickname || ''
  profileSummary.avatar = currentUser.value?.avatar || ''
  profileSummary.email = ''
  profileSummary.phone = ''
}

async function loadProfileSummary(): Promise<void> {
  try {
    const result = await appProfileClient.profile()
    syncProfileFromSession(result.profile)
  } catch {
    syncProfileFromSession()
  }
}

onShow(async () => {
  const ok = await requireAuthenticatedPage()
  if (!ok) {
    return
  }
  syncProfileFromSession()
  await loadProfileSummary()
})

function navigateToProfileEdit(): void {
  uni.navigateTo({ url: '/views/profile/edit' })
}

function navigateToSettings(): void {
  uni.navigateTo({ url: '/views/settings/index' })
}

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
    <view class="mine-hero">
      <view>
        <text class="mine-kicker">{{ t('app.slogan') }}</text>
        <text class="mine-title">{{ t('mine.title') }}</text>
        <text class="mine-subtitle">{{ t('mine.accountCard') }}</text>
      </view>
    </view>

    <view class="profile-card profile-card--hero">
      <view class="avatar-wrap">
        <image v-if="displayAvatar" class="avatar-image" :src="displayAvatar" mode="aspectFill" />
        <text v-else class="avatar-text">{{ avatarInitial }}</text>
      </view>
      <view class="profile-main">
        <text class="profile-name">{{ displayName }}</text>
        <text class="profile-id">{{ t('mine.userId') }} #{{ displayUserId || '-' }}</text>
        <text class="profile-contact">{{ contactLine }}</text>
      </view>
    </view>

    <view class="action-section">
      <text class="section-title">{{ t('mine.actionTitle') }}</text>
      <text class="section-desc">{{ t('mine.actionDesc') }}</text>

      <view class="entry-card profile-entry-card" @click="navigateToProfileEdit">
        <view class="entry-icon entry-icon--blue">✎</view>
        <view class="entry-copy">
          <text class="entry-title">{{ t('mine.profileEntryTitle') }}</text>
          <text class="entry-desc">{{ t('mine.profileEntryDesc') }}</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>

      <view class="entry-card settings-entry-card" @click="navigateToSettings">
        <view class="entry-icon entry-icon--green">⚙</view>
        <view class="entry-copy">
          <text class="entry-title">{{ t('mine.settingsEntryTitle') }}</text>
          <text class="entry-desc">{{ t('mine.settingsEntryDesc') }}</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>
    </view>

    <u-button
      :text="t('common.logout')"
      :loading="authSession.state.loading"
      shape="circle"
      type="error"
      :custom-style="{
        height: '96rpx',
        marginTop: '34rpx',
        border: '1rpx solid rgba(255, 91, 91, 0.18)',
        borderRadius: '28rpx',
        color: 'var(--app-danger)',
        fontWeight: '800',
        fontSize: '30rpx',
        background: 'var(--app-danger-soft)',
      }"
      @click="handleLogout"
    />
  </view>
</template>

<style scoped>
.mine-page {
  min-height: 100vh;
  padding: 88rpx 30rpx 52rpx;
  background:
    radial-gradient(circle at 8% -4%, rgba(37, 99, 235, 0.16), transparent 30%),
    radial-gradient(circle at 104% 8%, rgba(76, 220, 181, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.44), rgba(246, 248, 252, 0)),
    var(--app-bg);
}

.mine-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.mine-kicker,
.mine-title,
.mine-subtitle,
.profile-name,
.profile-id,
.profile-contact,
.section-title,
.section-desc,
.entry-title,
.entry-desc {
  display: block;
}

.mine-kicker {
  margin-bottom: 10rpx;
  color: var(--app-primary);
  font-size: 23rpx;
  font-weight: 900;
}

.mine-title {
  color: var(--app-text);
  font-size: 52rpx;
  font-weight: 950;
  letter-spacing: -1rpx;
}

.mine-subtitle {
  margin-top: 10rpx;
  color: var(--app-text-muted);
  font-size: 25rpx;
}

.profile-card {
  border: 1rpx solid var(--app-line);
  border-radius: 36rpx;
  background: var(--app-card-bg);
  box-shadow: var(--app-shadow);
}

.profile-card--hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx;
  margin-bottom: 28rpx;
  overflow: hidden;
}

.profile-card--hero::after {
  position: absolute;
  right: -70rpx;
  bottom: -90rpx;
  width: 220rpx;
  height: 220rpx;
  content: '';
  border-radius: 70rpx;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(103, 232, 198, 0.16));
  transform: rotate(24deg);
}

.avatar-wrap {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120rpx;
  height: 120rpx;
  overflow: hidden;
  border: 6rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 34rpx;
  background: linear-gradient(135deg, #4f8cff 0%, #67e8c6 100%);
  box-shadow: 0 16rpx 34rpx rgba(37, 99, 235, 0.18);
}

.avatar-image {
  width: 120rpx;
  height: 120rpx;
}

.avatar-text {
  color: #fff;
  font-size: 50rpx;
  font-weight: 950;
}

.profile-main {
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.profile-name {
  color: var(--app-text);
  font-size: 38rpx;
  font-weight: 950;
}

.profile-id,
.profile-contact {
  margin-top: 10rpx;
  color: var(--app-text-muted);
  font-size: 24rpx;
}

.action-section {
  padding: 28rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 36rpx;
  background: var(--app-card-bg);
  box-shadow: var(--app-shadow);
}

.section-title {
  color: var(--app-text);
  font-size: 33rpx;
  font-weight: 950;
}

.section-desc {
  margin-top: 8rpx;
  margin-bottom: 22rpx;
  color: var(--app-text-muted);
  font-size: 24rpx;
  line-height: 1.45;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 116rpx;
  padding: 20rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 28rpx;
  background: var(--app-card-soft-bg);
}

.entry-card + .entry-card {
  margin-top: 18rpx;
}

.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 22rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.14);
}

.entry-icon--blue {
  background: linear-gradient(135deg, #2563eb, #4f8cff);
}

.entry-icon--green {
  background: linear-gradient(135deg, #16a085, #67e8c6);
}

.entry-copy {
  flex: 1;
  min-width: 0;
}

.entry-title {
  color: var(--app-text);
  font-size: 29rpx;
  font-weight: 900;
}

.entry-desc {
  margin-top: 6rpx;
  color: var(--app-text-muted);
  font-size: 23rpx;
  line-height: 1.45;
}

.entry-arrow {
  color: var(--app-text-muted);
  font-size: 48rpx;
  font-weight: 200;
}
</style>
