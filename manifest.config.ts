import { env } from "node:process"
import type { ManifestV3Export } from "@crxjs/vite-plugin"
import packageJson from "./package.json" with { type: "json" }

const { version, name, description, displayName } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/)

export default {
  author: {
    email: "kimduc10a@gmail.com",
  },
  name: env.mode === "staging" ? `[INTERNAL] ${name}` : displayName || name,
  description,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  // key: '',
  action: {
    default_popup: "src/ui/action-popup/index.html",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  content_scripts: [
    {
      all_frames: false,
      js: ["src/content-script/index.ts"],
      matches: [
        "https://*.chatgpt.com/*",
        "https://chatgpt.com/*",
        "https://claude.ai/*",
        "https://gemini.google.com/*",
        "https://chat.deepseek.com/*",
        "https://grok.com/*",
        "https://x.com/i/grok",
        "https://copilot.microsoft.com/*",
        // "http://localhost:3000/extension-chatbot",
      ],
      run_at: "document_start",
    },
    {
      all_frames: false,
      js: ["src/content-script-auth/index.ts"],
      matches: ["https://v2.taoprompt.com/*", "https://taoprompt.com/*"],
      run_at: "document_start",
    },
  ],
  options_page: "src/ui/options-page/index.html",
  offline_enabled: true,
  // host_permissions: [
  //   "https://*.chatgpt.com/*",
  //   "https://chatgpt.com/*",
  //   "https://claude.ai/*",
  //   "https://gemini.google.com/*",
  //   "https://chat.deepseek.com/*",
  //   "https://grok.com/*",
  //   "https://x.com/i/grok",
  //   "https://copilot.microsoft.com/*",
  //   "https://v2.taoprompt.com/*",
  //   "https://taoprompt.com/*",
  // ],
  permissions: ["background", "activeTab", "storage", "tabs"],
  web_accessible_resources: [
    {
      resources: ["src/ui/setup/index.html", "src/ui/action-popup/index.html"],
      matches: ["<all_urls>"],
    },
  ],
  // externally_connectable: {
  //   matches: ["http://localhost:3000/*"],
  // },
  content_security_policy: {
    extension_pages:
      "script-src 'self'; object-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  },
  icons: {
    16: "src/assets/logo.png",
    24: "src/assets/logo.png",
    32: "src/assets/logo.png",
    128: "src/assets/logo.png",
  },
} as ManifestV3Export
