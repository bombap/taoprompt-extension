import type { Config, UpdateProfileSchema, User } from "~/types"
import { apiBaseUrl } from "~/const"
import { encrypt, decrypt } from "src/utils/encryption"
import { api } from "src/composables/useApi"


const subscriptionType = {
  '507443': 'Basic',
  '525049': 'Pro',
}

export const useAuthStore = defineStore("auth", () => {


  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  const config = ref<Config>({
    plans: [],
    promptModels: {
      free: [],
      paid: [],
      default: ""
    }
  })

  const isAuthenticated = computed(() => !!token.value)

  const isFreePlan = computed(() => {
    if (!user.value) return true;
    return !user.value.subscriptionId;
  });

  const planName = computed(() => {
    if (!user.value) return "Free";
    if (!user.value.subscriptionId) return "Free";
    return subscriptionType[user.value.subscriptionId] || "Basic";
  });

  const isProPlan = computed(() => {
    return planName.value === "Pro";
  });


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
    getUser,
    isFreePlan,
    planName,
    isProPlan
  }
})
