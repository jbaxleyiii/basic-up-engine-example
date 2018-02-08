import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
// import uglify from "rollup-plugin-uglify";
import json from "rollup-plugin-json";

export default {
  input: "src/server.js",
  output: {
    file: "app.js",
    format: "cjs",
    sourcemap: false,
  },
  plugins: [
    json(),
    resolve({ preferBuiltins: true }),
    commonjs({
      include: "node_modules/**",
      namedExports: {
        "node_modules/graphql-tools/dist/index.js": ["makeExecutableSchema"],
      },
    }),
    // process.env.NODE_ENV === "production" && uglify(),
  ],
};
