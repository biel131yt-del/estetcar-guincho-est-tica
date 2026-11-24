import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  environments: {
    ssr: { build: { outDir: "dist/server", rollupOptions: { output: { entryFileNames: "index.js" } } } },
  },
  plugins: [cloudflare({ viteEnvironment: { name: "ssr" } }), tsconfigPaths(), tailwind(), tanstackStart({ server: { entry: "server" } }), react()],
});
