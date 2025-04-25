import type { Config, UpdateProfileSchema, User } from "~/types"
import { apiBaseUrl } from "~/const"
import { encrypt, decrypt } from "src/utils/encryption"
import { api } from "src/composables/useApi"

export const useAuthStore = defineStore("auth", () => {


  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  const config = ref<Config>({
    plans: [],
  })

  const isAuthenticated = computed(() => !!token.value)


  const getUser = async () => {
    const res: any = await api.get(
      `user`,
    );
    if (res.success) {
      user.value = res.user as User;
    }
  };

  const getConfig = async () => {
    const res: any = await api.get(`library/config`)
    if (res.success) {
      config.value = res as Config
    }
  }

  const logout = async (signout: boolean = true) => {
    if (token.value && signout) {
      api.get(`signout`);
    }
    token.value = null
    user.value = null
    chrome.storage.local.clear()
  }

  const login = async () => {
    const raw = await chrome.storage.local.get(['token', 'user'])
    token.value = decrypt(raw['token'], false) as string
    user.value = decrypt(raw['user'], true) as User
  }

  return {
    token,
    user,
    config,
    isAuthenticated,
    logout,
    login,
    getConfig,
    getUser
  }
})
