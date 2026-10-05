var assert = require('assert');
var api = require('mmd-parser');
var fixtures = require('./fixtures');

assert(require.resolve('mmd-parser').endsWith(require('path').join('build', 'mmdparser.js')));
assert.deepStrictEqual(Object.keys(api).sort(), ['CharsetEncoder', 'MMDParser', 'Parser']);
assert.strictEqual(api.MMDParser.Parser, api.Parser);
assert.strictEqual(api.MMDParser.CharsetEncoder, api.CharsetEncoder);
assert.strictEqual(new api.CharsetEncoder().s2u(new Uint8Array([0x82, 0xa0])), 'あ');
var parser = new api.Parser();
assert.strictEqual(parser.parsePmd(fixtures.pmd(false)).metadata.format, 'pmd');
assert.strictEqual(parser.parsePmx(fixtures.pmx(1, 2)).metadata.format, 'pmx');
assert.strictEqual(parser.parseVmd(fixtures.vmd()).metadata.motionCount, 1);
assert.strictEqual(parser.parseVpd(fixtures.vpd).bones.length, 1);
console.log('CommonJS package root: runtime exports and PMD/PMX/VMD/VPD parsing passed');
