import { defineManifest } from "@crxjs/vite-plugin"
import ManifestConfig from "./manifest.config"

// @ts-expect-error ManifestConfig provides all required fields
export default defineManifest((env) => ({
  ...ManifestConfig,
  browser_specific_settings: {
    gecko: {
      id: "{a689535a-dca3-4370-b2f7-08ef0b3b86e9}",
    },
  },
  background: {
    scripts: ["src/background/index.ts"],
    type: "module",
    persistent: false,
  },
  permissions: [
    // @ts-expect-error background permission is not supported in Firefox
    ...ManifestConfig.permissions.filter(
      (permission) => permission !== "background",
    ),
  ],
  author: "kimduc10a@gmail.com",
}))
