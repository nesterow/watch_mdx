# MDX Watcher

Compile MDX to `*.jsx` components on fly.

## Usage

```typescript
import { watchMdx } from "https://deno.land/x/mdx_watcher/mod.ts";

watchMdx({
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
```

## API

### watchMdx(options)

```typescript
interface WatcherOptions {
  dir: string;
  pattern: RegExp;
  compile: CompilerCallback;
  formatOutput: (input: string) => string;
}
```

## License

MIT
