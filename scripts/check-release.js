// This workflow is deliberately limited to the release requested in Issue #9.
var assert = require('assert');
var pkg = require('../package.json');

assert.strictEqual(pkg.name, 'mmd-parser');
assert.strictEqual(pkg.version, '1.1.0', 'Only mmd-parser@1.1.0 may be published');
assert.strictEqual(process.env.GITHUB_REF, 'refs/tags/v' + pkg.version,
  'The release tag must match package.json exactly');
console.log('Release tag and package version match: mmd-parser@' + pkg.version);
