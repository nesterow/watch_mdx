# Watch MDX

Compile MDX to JSX on fly.
By default, when a mdx file modified, the watcher creates a conterpart jsx file in the same location.

## Usage

```typescript
import { watchMdx } from "https://deno.land/x/watch_mdx/mod.ts";

watchMdx({
  compile: async ({ compile, source, output }) => {
    const result = await compile(source.value, {
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

Everything can be modified through options.

### watchMdx(options)

```typescript
interface WatcherOptions {
  dir: string; // default: cwd
  pattern: RegExp; // default: /\.mdx$/
  precompile: boolean; // compile all before init?
  compile: CompilerCallback;
  onCompile: Callback;
  formatOutput: (input: string) => string; // custom path/ext
}
```

## Example

[dev.ts](https://github.com/nesterow/tailored/blob/main/dev.ts)

## License

MIT
