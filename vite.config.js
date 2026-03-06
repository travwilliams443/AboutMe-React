import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    __VERSION__: JSON.stringify("0.16.34")
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        __VERSION__: JSON.stringify("0.16.34")
      }
    }
  }
});
