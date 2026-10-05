// Bundle only after a successful TypeScript watch compilation.
var ts = require('typescript');
var spawnSync = require('child_process').spawnSync;
var path = require('path');
var host = ts.createWatchCompilerHost('tsconfig.json', {}, ts.sys,
  ts.createSemanticDiagnosticsBuilderProgram);
var emitAndReport = host.afterProgramCreate;
host.afterProgramCreate = function(builder) {
  emitAndReport(builder);
  if (ts.getPreEmitDiagnostics(builder.getProgram()).length !== 0) return;
  var bundle = spawnSync(process.execPath,
    [path.resolve('node_modules/rollup/bin/rollup'), '-c'], { stdio: 'inherit' });
  if (bundle.error) console.error(bundle.error);
  if (bundle.status === 0) {
    var declarations = spawnSync(process.execPath, ['scripts/copy-types.js'], { stdio: 'inherit' });
    if (declarations.error) console.error(declarations.error);
  }
};
var watcher = ts.createWatchProgram(host);
process.on('SIGINT', function() { watcher.close(); });
process.on('SIGTERM', function() { watcher.close(); });
