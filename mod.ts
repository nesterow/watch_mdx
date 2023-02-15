import { compile as compiler } from "./deps.ts";

type PathLike = string | URL;
type GlobLike = RegExp;

interface CompileOptions {
  compile: typeof compiler;
  source: {
    value: string;
    path: PathLike;
  };
  output: PathLike;
}

interface CompileResult {
  value: string;
  output: PathLike;
}

interface WatcherOptions {
  dir: string;
  pattern: GlobLike;
  compile: CompilerCallback;
  formatOutput: (input: string) => string;
}

type CompilerCallback = (options: CompileOptions) => Promise<CompileResult>;
/**
 * Default compiler for MDX
 */
export async function compile$(
  { compile, source, output }: CompileOptions,
): Promise<CompileResult> {
  return {
    value: (await compile(source.value)).value,
    output: output,
  };
}

/**
 * Default formatter for output path.
 * Replace the extension to .jsx
 * @param input
 * @returns
 */
function formatMdxOutput(input: string): string {
  return input.replace(/\.[^/.]+$/, ".jsx");
}

export const defaultMdxWatcherOptions: WatcherOptions = {
  dir: Deno.cwd(),
  pattern: /\.mdx$/,
  compile: compile$,
  formatOutput: formatMdxOutput,
};
export async function watchMdx(
  options: Partial<WatcherOptions> = defaultMdxWatcherOptions,
) {
  options = { ...defaultMdxWatcherOptions, ...options };

  const { dir, pattern, compile, formatOutput } = options as WatcherOptions;
  const watcher = Deno.watchFs(dir, { recursive: true });

  for await (const event of watcher) {
    if (event.kind === "access") continue;
    for (const path of event.paths) {
      if (!path.match(pattern)) continue;
      if (event.kind === "remove") {
        const output = formatOutput(path);
        console.log(`%cRemoving ${output}`, "color: yellow");
        await Deno.remove(output);
        continue;
      }
      if (event.kind === "create" || event.kind === "modify") {
        const output = formatOutput(path);
        console.log(`%cCompiling ${path} to ${output}`, "color: green");
        const result = await compile({
          compile: compiler,
          source: {
            value: await Deno.readTextFile(path),
            path,
          },
          output,
        });
        await Deno.writeTextFile(result.output, result.value);
      }
    }
  }
}
