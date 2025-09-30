import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({ open: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
