import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";
import { config } from "./src/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": "http://localhost:4000", // where server runs on
    },
    // "/api": {
    //   target: process.env.VITE_API_HOST,
    //   changeOrigin: true,
    //   rewrite: (path: string) => path.replace(/^\/api/, ""),
    // },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
