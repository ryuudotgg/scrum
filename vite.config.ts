import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  build: { target: "es2022" },
  worker: { format: "es" },
  optimizeDeps: { exclude: ["@electric-sql/pglite"] },
  ssr: { noExternal: command === "build" ? true : undefined },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
