<script setup lang="ts">
import { computed } from 'vue'
import type { AppSlideCaptchaChallenge } from '@/types/auth'
import AppSlideCaptcha from './AppSlideCaptcha.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  challenge: AppSlideCaptchaChallenge | null
  sliderX: number
  loading: boolean
  verifying: boolean
  minMoveOffset?: number
}>(), {
  minMoveOffset: 16,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:sliderX', value: number): void
  (e: 'refresh'): void
  (e: 'complete'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const captchaX = computed({
  get: () => props.sliderX,
  set: (value: number) => emit('update:sliderX', value),
})

function closeVerifier() {
  if (props.verifying) return
  visible.value = false
}

function completeVerifier(value: number) {
  if (!props.challenge || props.loading || props.verifying) return
  if (value < props.challenge.tile_x + props.minMoveOffset) return
  emit('complete')
}
</script>

<template>
  <view
    v-if="visible"
    class="app-captcha-overlay"
    @click.self="closeVerifier"
  >
    <view class="app-captcha-overlay__panel">
      <AppSlideCaptcha
        v-model="captchaX"
        :challenge="challenge"
        :loading="loading"
        @refresh="$emit('refresh')"
        @close="closeVerifier"
        @complete="completeVerifier"
      />
    </view>
  </view>
</template>

<style scoped lang="scss">
.app-captcha-overlay {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.48);
}

.app-captcha-overlay__panel {
  max-width: 100%;
}
</style>
