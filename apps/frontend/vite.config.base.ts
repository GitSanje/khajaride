import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@customer": path.resolve(__dirname, "apps/customer"),
      "@vendor": path.resolve(__dirname, "apps/vendor"),
      "@khajaride/openapi": path.resolve(
        __dirname,
        "../../packages/openapi/src"
      ),
      "@khajaride/zod": path.resolve(__dirname, "../../packages/zod/src"),
    },
  },
});
