import { mergeConfig, defineConfig } from "vite";
import baseConfig from "./vite.config.base";
import path from "path";

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: path.resolve(__dirname, "apps/vendor"),
    server: {
      port: 4000,
    },
      // cacheDir: '.vite-vendor',
       envDir: path.resolve(__dirname),
    build: {
         outDir: path.resolve(__dirname, "dist/vendor"),
      rollupOptions: {
     
          input: path.resolve(__dirname, "apps/vendor/index.html"),
     
      },
    },
  })
);
