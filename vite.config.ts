import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  build: {
    // Separa bibliotecas grandes em chunks dedicados para melhorar cache e reduzir o chunk inicial.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router-dom")) return "router-vendor";
          if (id.includes("axios")) return "http-vendor";
          if (id.includes("lucide-react")) return "icons-vendor";
          if (id.includes("react") || id.includes("scheduler")) return "react-vendor";
        }
      }
    },
    // Mantém alerta para chunks realmente grandes, mas evita falso positivo no limite padrão.
    chunkSizeWarningLimit: 700
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy para a API do backend Django
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src"
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/**/*_old.{ts,tsx}"
      ]
    }
  }
});
