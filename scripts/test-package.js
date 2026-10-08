// Test a real installation, outside this repository's source and node_modules.
var assert = require('assert');
var fs = require('fs');
var os = require('os');
var path = require('path');
var execFileSync = require('child_process').execFileSync;
var root = path.resolve(__dirname, '..');
var sourcePackage = require('../package.json');
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
    // Validate the completed build without re-entering package lifecycle hooks.
    // prepublishOnly builds before this check; standalone callers must build first.
    // Override inherited publish --dry-run so the local consumer is really tested.
    var packed = JSON.parse(npm(['pack', '--ignore-scripts', '--dry-run=false', '--json', '--pack-destination', temporary], root));
    tarball = path.join(temporary, packed[0].filename);
  }
  var consumer = path.join(temporary, 'consumer');
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'mmd-parser-package-check', version: '0.0.0', private: true
  }));
  console.log(npm(['install', '--ignore-scripts', '--dry-run=false', '--no-package-lock', '--no-audit',
    '--no-fund', tarball], consumer).trim());

  var installed = path.join(consumer, 'node_modules', 'mmd-parser');
  var pkg = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.name, 'mmd-parser');
  assert.strictEqual(pkg.version, sourcePackage.version);
  assert.strictEqual(pkg.main, 'build/mmdparser.js');
  assert.strictEqual(pkg['jsnext:main'], 'build/mmdparser.module.js');
  assert.strictEqual(pkg.types, 'build/types/index.d.ts');
  assert.deepStrictEqual(pkg.exports['.'], {
    import: { types: './build/types/index.d.mts', default: './build/mmdparser.module.mjs' },
    require: { types: './build/types/index.d.ts', default: './build/mmdparser.js' },
    default: './build/mmdparser.js'
  });
  ['mmdparser.js', 'mmdparser.min.js', 'mmdparser.module.js', 'mmdparser.module.mjs'].forEach(function(file) {
    assert.strictEqual(pkg.exports['./build/' + file], './build/' + file);
  });

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
    'build/mmdparser.module.mjs',
    'build/types/index.d.ts', 'build/types/index.d.mts', 'build/types/src/Parser.d.ts',
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

  ['consumer.js', 'consumer.mjs', 'consumer.ts', 'consumer-pmx.js', 'pmx-sdef.js', 'pmx-bone-morph.js', 'fixtures.js'].forEach(function(file) {
    fs.copyFileSync(path.join(root, 'test', file), path.join(consumer, file));
  });
  execFileSync(process.execPath, ['consumer.js'], { cwd: consumer, stdio: 'inherit' });
  execFileSync(process.execPath, ['consumer.mjs'], { cwd: consumer, stdio: 'inherit' });

  // The same type contracts must work with legacy and conditional resolution,
  // including both Node module formats and modern browser bundlers.
  ['consumer.cts', 'consumer.mts'].forEach(function(file) {
    fs.copyFileSync(path.join(consumer, 'consumer.ts'), path.join(consumer, file));
  });
  [
    ['--module', 'commonjs', '--moduleResolution', 'node', 'consumer.ts'],
    ['--module', 'node16', '--moduleResolution', 'node16', 'consumer.cts', 'consumer.mts'],
    ['--module', 'nodenext', '--moduleResolution', 'nodenext', 'consumer.cts', 'consumer.mts'],
    ['--module', 'esnext', '--moduleResolution', 'bundler', '--verbatimModuleSyntax', 'consumer.mts']
  ].forEach(function(options) {
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'),
      '--strict', '--noUncheckedIndexedAccess', '--noEmit', '--target', 'es2015'
    ].concat(options), { cwd: consumer, stdio: 'inherit' });
  });
  console.log('Packed package: CommonJS, native ESM, and strict TypeScript (node, node16, nodenext, bundler) checks passed');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
