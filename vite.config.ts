import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  // Use the provided key if no environment variable is found
  const apiKey = env.API_KEY || "AIzaSyAUNWhFJD_tNGFGCVDZVauyuchqNatzAPs";

  return {
    plugins: [react()],
    define: {
      // This replaces process.env.API_KEY in the source code with the actual string value during build
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
  }
})