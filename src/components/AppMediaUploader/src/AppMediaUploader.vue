<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { uploadAppFileToCloud } from '@/lib/appUploadRuntime'
import {
  ensureAppMediaPermission,
  type AppMediaKind,
  type AppMediaSource,
} from '@/lib/platform/appMediaPermission'

interface UUploadFile {
  url?: string
  thumb?: string
  name?: string
  size?: number
  type?: string
  file?: Blob
  status?: 'success' | 'uploading' | 'failed'
  message?: string
}

interface UUploadAfterReadEvent {
  file: UUploadFile | UUploadFile[]
}

interface UUploadDeleteEvent {
  index: number
}

interface UUploadInstance {
  chooseFile(params?: { capture?: AppMediaSource[] }): Promise<unknown>
}

const props = withDefaults(defineProps<{
  modelValue: string
  folder: string
  mediaKind?: AppMediaKind
  sourceTypes?: AppMediaSource[]
  title?: string
  hint?: string
  width?: number
  height?: number
  clearable?: boolean
  disabled?: boolean
}>(), {
  modelValue: '',
  mediaKind: 'image',
  sourceTypes: () => ['album', 'camera'] as AppMediaSource[],
  title: '',
  hint: '',
  width: 112,
  height: 112,
  clearable: true,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'uploaded', payload: { url: string; key: string }): void
  (e: 'cleared'): void
}>()

const { t } = useI18n()
const uploadRef = shallowRef<UUploadInstance | null>(null)
const fileList = ref<UUploadFile[]>([])
const uploading = shallowRef(false)
const pickerOpen = shallowRef(false)
const replacementBackup = shallowRef<UUploadFile[] | null>(null)

const accept = computed(() => props.mediaKind === 'video' ? 'video' : 'image')
const uploadTitle = computed(() => props.title || t('upload.mediaUpload'))
const uploadHint = computed(() => {
  if (uploading.value) return t('upload.uploading')
  return props.hint || t('upload.mediaUploadHint')
})
const hasFile = computed(() => fileList.value.length > 0)
const isUploadDisabled = computed(() => props.disabled || uploading.value)
const isTriggerDisabled = computed(() => props.disabled || uploading.value || pickerOpen.value)
const mediaBoxStyle = computed(() => ({
  width: `${props.width}rpx`,
  height: `${props.height}rpx`,
}))

watch(
  () => props.modelValue,
  (value) => {
    const url = value.trim()
    fileList.value = url
      ? [{ url, thumb: url, type: props.mediaKind, status: 'success' }]
      : []
  },
  { immediate: true },
)

async function handleChoose(): Promise<void> {
  if (isTriggerDisabled.value) return

  pickerOpen.value = true
  try {
    const source = await resolveSource()
    if (!source) return

    const allowed = await ensureAppMediaPermission(source, props.mediaKind)
    if (!allowed) {
      uni.showToast({ title: t('upload.permissionDenied'), icon: 'none' })
      return
    }

    if (hasFile.value) {
      replacementBackup.value = fileList.value.map((item) => ({ ...item }))
      fileList.value = []
      await nextTick()
    } else {
      replacementBackup.value = null
    }

    await uploadRef.value?.chooseFile({ capture: [source] })
  } finally {
    pickerOpen.value = false
    if (replacementBackup.value && !uploading.value) {
      fileList.value = replacementBackup.value
      replacementBackup.value = null
    }
  }
}

function resolveSource(): Promise<AppMediaSource | null> {
  if (props.sourceTypes.length <= 1) {
    return Promise.resolve(props.sourceTypes[0] || 'album')
  }

  return new Promise((resolve) => {
    uni.showActionSheet({
      itemList: props.sourceTypes.map((source) => source === 'camera' ? t('upload.chooseCamera') : t('upload.chooseAlbum')),
      success: (result) => resolve(props.sourceTypes[result.tapIndex] || null),
      fail: () => resolve(null),
    })
  })
}

