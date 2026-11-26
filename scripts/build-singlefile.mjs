import fs from 'node:fs';
import path from 'node:path';

const distHtmlPath = path.resolve('dist/index.html');
if (!fs.existsSync(distHtmlPath)) {
  throw new Error('dist/index.html not found. Run npm run build first.');
}

let html = fs.readFileSync(distHtmlPath, 'utf8');

// Inline CSS files
html = html.replace(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g, (_m, href) => {
  const rel = href.replace(/^\//, '');
  const cssPath = path.resolve('dist', rel);
  const css = fs.readFileSync(cssPath, 'utf8');
  return `<style>${css}</style>`;
});

// Remove modulepreload links
html = html.replace(/<link[^>]+rel="modulepreload"[^>]*>/g, '');

// Inline module JS files (remove src and crossorigin for file:// compatibility)
html = html.replace(/<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*><\/script>/g, (_m, src) => {
  const rel = src.replace(/^\//, '');
  const jsPath = path.resolve('dist', rel);
  const js = fs.readFileSync(jsPath, 'utf8');
  return `<script type="module">${js}</script>`;
});

const outArtifact = path.resolve(
  '.aistudio/artifacts/brain/4252ddf8-6b1c-4f91-a1f0-a47ce61bb70b/index.html',
);
fs.mkdirSync(path.dirname(outArtifact), { recursive: true });
fs.writeFileSync(outArtifact, html);

console.log(
  `Single-file HTML written to ${outArtifact} (${(html.length / 1024).toFixed(1)} KB)`,
);
