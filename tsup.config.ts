import {solidPlugin} from "esbuild-plugin-solid"
import {defineConfig} from "tsup"

export default defineConfig({
  clean: true,
  esbuildPlugins: [solidPlugin()],
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  target: "esnext",
  format: ["esm"],
  dts: true,
  sourcemap: true,
})
