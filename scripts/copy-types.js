// Preserve the source declaration layout so all exported type references resolve.
var fs = require('fs');
var path = require('path');
function copyDeclarations(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach(function(entry) {
    var sourcePath = path.join(source, entry.name);
    var destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDeclarations(sourcePath, destinationPath);
    else if (entry.name.endsWith('.d.ts')) fs.copyFileSync(sourcePath, destinationPath);
  });
}
copyDeclarations('.typescript-tmp/compiled', 'build/types');
// Give the native ESM entry an ESM declaration while sharing the public types.
fs.writeFileSync('build/types/index.d.mts', 'export * from "./index.js";\n');
fs.copyFileSync('src/charset-encoder-js.d.ts', 'build/types/src/charset-encoder-js.d.ts');
// Make the local dependency declaration available to package consumers.
fs.writeFileSync('build/types/src/CharsetEncoder.d.ts',
  '/// <reference path="./charset-encoder-js.d.ts" />\n' +
  fs.readFileSync('.typescript-tmp/compiled/src/CharsetEncoder.d.ts', 'utf8'));
