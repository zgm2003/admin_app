<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

import { session } from '@/composables/useSession'

onLaunch(() => {
  void session.hydrate()
})
</script>

<style>
page {
  background:
    radial-gradient(circle at top, rgba(77, 166, 255, 0.18), transparent 34%),
    linear-gradient(180deg, #06111a 0%, #081722 52%, #09131d 100%);
  color: #eef6ff;
  font-family:
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
}

view,
text,
input {
  box-sizing: border-box;
}
</style>
