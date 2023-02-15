import * as mod from "../mod.ts";
const { test } = Deno;

test({
  name: "mod",
  fn: async () => {
    mod.watchMdx({
      compile: async ({ compile, source, output }) => {
        const result = await compile(source.value, {
          providerImportSource: "@mdx-js/preact",
          jsxImportSource: "preact",
          jsx: true,
        });
        return {
          value: result.value,
          output: output,
        };
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000 * 15));
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
