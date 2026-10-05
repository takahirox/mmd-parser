// Test a real installation, outside this repository's source and node_modules.
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var root = path.resolve(__dirname, '..');
var temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mmd-parser-consumer-'));

function npm(args, cwd) {
  return execFileSync(process.execPath, [process.env.npm_execpath].concat(args), {
    cwd: cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit']
  });
}

try {
  var tarball;
  if (process.argv[2]) {
    tarball = path.resolve(process.argv[2]);
  } else {
    var packed = JSON.parse(npm(['pack', '--json', '--pack-destination', temporary], root));
    tarball = path.join(temporary, packed[0].filename);
  }
  var consumer = path.join(temporary, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'mmd-parser-package-check', version: '0.0.0', private: true
  }));
  console.log(npm(['install', '--ignore-scripts', '--no-package-lock', '--no-audit',
    '--no-fund', tarball], consumer).trim());

  var installed = path.join(consumer, 'node_modules', 'mmd-parser');
  var pkg = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.name, 'mmd-parser');
  assert.strictEqual(pkg.version, '1.1.0');
  assert.strictEqual(pkg.main, 'build/mmdparser.js');
  assert.strictEqual(pkg['jsnext:main'], 'build/mmdparser.module.js');
  assert.strictEqual(pkg.types, 'build/types/index.d.ts');

  var files = [];
  function inspect(directory, prefix) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(function(entry) {
      var relative = prefix + entry.name;
      var absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(absolute, relative + '/');
      else {
        assert(entry.isFile(), 'Unexpected non-file: ' + relative);
        assert(fs.statSync(absolute).size > 0, 'Empty file: ' + relative);
        files.push(relative);
      }
    });
  }
  inspect(installed, '');
  var required = [
    'package.json', 'LICENSE', 'Readme.md',
    'build/mmdparser.js', 'build/mmdparser.min.js', 'build/mmdparser.module.js',
    'build/types/index.d.ts', 'build/types/src/Parser.d.ts',
    'build/types/src/Types.d.ts', 'build/types/src/CharsetEncoder.d.ts',
    'build/types/src/charset-encoder-js.d.ts', 'build/types/src/DataViewEx.d.ts',
    'build/types/src/DataCreationHelper.d.ts'
  ];
  required.forEach(function(file) {
    assert(files.includes(file), 'Missing package file: ' + file);
  });
  files.forEach(function(file) {
    assert(required.includes(file), 'Unexpected package file: ' + file);
  });
  console.log('Package contents (' + files.length + ' files):\n' + files.sort().join('\n'));

  ['consumer.js', 'consumer.ts', 'fixtures.js'].forEach(function(file) {
    fs.copyFileSync(path.join(root, 'test', file), path.join(consumer, file));
  });
  execFileSync(process.execPath, ['consumer.js'], { cwd: consumer, stdio: 'inherit' });
  execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'),
    '--strict', '--noUncheckedIndexedAccess', '--noEmit', '--target', 'es2015',
    '--module', 'commonjs', '--moduleResolution', 'node', 'consumer.ts'], {
    cwd: consumer, stdio: 'inherit'
  });
  console.log('Packed package: CommonJS runtime and strict TypeScript consumer checks passed');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
