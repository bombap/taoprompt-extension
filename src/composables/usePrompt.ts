import { apiBaseUrl } from "@/const";
import { CreatePromptSchema } from "@/types";

async function createPrompt (data: CreatePromptSchema, token: string) {
    const response = await fetch(
      `${apiBaseUrl}/prompt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    )

    return response;
};
export {
    createPrompt
}