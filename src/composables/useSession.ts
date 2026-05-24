import { appAuthClient } from '@/api/appAuth'
import { createSessionController } from '@/stores/session'
import { uniSessionStorage } from '@/utils/storage'

export const session = createSessionController({
  client: appAuthClient,
  storage: uniSessionStorage,
})

export function useSession() {
  return session
}
