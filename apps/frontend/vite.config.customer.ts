
import { mergeConfig, defineConfig } from "vite";
import baseConfig from "./vite.config.base";

import path from "path";

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: path.resolve(__dirname, "apps/customer"),
    server: { port: 3000 },
   
    build: {
      outDir: path.resolve(__dirname, "dist/customer"),
      rollupOptions: {
        input: path.resolve(__dirname, "apps/customer/index.html"),
      },
    },
  })
);
