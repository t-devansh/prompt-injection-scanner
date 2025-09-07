import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      // custom function to skip .js files
      plugins: [
        {
          postcssPlugin: "skip-js",
          Once(root, { result }) {
            if (result.opts.from && result.opts.from.endsWith(".js")) {
              // cancel parsing this file
              root.removeAll();
            }
          },
        },
      ],
    },
  },
});
