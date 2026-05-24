<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { uploadAppFileToCloud } from '@/lib/appUploadRuntime'

interface UniChosenFile {
  path?: string
  name?: string
  size?: number
}

const props = withDefaults(defineProps<{
  modelValue: string
}>(), {
  modelValue: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', value: string): void
}>()

const { t } = useI18n()
const uploading = ref(false)

const avatarUrl = computed(() => props.modelValue.trim())

async function chooseAvatar(): Promise<void> {
  if (uploading.value) {
    return
  }

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (result) => {
      const tempFiles = result.tempFiles
      const file = (Array.isArray(tempFiles) ? tempFiles[0] : tempFiles) as UniChosenFile | Blob | undefined
      const tempPath = result.tempFilePaths[0]
      if (!tempPath) {
        return
      }

      uploading.value = true
      try {
        const uploaded = await uploadAppFileToCloud({
          path: tempPath,
          name: resolveFileName(file, tempPath),
          size: resolveFileSize(file),
          body: resolveBlobBody(file),
        }, {
          folder: 'avatars',
          fileKind: 'image',
        })
        emit('update:modelValue', uploaded.url)
        emit('uploaded', uploaded.url)
        uni.showToast({ title: t('mine.avatarUploadSuccess'), icon: 'success' })
      } catch (error) {
        const message = error instanceof Error && error.message
          ? error.message
          : t('mine.avatarUploadFailed')
        uni.showToast({ title: message, icon: 'none' })
      } finally {
        uploading.value = false
      }
    },
  })
}

function resolveFileName(file: UniChosenFile | Blob | undefined, path: string): string {
  if (file && 'name' in file && typeof file.name === 'string' && file.name.trim()) {
    return file.name
  }
  const cleanPath = path.split('?')[0]
  const fromPath = cleanPath.split('/').pop()
  return fromPath && fromPath.includes('.') ? fromPath : 'avatar.png'
}

function resolveFileSize(file: UniChosenFile | Blob | undefined): number | undefined {
  if (file && 'size' in file && typeof file.size === 'number') {
    return file.size
  }
  return undefined
}

function resolveBlobBody(file: UniChosenFile | Blob | undefined): Blob | undefined {
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return file
  }
  return undefined
}
</script>

<template>
  <view class="avatar-uploader" @click="chooseAvatar">
    <view class="avatar-uploader__preview">
      <image v-if="avatarUrl" class="avatar-uploader__image" :src="avatarUrl" mode="aspectFill" />
      <text v-else class="avatar-uploader__plus">+</text>
    </view>
    <view class="avatar-uploader__copy">
      <text class="avatar-uploader__title">{{ t('mine.avatarUpload') }}</text>
      <text class="avatar-uploader__hint">
        {{ uploading ? t('mine.uploadingAvatar') : t('mine.avatarUploadHint') }}
      </text>
    </view>
  </view>
</template>

<style scoped>
.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 22rpx;
  border: 1rpx solid var(--app-line);
  border-radius: 28rpx;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.06), transparent 56%),
    var(--app-card-soft-bg);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.28);
}

.avatar-uploader__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #4f8cff 0%, #67e8c6 100%);
  box-shadow: 0 14rpx 34rpx rgba(64, 117, 255, 0.18);
}

.avatar-uploader__image {
  width: 112rpx;
  height: 112rpx;
}

.avatar-uploader__plus {
  color: #fff;
  font-size: 54rpx;
  font-weight: 900;
}

.avatar-uploader__copy {
  flex: 1;
}

.avatar-uploader__title,
.avatar-uploader__hint {
  display: block;
}

.avatar-uploader__title {
  color: var(--app-text);
  font-size: 28rpx;
  font-weight: 900;
}

.avatar-uploader__hint {
  margin-top: 8rpx;
  color: var(--app-text-muted);
  font-size: 23rpx;
  line-height: 1.45;
}
</style>
