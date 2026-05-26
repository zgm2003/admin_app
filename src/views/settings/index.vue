<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { usePreferences } from '@/hooks/usePreferences'
import { clearAppLocalCache } from '@/utils/localCache'
import { requireAuthenticatedPage } from '@/router/guards'
import type { AppLocale, AppThemeMode } from '@/types/preferences'

const { t } = useI18n()
const preferences = usePreferences()

const currentLocale = computed(() => preferences.state.locale)
const currentTheme = computed(() => preferences.state.theme)

const localeOptions = computed<Array<{ label: string; value: AppLocale }>>(() => [
  { label: t('mine.localeZh'), value: 'zh-CN' },
  { label: t('mine.localeEn'), value: 'en-US' },
])

const themeOptions = computed<Array<{ label: string; value: AppThemeMode }>>(() => [
  { label: t('mine.themeLight'), value: 'light' },
  { label: t('mine.themeDark'), value: 'dark' },
])

function setLocale(locale: AppLocale): void {
  preferences.setLocale(locale)
}

function setTheme(theme: AppThemeMode): void {
  preferences.setTheme(theme)
}

function goBack(): void {
  uni.navigateBack()
}

function handleClearCache(): void {
  const removedKeys = clearAppLocalCache({
    keys() {
      const info = uni.getStorageInfoSync()
      return Array.isArray(info.keys) ? info.keys : []
    },
    remove(key) {
      uni.removeStorageSync(key)
    },
  })
  uni.showToast({
    title: removedKeys.length ? t('settings.clearCacheSuccess') : t('settings.noCacheToClear'),
    icon: removedKeys.length ? 'success' : 'none',
  })
}

onShow(async () => {
  await requireAuthenticatedPage()
})
</script>

<template>
  <view class="settings-page">
    <view class="page-topbar">
      <view class="back-button" @click="goBack">‹</view>
      <view class="page-heading">
        <text class="page-title">{{ t('settings.title') }}</text>
        <text class="page-subtitle">{{ t('settings.subtitle') }}</text>
      </view>
    </view>

    <view class="surface-card settings-card">
      <view class="section-head">
        <text class="section-title">{{ t('settings.appearanceTitle') }}</text>
        <text class="section-desc">{{ t('settings.appearanceDesc') }}</text>
      </view>

      <view class="setting-group">
        <view class="setting-line">
          <view class="setting-main">
            <text class="setting-label">{{ t('mine.language') }}</text>
            <text class="setting-desc">{{ currentLocale === 'en-US' ? 'English' : '简体中文' }}</text>
          </view>
        </view>
        <view class="toggle-row">
          <view
            v-for="item in localeOptions"
            :key="item.value"
            class="toggle-chip"
            :class="{ active: currentLocale === item.value }"
            @click="setLocale(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="setting-group">
        <view class="setting-line">
          <view class="setting-main">
            <text class="setting-label">{{ t('mine.themeMode') }}</text>
            <text class="setting-desc">{{ currentTheme === 'dark' ? t('mine.themeDark') : t('mine.themeLight') }}</text>
          </view>
        </view>
        <view class="toggle-row">
          <view
            v-for="item in themeOptions"
            :key="item.value"
            class="toggle-chip"
            :class="{ active: currentTheme === item.value }"
            @click="setTheme(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </view>
    </view>

    <view class="surface-card settings-card">
      <view class="section-head compact">
        <text class="section-title">{{ t('settings.storageTitle') }}</text>
        <text class="section-desc">{{ t('settings.storageDesc') }}</text>
      </view>

      <view class="entry-card" @click="handleClearCache">
        <view class="entry-icon">⌫</view>
        <view class="entry-copy">
          <text class="entry-title">{{ t('settings.clearCache') }}</text>
          <text class="entry-desc">{{ t('settings.clearCacheDesc') }}</text>
        </view>
        <text class="entry-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding: 72rpx 30rpx 52rpx;
  background:
    radial-gradient(circle at 8% -4%, rgba(37, 99, 235, 0.14), transparent 30%),
    radial-gradient(circle at 104% 8%, rgba(76, 220, 181, 0.16), transparent 28%),
    var(--app-bg);
}

.page-topbar {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 26rpx;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 24rpx;
  color: var(--app-text);
  background: var(--app-card-soft-bg);
  font-size: 58rpx;
  line-height: 1;
  box-shadow: 0 10rpx 30rpx rgba(37, 67, 134, 0.08);
}

.page-heading {
  flex: 1;
  min-width: 0;
}

.page-title,
.page-subtitle,
.section-title,
.section-desc,
.setting-label,
.setting-desc,
.entry-title,
.entry-desc {
  display: block;
}

.page-title {
  color: var(--app-text);
  font-size: 44rpx;
  font-weight: 950;
}

.page-subtitle {
  margin-top: 6rpx;
  color: var(--app-text-muted);
  font-size: 24rpx;
}

.surface-card {
  border: 1rpx solid var(--app-line);
  border-radius: 36rpx;
  background: var(--app-card-bg);
  box-shadow: var(--app-shadow);
}

.settings-card {
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-head {
  margin-bottom: 24rpx;
}

.section-head.compact {
  margin-bottom: 18rpx;
}

.section-title {
  color: var(--app-text);
  font-size: 33rpx;
  font-weight: 950;
}

.section-desc {
  margin-top: 8rpx;
  color: var(--app-text-muted);
  font-size: 24rpx;
  line-height: 1.45;
}

.setting-group + .setting-group {
  margin-top: 28rpx;
  padding-top: 26rpx;
  border-top: 1rpx solid var(--app-line);
}

.setting-line {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20rpx;
}

.setting-main {
  flex: 1;
}

.setting-label {
  color: var(--app-text);
  font-size: 28rpx;
  font-weight: 900;
}

.setting-desc {
  margin-top: 8rpx;
  color: var(--app-text-muted);
  font-size: 23rpx;
}

.toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 16rpx;
}

.toggle-chip {
  padding: 15rpx 22rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 999rpx;
  color: var(--app-text-muted);
  background: var(--app-card-soft-bg);
  font-size: 24rpx;
  font-weight: 800;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.toggle-chip.active {
  color: var(--app-primary-strong);
  border-color: rgba(37, 99, 235, 0.24);
  background: var(--app-primary-soft);
  box-shadow: 0 10rpx 24rpx rgba(37, 99, 235, 0.12);
  transform: translateY(-1rpx);
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  min-height: 108rpx;
  padding: 20rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 28rpx;
  background: var(--app-card-soft-bg);
}

.entry-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68rpx;
  height: 68rpx;
  border-radius: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #67e8c6);
  font-size: 30rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(37, 99, 235, 0.14);
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
