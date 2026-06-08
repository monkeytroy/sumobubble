// Copies TinyMCE's static assets from node_modules into public/tinymce
// so they're served at /tinymce/* and the <Editor tinymceScriptSrc>
// in src/components/console/sections/config-summary.tsx can find them.
// Wired via the "postinstall" script in package.json.

const fs = require('node:fs');
const path = require('path');

const src = path.join(__dirname, 'node_modules', 'tinymce');
const dest = path.join(__dirname, 'public', 'tinymce');

if (!fs.existsSync(src)) {
  // tinymce hasn't been hoisted into the workspace yet (postinstall can
  // run before sibling deps materialize in some pnpm scenarios). Skip
  // silently — a re-run will pick it up.
  process.exit(0);
}

// Resolve the symlink chain — pnpm's node_modules/tinymce is a symlink
// into .pnpm/, and fs.cpSync trips on the realpath self-detection.
const realSrc = fs.realpathSync(src);

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(realSrc, dest, { recursive: true });
console.log(`postinstall: copied ${realSrc} -> ${dest}`);
