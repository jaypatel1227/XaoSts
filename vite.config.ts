import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        tsDemo: "ts-demo.html"
      }
    }
  },
  server: {
    port: 5173
  }
});
