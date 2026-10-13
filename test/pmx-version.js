var assert = require('assert');
var fixtures = require('./fixtures');

// Run against every bundle and installed CJS/ESM entry point. The PMX 2.1
// fixture has a zero soft-body count, but only common sections are asserted:
// the parser does not read that trailing count or implement 2.1-only features.
module.exports = function(Parser) {
  var parser = new Parser();
  [2.0, 2.1].forEach(function(version) {
    var buffer = fixtures.pmxVersion(version);
    var encoded = new DataView(buffer).getFloat32(4, true);
    assert.strictEqual(encoded, Math.fround(version));
    if (version === 2.1) assert.notStrictEqual(encoded, version);
    [false, true].forEach(function(right) {
      var model = parser.parsePmx(buffer, right);
      var z = right ? -1 : 1;
      assert.strictEqual(model.metadata.version, encoded);
      assert.strictEqual(model.metadata.coordinateSystem, right ? 'right' : 'left');
      assert.strictEqual(model.metadata.modelName, 'version fixture');
      assert.deepStrictEqual(model.vertices.map(function(v) { return v.position; }),
        [[0, 0, z], [1, 0, z], [0, 1, z]]);
      assert.deepStrictEqual(model.vertices.map(function(v) { return v.skinIndices; }), [[0], [0], [0]]);
      assert.deepStrictEqual(model.faces, [{ indices: right ? [2, 1, 0] : [0, 1, 2] }]);
      assert.deepStrictEqual(model.textures, []);
      assert.strictEqual(model.materials[0].name, 'material');
      assert.strictEqual(model.materials[0].faceCount, 1);
      assert.strictEqual(model.bones[0].name, 'bone');
      assert.deepStrictEqual(model.morphs[0].elements, [{ index: 2, position: [0.25, 0.5, 0.75 * z] }]);
      assert.deepStrictEqual(model.frames, [{ name: 'frame', englishName: 'frame', type: 0,
        elementCount: 2, elements: [{ target: 0, index: 0 }, { target: 1, index: 0 }] }]);
      assert.strictEqual(model.metadata.rigidBodyCount, 0);
      assert.strictEqual(model.metadata.constraintCount, 0);
      assert.deepStrictEqual(model.rigidBodies, []);
      assert.deepStrictEqual(model.constraints, []);
      // Shared payloads must produce identical results across header versions.
      var pmx20 = parser.parsePmx(fixtures.pmxVersion(2.0), right);
      pmx20.metadata.version = encoded;
      assert.deepStrictEqual(model, pmx20);
    });
    assert.deepStrictEqual(parser.parsePmx(buffer), parser.parsePmx(buffer, false));
  });

  // Include the immediately adjacent float32 encodings to prevent a tolerance
  // or decimal-rounding fix from accidentally admitting unknown versions.
  var ulp = Math.pow(2, -22);
  [1.0, 2.2, 2.099, NaN, Infinity, -Infinity, 0, -2.1,
    2 - Math.pow(2, -23), 2 + ulp, Math.fround(2.1) - ulp, Math.fround(2.1) + ulp
  ].forEach(function(version) {
    var buffer = fixtures.pmxVersion(version);
    var encoded = new DataView(buffer).getFloat32(4, true);
    assert.throws(function() { parser.parsePmx(buffer); }, function(error) {
      return error === 'PMX version ' + encoded + ' is not supported.';
    });
  });
};
