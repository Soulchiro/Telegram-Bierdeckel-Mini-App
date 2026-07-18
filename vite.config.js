import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Telegram Mini Apps must be served over HTTPS. In production you'll deploy
// the built `dist/` folder (e.g. to Vercel/Netlify/GitHub Pages/Cloudflare
// Pages) and point your BotFather "Web App URL" at that HTTPS address.
export default defineConfig({
  plugins: [react()],
  base: './', // relative asset paths so it works when embedded in Telegram's webview
  server: {
    host: true, // allows testing via ngrok/local network + Telegram desktop debug
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
