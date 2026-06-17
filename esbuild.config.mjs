import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

const ctx = await esbuild.context({
  entryPoints: ['main.ts'],
  bundle: true,
  platform: 'node',                 // ← 关键：让 esbuild 认识 Node 内置模块
  external: [
    'obsidian',
    'electron',
    'fs',                            // ← 显式排除内置模块
    'path',
    '@codemirror/state',
    '@codemirror/view',
  ],
  format: 'cjs',
  target: 'es2020',
  sourcemap: prod ? false : 'inline',
  minify: prod,
  outfile: 'main.js',
  logLevel: 'info',
});

if (prod) {
  await ctx.rebuild();
  process.exit(0);
} else {
  await ctx.watch();
}
