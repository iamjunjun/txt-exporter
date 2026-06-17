import esbuild from 'esbuild';
import process from 'process';
import { execSync } from 'child_process';

// 自动部署目标：vault 的插件目录
const VAULT_PLUGIN_DIR = '/Users/linjun/Library/Mobile Documents/iCloud~md~obsidian/Documents/.obsidian/plugins/txt-exporter';

const prod = process.argv[2] === 'production';

const ctx = await esbuild.context({
  entryPoints: ['main.ts'],
  bundle: true,
  platform: 'node',
  external: [
    'obsidian',
    'electron',
    'fs',
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
  // 每次 build 成功后自动复制到 vault
  plugins: [{
    name: 'auto-deploy',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length === 0) {
          try {
            execSync(`cp main.js "${VAULT_PLUGIN_DIR}/main.js"`, { stdio: 'inherit' });
            console.log(`[auto-deploy] ✓ main.js → ${VAULT_PLUGIN_DIR}/main.js`);
          } catch (e) {
            console.error('[auto-deploy] ✗ 复制失败:', e.message);
          }
        }
      });
    },
  }],
});

if (prod) {
  await ctx.rebuild();
  process.exit(0);
} else {
  await ctx.watch();
  console.log(`\n[dev] 监听 main.ts，改完自动编译并部署到 vault`);
  console.log(`[dev] Obsidian 里 Cmd+R 重载插件即可看到新效果`);
}
