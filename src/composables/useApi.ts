import { apiBaseUrl } from "~/const"

class Api {
  constructor() {}

  private sendErrorContentScript(error: string) {
    sendToAllTabs({
      type: "TAOPROMPT_ERROR",
      data: error,
      code: 401
    })
  }

  private getHeaders() {
    const auth = useAuthStore()
    if (!auth.token) {
      return {} as HeadersInit
    }
    return {
      Authorization: `Bearer ${auth.token}`,
    } as HeadersInit
  }

  private errorHandle(error: any) {
    const auth = useAuthStore()
    const toast = useToast()

    if (error.status === 401) {
      auth.logout()
      const errorObj: Partial<Toast> = {
        title: "Unauthorized",
        description: "Please login to continue",
        color: "error",
      }

      this.sendErrorContentScript(errorObj.description?.toString() || '')

      toast.add({
       ...errorObj
      })
    }
  }

  async get(url: string, options?: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/${url}`, {
        headers: this.getHeaders(),
        ...options,
      })
      this.errorHandle(response)

      return await response.json()
    } catch (error: any) {
      console.log("error", error)
      this.errorHandle(error)
    }
  }

  async post(url: string, body: any, options?: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/${url}`, {
        method: "POST",
        body,
        headers: this.getHeaders(),
        ...options,
      })
      this.errorHandle(response)
      return await response.json()
    } catch (error: any) {
      this.errorHandle(error)
    }
  }

  async put(url: string, body: any, options?: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/${url}`, {
        method: "PUT",
        body,
        headers: this.getHeaders(),
        ...options,
      })
      this.errorHandle(response)
      return await response.json()
    } catch (error: any) {
      this.errorHandle(error)
    }
  }

  async delete(url: string, options?: any) {
    try {
      const response = await fetch(`${apiBaseUrl}/${url}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        ...options,
      })
      this.errorHandle(response)
      return await response.json()
    } catch (error: any) {
      this.errorHandle(error)
    }
  }
}

const api = new Api()

export { api }
