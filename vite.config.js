import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the research catalogue and long-lived vendor dependencies in
    // cacheable chunks so catalogue edits do not invalidate the app shell.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase") || id.includes("@firebase")) return "firebase";
            if (id.includes("react") || id.includes("scheduler")) return "react";
            if (id.includes("@vercel")) return "analytics";
            return "vendor";
          }
          if (id.endsWith("/src/data.js") || id.endsWith("\\src\\data.js")) return "compound-data";
          if (id.endsWith("/src/scientific-sources.js") || id.endsWith("\\src\\scientific-sources.js")) {
            return "scientific-sources";
          }
        },
      },
    },
  },
});

