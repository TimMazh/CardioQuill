
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 8080,
    proxy: {
      // Nur API-Anfragen an den Backend-Server leiten, nicht Frontend-Routen
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      },
      // Weitere API-Endpunkte explizit angeben
      '^/status': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '^/start': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '^/query': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '^/process-pdf': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
      // Frontend-Routen werden nicht an den Backend-Server weitergeleitet
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['ssh2', 'cpu-features']
  },
  build: {
    rollupOptions: {
      external: ['ssh2', 'crypto', 'cpu-features'],
    },
  },
}));
