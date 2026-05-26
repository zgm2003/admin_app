<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'

import { preferences } from '@/hooks/usePreferences'
import { session } from '@/hooks/useSession'

onLaunch(() => {
  preferences.hydrate()
  void session.hydrate()
})
</script>

<style>
:root,
.theme-light {
  --app-bg: #f6f8fc;
  --app-card-bg: #ffffff;
  --app-card-soft-bg: rgba(255, 255, 255, 0.82);
  --app-input-bg: #f8fbff;
  --app-input-strong-bg: #ffffff;
  --app-text: #0f172a;
  --app-text-muted: #64748b;
  --app-text-faint: #94a3b8;
  --app-line: rgba(15, 23, 42, 0.08);
  --app-primary: #2563eb;
  --app-primary-strong: #1d4ed8;
  --app-primary-soft: rgba(37, 99, 235, 0.12);
  --app-success: #16a085;
  --app-danger: #b42318;
  --app-danger-soft: rgba(255, 91, 91, 0.08);
  --app-shadow: 0 24rpx 70rpx rgba(37, 67, 134, 0.12);
}

.theme-dark {
  --app-bg: #07111d;
  --app-card-bg: #101b2b;
  --app-card-soft-bg: rgba(18, 31, 49, 0.86);
  --app-input-bg: #0b1727;
  --app-input-strong-bg: #121f31;
  --app-text: #eef6ff;
  --app-text-muted: #91a7c1;
  --app-text-faint: #66809d;
  --app-line: rgba(148, 163, 184, 0.16);
  --app-primary: #57d2ff;
  --app-primary-strong: #8de4ff;
  --app-primary-soft: rgba(87, 210, 255, 0.16);
  --app-success: #67e8c6;
  --app-danger: #ff9b9b;
  --app-danger-soft: rgba(255, 91, 91, 0.12);
  --app-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.2);
}

page {
  background: var(--app-bg);
  color: var(--app-text);
  font-family:
    'PingFang SC',
    'Hiragino Sans GB',
    'Microsoft YaHei',
    sans-serif;
}

view,
text,
input,
textarea,
button {
  box-sizing: border-box;
}
</style>