async function handleAfterRead(event: UUploadAfterReadEvent): Promise<void> {
  const file = Array.isArray(event.file) ? event.file[0] : event.file
  const path = file.url || file.thumb || ''
  if (!path) return

  uploading.value = true
  fileList.value = [{ ...file, status: 'uploading', message: t('upload.uploading') }]

  try {
    const uploaded = await uploadAppFileToCloud({
      path,
      name: resolveFileName(file, path),
      size: file.size,
      body: file.file,
    }, {
      folder: props.folder,
      fileKind: props.mediaKind === 'image' ? 'image' : 'file',
    })

    fileList.value = [{ ...file, url: uploaded.url, thumb: uploaded.url, status: 'success', message: '' }]
    emit('update:modelValue', uploaded.url)
    emit('uploaded', { url: uploaded.url, key: uploaded.key })
    replacementBackup.value = null
    uni.showToast({ title: t('upload.uploadSuccess'), icon: 'success' })
  } catch (error) {
    const message = resolveUploadErrorMessage(error)
    if (replacementBackup.value) {
      fileList.value = replacementBackup.value
      replacementBackup.value = null
    } else {
      fileList.value = [{ ...file, status: 'failed', message }]
    }
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    uploading.value = false
  }
}

function handleDelete(event: UUploadDeleteEvent): void {
  fileList.value.splice(event.index, 1)
  emit('update:modelValue', '')
  emit('cleared')
}

function resolveFileName(file: UUploadFile, path: string): string {
  if (file.name?.trim()) return file.name
  const cleanPath = path.split('?')[0]
  const fromPath = cleanPath.split('/').pop()
  if (fromPath && fromPath.includes('.')) return fromPath
  return props.mediaKind === 'video' ? 'upload.mp4' : 'upload.png'
}

function resolveUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message && !error.message.startsWith('upload.')) {
    return error.message
  }
  return t('upload.uploadFailed')
}
</script>

<template>
  <view class="app-media-uploader">
    <view class="app-media-uploader__media" :style="mediaBoxStyle">
      <up-upload
        ref="uploadRef"
        :file-list="fileList"
        :accept="accept"
        :auto-upload="false"
        :max-count="1"
        :width="width"
        :height="height"
        :deletable="clearable"
        :disabled="isUploadDisabled"
        @after-read="handleAfterRead"
        @delete="handleDelete"
      />

      <view
        v-if="!hasFile && !pickerOpen"
        class="app-media-uploader__trigger"
        :class="{ 'is-disabled': isTriggerDisabled }"
        @tap.stop.prevent="handleChoose"
      >
        <text class="app-media-uploader__plus">+</text>
      </view>
    </view>

    <view class="app-media-uploader__copy">
      <text class="app-media-uploader__title">{{ uploadTitle }}</text>
      <text class="app-media-uploader__hint">{{ uploadHint }}</text>
      <view
        v-if="hasFile && !pickerOpen"
        class="app-media-uploader__action"
        :class="{ 'is-disabled': isTriggerDisabled }"
        @tap.stop.prevent="handleChoose"
      >
        <text class="app-media-uploader__action-text">{{ t('upload.replace') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.app-media-uploader {
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

.app-media-uploader__media {
  position: relative;
  flex: 0 0 auto;
}

.app-media-uploader__trigger {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #4f8cff 0%, #67e8c6 100%);
  box-shadow: 0 14rpx 34rpx rgba(64, 117, 255, 0.18);
}

.app-media-uploader__trigger.is-disabled {
  opacity: 0.58;
}

.app-media-uploader__plus {
  color: #fff;
  font-size: 54rpx;
  font-weight: 900;
}

.app-media-uploader__copy {
  flex: 1;
  min-width: 0;
}

.app-media-uploader__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-top: 18rpx;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(79, 140, 255, 0.12);
}

.app-media-uploader__action.is-disabled {
  opacity: 0.58;
}

.app-media-uploader__action-text {
  color: var(--app-primary);
  font-size: 24rpx;
  font-weight: 800;
}

.app-media-uploader__title,
.app-media-uploader__hint {
  display: block;
}

.app-media-uploader__title {
  color: var(--app-text);
  font-size: 28rpx;
  font-weight: 900;
}

.app-media-uploader__hint {
  margin-top: 8rpx;
  color: var(--app-text-muted);
  font-size: 23rpx;
  line-height: 1.45;
}
</style>
