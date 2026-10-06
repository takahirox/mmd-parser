var assert = require('assert');
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var fixtures = require('./fixtures');
var baseline = process.argv[2] ? require(path.resolve(process.argv[2])) : null;

function check(api, label) {
  assert.deepStrictEqual(Object.keys(api).sort(), ['CharsetEncoder', 'MMDParser', 'Parser']);
  assert.strictEqual(api.MMDParser.Parser, api.Parser);
  assert.strictEqual(api.MMDParser.CharsetEncoder, api.CharsetEncoder);
  assert.strictEqual(new api.CharsetEncoder().s2u(new Uint8Array([0x82, 0xa0])), 'あ');
  var parser = new api.Parser();
  function parse(method, input, right) {
    var result = parser[method](input, right);
    if (baseline) assert.deepStrictEqual(result, new baseline.Parser()[method](input, right));
    return result;
  }
  [false, true].forEach(function(english) {
    var model = parse('parsePmd', fixtures.pmd(english));
    assert.strictEqual(model.metadata.vertexCount, 3);
    assert.deepStrictEqual(model.vertices[0].skinWeights, [0.25, 0.75]);
    assert.strictEqual(model.materials[0].toonIndex, -1);
    assert.strictEqual('englishBoneNames' in model, english);
    assert.strictEqual('englishModelName' in model.metadata, english);
    assert.strictEqual(model.iks[0].links.length, 2);
    assert.strictEqual(model.toonTextures.length, 10);
    assert.strictEqual(model.rigidBodies[0].boneIndex, -1);
    var right = parse('parsePmd', fixtures.pmd(english), true);
    assert.deepStrictEqual(right.vertices[0].position, [1, 2, -3]);
    assert.deepStrictEqual(right.faces[0].indices, [2, 1, 0]);
    assert.deepStrictEqual(right.morphs[0].elements[0].position, [1, 2, -3]);
    assert.deepStrictEqual(right.rigidBodies[0].rotation, [-0.25, -0.5, 0.75]);
    assert.deepStrictEqual(right.constraints[0].translationLimitation1, [3, 4, -6]);
    assert.deepStrictEqual(right.constraints[0].rotationLimitation1, [-6, -7, 7]);
    var snapshot = JSON.stringify(right);
    parser.leftToRightModel(right);
    assert.strictEqual(JSON.stringify(right), snapshot);
  });
  [1, 2, 4].forEach(function(size) {
    // 2.1 as a binary float fails the existing strict version comparison.
    var model = parse('parsePmx', fixtures.pmx(size, 2, true));
    assert.strictEqual(model.metadata.boneIndexSize, size);
    assert.deepStrictEqual(model.vertices.map(function(v) { return v.type; }), [0, 1, 2, 1]);
    assert.deepStrictEqual(model.vertices[0].skinIndices, [-1]);
    assert.deepStrictEqual(model.vertices[3].skinC, [1, 2, 3]);
    assert.deepStrictEqual(model.vertices[3].skinWeights, [0.25, 0.75]);
    assert.deepStrictEqual(model.faces[0].indices, [size === 1 ? 255 : size === 2 ? 65535 : -1, 1, 2]);
    assert.deepStrictEqual(model.materials.map(function(m) { return m.toonFlag; }), [0, 1]);
    assert.strictEqual(model.bones[0].connectIndex, undefined);
    assert.strictEqual(model.bones[1].grant.isLocal, true);
    assert.strictEqual(model.bones[1].ik.target, null);
    assert.deepStrictEqual(model.bones[1].ik.links[0].lowerLimitationAngle, [-1, -2, -3]);
    assert.strictEqual(model.bones[1].ik.links[1].upperLimitationAngle, undefined);
    assert.strictEqual(model.morphs[4].elements[0].toonColor.length, 4);
    model.morphs.slice(5).forEach(function(m) { assert.deepStrictEqual(m.elements, []); });
    var right = parse('parsePmx', fixtures.pmx(size, 2, true), true);
    assert.deepStrictEqual(right.morphs[1].elements[0].position, [1, 2, -3]);
    assert.deepStrictEqual(right.morphs[2].elements[0].position, [1, 2, 3]);
    var snapshot = JSON.stringify(right);
    parser.leftToRightModel(right);
    assert.strictEqual(JSON.stringify(right), snapshot);
  });
  [1, 2, 4].forEach(function(size) {
    [4, 5, 6, 7].forEach(function(type) {
      // These newly supported morphs intentionally differ from the old baseline.
      [false, true].forEach(function(right) {
        var model = parser.parsePmx(fixtures.pmxAdditionalUv(size, type), right);
        assert.strictEqual(model.metadata.vertexIndexSize, size);
        assert.strictEqual(model.metadata.morphCount, 2);
        assert.strictEqual(model.morphs[0].type, type);
        assert.strictEqual(model.morphs[0].elementCount, 2);
        assert.deepStrictEqual(model.morphs[0].elements, [
          { index: 2, uv: [0.25, -0.5, 0.75, -1] },
          { index: 0, uv: [-2, 3, -4, 5] }
        ]);
        assert.strictEqual(model.morphs[1].name, 'following vertex morph');
        assert.strictEqual(model.morphs[1].type, 1);
        assert.deepStrictEqual(model.morphs[1].elements, [{ index: 1, position: [1, 2, right ? -3 : 3] }]);
        assert.deepStrictEqual(model.frames, [{ name: 'following frame', englishName: 'frame',
          type: 0, elementCount: 2, elements: [{ target: 1, index: 0 }, { target: 1, index: 1 }] }]);
        assert.strictEqual(model.metadata.rigidBodyCount, 0);
        assert.strictEqual(model.metadata.constraintCount, 0);
        assert.deepStrictEqual(model.rigidBodies, []);
        assert.deepStrictEqual(model.constraints, []);
      });
    });
  });
  var motion = parse('parseVmd', fixtures.vmd());
  assert.strictEqual(motion.motions[0].interpolation.length, 64);
  assert.strictEqual(motion.cameras[0].interpolation.length, 24);
  var rightMotion = parse('parseVmd', fixtures.vmd(), true);
  assert.deepStrictEqual(rightMotion.motions[0].rotation, [-0.25, -0.5, 0.75, 1]);
  assert.deepStrictEqual(rightMotion.cameras[0].rotation, [-1, -2, 3]);
  var snapshot = JSON.stringify(rightMotion);
  parser.leftToRightVmd(rightMotion);
  assert.strictEqual(JSON.stringify(rightMotion), snapshot);
  var merged = parser.mergeVmds([motion, motion]);
  if (baseline) assert.deepStrictEqual(merged, new baseline.Parser().mergeVmds([motion, motion]));
  assert.strictEqual(merged.metadata.motionCount, 2);
  assert.strictEqual(merged.motions[0], motion.motions[0]);
  assert.strictEqual(merged.motions[1], motion.motions[0]);
  assert.strictEqual('magic' in merged.metadata, false);
  assert.deepStrictEqual(parse('parseVpd', fixtures.vpd).bones[0].translation, [1, 2, 3]);
  var pose = parse('parseVpd', fixtures.vpd, true);
  assert.deepStrictEqual(pose.bones[0].quaternion, [-0.25, -0.5, 0.75, 1]);
  snapshot = JSON.stringify(pose);
  parser.leftToRightVpd(pose);
  assert.strictEqual(JSON.stringify(pose), snapshot);
  ['parsePmd', 'parsePmx', 'parseVmd'].forEach(function(method) {
    assert.throws(function() { parser[method](new ArrayBuffer(100)); });
    assert.throws(function() { parser[method](fixtures[method.slice(5).toLowerCase()](1, 2).slice(0, 60)); });
  });
  assert.throws(function() { parser.parseVpd('invalid'); });
  assert.throws(function() { parser.parseVpd(fixtures.vpd.replace('0.25,0.5,0.75,1.0;', '')); });
  assert.throws(function() { parser.parsePmx(fixtures.pmx(1, 2.1)); });
  // Reject invalid index-size bytes at the binary boundary.
  var invalid = fixtures.pmx(1, 2);
  new DataView(invalid).setUint8(11, 3);
  assert.throws(function() { parser.parsePmx(invalid); });
  console.log(label + ': offline PMD/PMX/VMD/VPD and API checks passed' + (baseline ? ' (matched pre-migration results)' : ''));
}

async function main() {
  check(require('../build/mmdparser.js'), 'UMD');
  check(require('../build/mmdparser.min.js'), 'minified UMD');
  var source = fs.readFileSync(path.join(__dirname, '../build/mmdparser.module.js'), 'utf8');
  check(await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64')), 'ES module');
  check(await import('../build/mmdparser.module.mjs'), 'native ESM');
  var context = { ArrayBuffer: ArrayBuffer, DataView: DataView, Uint8Array: Uint8Array, console: console };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../build/mmdparser.js'), 'utf8'), context);
  assert.strictEqual(typeof context.MMDParser.Parser, 'function');
  var browser = new context.MMDParser.Parser().parsePmd(fixtures.pmd(false));
  assert.strictEqual(browser.metadata.vertexCount, 3);
  assert.strictEqual(browser.vertices[0].position[2], 3);
  console.log('browser global: bundle smoke check passed');
}
main().catch(function(error) { console.error(error); process.exitCode = 1; });
