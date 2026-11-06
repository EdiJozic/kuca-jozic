import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/novasol-availability": {
        target: "https://www.novasol.hr",
        changeOrigin: true,
        rewrite: () => "/novasol/getAvailability?propertyId=CCC667&from=&to=",
      },
    },
  },
})
