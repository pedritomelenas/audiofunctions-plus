import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    // Allow all hosts ending with ngrok-free.app
    allowedHosts: [
      'localhost',
      '.ngrok-free.app'
    ]
  }
})
