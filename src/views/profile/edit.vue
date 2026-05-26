<script setup lang="ts">
import { computed, reactive, ref, shallowRef } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'

import { appProfileClient } from '@/api/appProfile'
import { AppMediaUploader } from '@/components/AppMediaUploader'
import { useSession } from '@/hooks/useSession'
import { requireAuthenticatedPage } from '@/router/guards'
import type { AppAddressOption, AppDictOption, AppProfile, AppProfileResponse } from '@/types/user'

interface AddressPickerOption {
  label: string
  value: number
}

interface PickerChangeEvent {
  detail: {
    value: number | string | Array<number | string>
  }
}

const { t } = useI18n()
const authSession = useSession()

const currentUser = computed(() => authSession.state.user)
const loadingProfile = shallowRef(false)
const savingProfile = shallowRef(false)
const sexOptions = ref<AppDictOption<number>[]>([])
const addressTree = ref<AppAddressOption[]>([])

const profileForm = reactive<AppProfile>({
  user_id: 0,
  nickname: '',
  email: '',
  phone: '',
  avatar: '',
  sex: 0,
  birthday: '',
  address_id: 0,
  detail_address: '',
  bio: '',
})

const displayName = computed(() => profileForm.nickname || currentUser.value?.nickname || '-')
const sexPickerIndex = computed(() => {
  const index = sexOptions.value.findIndex((item) => item.value === profileForm.sex)
  return index >= 0 ? index : 0
})

const sexLabel = computed(() => {
  const match = sexOptions.value.find((item) => item.value === profileForm.sex)
  return match?.label || t('mine.notSet')
})

const addressPickerOptions = computed<AddressPickerOption[]>(() => flattenAddressOptions(addressTree.value))
const addressPickerIndex = computed(() => {
  const index = addressPickerOptions.value.findIndex((item) => item.value === profileForm.address_id)
  return index >= 0 ? index : 0
})

const addressLabel = computed(() => {
  const match = addressPickerOptions.value.find((item) => item.value === profileForm.address_id)
  return match?.label || t('mine.notSet')
})

const birthdayLabel = computed(() => profileForm.birthday || t('mine.notSet'))

function syncProfileFromSession(profile: AppProfileResponse['profile'] | null = null): void {
  const source = profile ?? {
    user_id: currentUser.value?.id || 0,
    nickname: currentUser.value?.nickname || '',
    email: '',
    phone: '',
    avatar: currentUser.value?.avatar || '',
    sex: 0,
    birthday: '',
    address_id: 0,
    detail_address: '',
    bio: '',
  }

  profileForm.user_id = source.user_id
  profileForm.nickname = source.nickname
  profileForm.email = source.email
  profileForm.phone = source.phone
  profileForm.avatar = source.avatar
  profileForm.sex = source.sex
  profileForm.birthday = source.birthday
  profileForm.address_id = source.address_id
  profileForm.detail_address = source.detail_address
  profileForm.bio = source.bio
}

async function loadProfile(): Promise<void> {
  loadingProfile.value = true
  try {
    const result = await appProfileClient.profile()
    syncProfileFromSession(result.profile)
    sexOptions.value = result.dict.sexArr || []
    addressTree.value = result.dict.auth_address_tree || []
  } catch {
    syncProfileFromSession()
  } finally {
    loadingProfile.value = false
  }
}

function handleSexChange(event: PickerChangeEvent): void {
  const option = sexOptions.value[readPickerIndex(event)]
  if (option) {
    profileForm.sex = option.value
  }
}

function handleBirthdayChange(event: PickerChangeEvent): void {
  const value = event.detail.value
  if (typeof value === 'string') {
    profileForm.birthday = value
  }
}

function handleAddressChange(event: PickerChangeEvent): void {
  const option = addressPickerOptions.value[readPickerIndex(event)]
  if (option) {
    profileForm.address_id = option.value
  }
}

function clearBirthday(): void {
  profileForm.birthday = ''
}

function clearAddress(): void {
  profileForm.address_id = 0
}

async function handleSaveProfile(): Promise<void> {
  if (!profileForm.nickname.trim()) {
    uni.showToast({ title: t('mine.nicknameRequired'), icon: 'none' })
    return
  }

  savingProfile.value = true
  try {
    const result = await appProfileClient.updateProfile({
      nickname: profileForm.nickname.trim(),
      avatar: profileForm.avatar.trim(),
      sex: profileForm.sex,
      birthday: profileForm.birthday,
      address_id: profileForm.address_id,
      detail_address: profileForm.detail_address.trim(),
      bio: profileForm.bio.trim(),
    })
    authSession.updateUser(result.user)
    uni.showToast({ title: t('mine.saveSuccess'), icon: 'success' })
  } catch (error) {
    const message = error instanceof Error ? error.message : t('mine.saveFailed')
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    savingProfile.value = false
  }
}

function goBack(): void {
  uni.navigateBack()
}

onShow(async () => {
  const ok = await requireAuthenticatedPage()
  if (!ok) {
    return
  }
  syncProfileFromSession()
  await loadProfile()
})

function flattenAddressOptions(nodes: AppAddressOption[], parents: string[] = []): AddressPickerOption[] {
  return nodes.flatMap((node) => {
    const nextParents = [...parents, node.label]
    const current = node.value > 0
      ? [{ label: nextParents.join(' / '), value: node.value }]
      : []
    return [
      ...current,
      ...flattenAddressOptions(node.children || [], nextParents),
    ]
  })
}

function readPickerIndex(event: PickerChangeEvent): number {
  const value = Array.isArray(event.detail.value) ? event.detail.value[0] : event.detail.value
  const index = Number(value)
  return Number.isFinite(index) && index >= 0 ? index : 0
}
</script>

