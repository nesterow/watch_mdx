import { compile as compiler, join } from "./deps.ts";

type PathLike = string;
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
  denoFormat?: boolean;
  precompile?: boolean;
  onCompile?: (files: string[]) => Promise<void>;
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

/**
 * Collect files from a directory
 */
function collectFiles(
  dir: string,
  pattern: GlobLike,
  files: string[] = [],
): string[] {
  for (const entry of Deno.readDirSync(dir)) {
    if (entry.isDirectory && !entry.name.startsWith(".")) {
      collectFiles(join(dir, entry.name), pattern, files);
    } else if (entry.isFile && entry.name.match(pattern)) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

async function precompile(files: string[], compile: CompilerCallback) {
  console.log(`%cPrecompiling ${files.length} mdx files`, "color: green");
  const start = performance.now();
  const results: PathLike[] = [];
  for (const file of files) {
    const data = await compile({
      compile: compiler,
      source: {
        value: Deno.readTextFileSync(file),
        path: file,
      },
      output: formatMdxOutput(file),
    });
    Deno.writeTextFileSync(data.output, data.value);
    results.push(data.output);
  }
  const end = performance.now();
  console.log(
    `%cPrecompiled ${files.length} mdx files in ${(end - start).toFixed(3)}ms`,
    "color: green",
  );
  return results;
}

async function denoFmt(path: string) {
  const p = Deno.run({
    cmd: ["deno", "fmt", path],
  });
  await p.status();
  p.close();
}

export const defaultMdxWatcherOptions: WatcherOptions = {
  dir: Deno.cwd(),
  pattern: /\.mdx$/,
  compile: compile$,
  formatOutput: formatMdxOutput,
  denoFormat: true,
  precompile: true,
};

export async function watchMdx(
  options: Partial<WatcherOptions> = defaultMdxWatcherOptions,
) {
  options = { ...defaultMdxWatcherOptions, ...options };
  const { dir, pattern, compile, formatOutput, denoFormat, onCompile } =
    options as WatcherOptions;

  if (options.precompile) {
    const files = collectFiles(dir, pattern);
    const precompiled = await precompile(files, compile);
    if (denoFormat) {
      for (const file of precompiled) {
        await denoFmt(file);
      }
      await onCompile?.(precompiled);
    }
  }

  const watcher = Deno.watchFs(dir, { recursive: true });
  console.log(`%cStarted MDX watcher for ${Deno.cwd()}`, "color: green");

  for await (const event of watcher) {
    if (event.kind === "access") continue;
    for (const path of event.paths) {
      if (!path.match(pattern)) continue;
      try {
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
          if (denoFormat) {
            await denoFmt(result.output);
            await onCompile?.([result.output]);
          }
        }
      } catch (e) {
        if (e instanceof Deno.errors.NotFound) {
          console.log(`%cRemoving ${path}`, "color: yellow");
          await Deno.remove(formatMdxOutput(path)).catch(() => {});
        }
        continue;
      }
    }
  }
}
