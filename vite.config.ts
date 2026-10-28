import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { port: 5176 },
  preview: { port: 5176 },
  test: {
    environment: "node",
  },
});
