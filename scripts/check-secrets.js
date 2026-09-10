import fs from 'node:fs';
import path from 'node:path';
const excluded = new Set(['node_modules','.git','dist']);
const patterns = [/\b(?:sk|rk)_(?:live|test)_[a-zA-Z0-9]{16,}/, /\bwhsec_[a-zA-Z0-9]{16,}/, /-----BEGIN (?:RSA )?PRIVATE KEY-----/];
let failed = false;
function scan(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if(excluded.has(entry.name)) continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) scan(file);
    else if(/\.(?:js|jsx|json|md|yml|yaml|rules)$/.test(entry.name) || entry.name.startsWith('.env')) {
      if(patterns.some(pattern=>pattern.test(fs.readFileSync(file,'utf8')))) { console.error(`Possible credential in ${file}. Remove it and rotate it; values are never printed.`); failed=true; }
    }
  }
}
scan(process.cwd());
if(failed) process.exitCode=1;
else console.log('No matching credentials found in the working tree. Git history is not checked.');