<template>
  <view class="profile-edit-page">
    <view class="page-topbar">
      <view class="back-button" @click="goBack">‹</view>
      <view class="page-heading">
        <text class="page-title">{{ t('mine.editProfile') }}</text>
        <text class="page-subtitle">{{ displayName }}</text>
      </view>
    </view>

    <view class="profile-edit-card surface-card profile-form-surface">
      <view class="section-head">
        <text class="section-title">{{ t('mine.profileBasics') }}</text>
        <text class="section-desc">{{ t('mine.editProfileDesc') }}</text>
      </view>

      <AppMediaUploader
        v-model="profileForm.avatar"
        folder="avatars"
        media-kind="image"
        :source-types="['album', 'camera']"
        :title="t('mine.avatarUpload')"
        :hint="t('mine.avatarUploadHint')"
      />

      <view class="field-grid">
        <view class="field">
          <text class="field-label">{{ t('mine.nickname') }}</text>
          <input
            v-model="profileForm.nickname"
            class="field-input"
            :placeholder="t('mine.nicknamePlaceholder')"
            placeholder-class="field-placeholder"
          />
        </view>

        <view class="field">
          <text class="field-label">{{ t('mine.sex') }}</text>
          <picker
            mode="selector"
            :range="sexOptions"
            range-key="label"
            :value="sexPickerIndex"
            :disabled="!sexOptions.length"
            @change="handleSexChange"
          >
            <view class="picker-field" :class="{ muted: !sexOptions.length }">
              <text>{{ sexLabel }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="field">
          <view class="field-label-row">
            <text class="field-label">{{ t('mine.birthday') }}</text>
            <text v-if="profileForm.birthday" class="field-clear" @click.stop="clearBirthday">{{ t('mine.clear') }}</text>
          </view>
          <picker
            mode="date"
            start="1900-01-01"
            end="2099-12-31"
            :value="profileForm.birthday || '2000-01-01'"
            @change="handleBirthdayChange"
          >
            <view class="picker-field">
              <text>{{ birthdayLabel }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="field">
          <view class="field-label-row">
            <text class="field-label">{{ t('mine.address') }}</text>
            <text v-if="profileForm.address_id" class="field-clear" @click.stop="clearAddress">{{ t('mine.clear') }}</text>
          </view>
          <picker
            mode="selector"
            :range="addressPickerOptions"
            range-key="label"
            :value="addressPickerIndex"
            :disabled="!addressPickerOptions.length"
            @change="handleAddressChange"
          >
            <view class="picker-field" :class="{ muted: !addressPickerOptions.length }">
              <text>{{ addressPickerOptions.length ? addressLabel : t('mine.addressPlaceholder') }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="field field--full">
          <text class="field-label">{{ t('mine.detailAddress') }}</text>
          <input
            v-model="profileForm.detail_address"
            class="field-input"
            :placeholder="t('mine.detailAddressPlaceholder')"
            placeholder-class="field-placeholder"
          />
        </view>

        <view class="field field--full">
          <text class="field-label">{{ t('mine.bio') }}</text>
          <textarea
            v-model="profileForm.bio"
            class="field-textarea"
            :placeholder="t('mine.bioPlaceholder')"
            placeholder-class="field-placeholder"
            auto-height
          />
        </view>
      </view>

      <view class="contact-strip">
        <view class="contact-item">
          <text class="contact-label">{{ t('mine.email') }}</text>
          <text class="contact-value">{{ profileForm.email || t('mine.notSet') }}</text>
        </view>
        <view class="contact-item">
          <text class="contact-label">{{ t('mine.phone') }}</text>
          <text class="contact-value">{{ profileForm.phone || t('mine.notSet') }}</text>
        </view>
      </view>

      <u-button
        :text="loadingProfile ? t('common.loading') : t('mine.saveProfile')"
        :loading="savingProfile || loadingProfile"
        shape="circle"
        :custom-style="{
          height: '96rpx',
          marginTop: '30rpx',
          border: '0',
          borderRadius: '28rpx',
          color: '#ffffff',
          fontWeight: '900',
          fontSize: '30rpx',
          background: 'linear-gradient(135deg, #2563eb 0%, #4f8cff 100%)',
          boxShadow: '0 18rpx 40rpx rgba(37, 99, 235, 0.22)',
        }"
        @click="handleSaveProfile"
      />
    </view>
  </view>
</template>

<style scoped>
.profile-edit-page {
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
.field-label,
.contact-label,
.contact-value {
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

.profile-edit-card {
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.section-head {
  margin-bottom: 22rpx;
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

.field-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-label {
  color: var(--app-text);
  font-size: 24rpx;
  font-weight: 850;
}

.field-clear {
  color: var(--app-primary);
  font-size: 23rpx;
  font-weight: 800;
}

.field-input,
.field-textarea,
.picker-field {
  width: 100%;
  min-height: 90rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 24rpx;
  background: var(--app-input-bg);
  color: var(--app-text);
  font-size: 28rpx;
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.34);
}

.field-textarea {
  min-height: 160rpx;
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  line-height: 1.55;
}

.picker-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.picker-field.muted {
  color: var(--app-text-faint);
}

.picker-arrow {
  color: var(--app-text-muted);
  font-size: 36rpx;
  font-weight: 300;
}

.field-placeholder {
  color: var(--app-text-faint);
}

.contact-strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14rpx;
  margin-top: 24rpx;
  padding: 18rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 26rpx;
  background: var(--app-card-soft-bg);
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.contact-label {
  color: var(--app-text-muted);
  font-size: 23rpx;
  font-weight: 800;
}

.contact-value {
  max-width: 440rpx;
  color: var(--app-text);
  font-size: 25rpx;
  font-weight: 700;
  text-align: right;
  word-break: break-all;
}
</style>
