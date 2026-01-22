/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
