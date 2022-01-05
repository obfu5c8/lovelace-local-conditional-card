import typescript from "@rollup/plugin-typescript";
import filesize from "rollup-plugin-filesize";
import { uglify } from "rollup-plugin-uglify";

export default {
  input: "src/main.ts",
  output: [
    {
      file: "dist/main.js",
      format: "esm",
    },
  ],

  plugins: [typescript(), uglify(), filesize()],
};
