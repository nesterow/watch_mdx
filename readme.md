# Watch MDX

Compile MDX to JSX on fly..

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

### watchMdx(options: WatcherOptions) - Watcher

Watch directory for changes and compile mdx files.

### copileMdx(options: WatcherOptions) - Compiler

Collect all mdx files and compile them.

### WatcherOptions

```typescript
interface WatcherOptions {
  dir: string; // default: cwd
  pattern: RegExp; // default: /\.mdx$/
  compile: CompilerCallback;
  onCompile: Callback;
  precompile: boolean; // compile all before init?
  denoFormat: boolean; // format output with deno fmt?
  formatOutput: (input: string) => string; // custom path/ext
}
```

## Example

[dev.ts](https://github.com/nesterow/tailored/blob/main/dev.ts)

## License

MIT
