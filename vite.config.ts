import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    middlewareMode: true,
  },
  ssr: {
    external: ['react', 'react-dom'],
    noExternal: ['@tanstack/react-start', '@tanstack/start-storage-context'],
  },
  build: {
    rollupOptions: {
      external: ['node:async_hooks'],
    },
  },
})
