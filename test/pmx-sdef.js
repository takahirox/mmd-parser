var assert = require('assert');
var fixtures = require('./fixtures');

// Shared by all offline bundles and both installed package entry points.
module.exports = function(Parser) {
  var parser = new Parser();
  [1, 2, 4].forEach(function(size) {
    var raw = parser.parsePmx(fixtures.pmx(size, 2));
    assert.strictEqual(raw.metadata.coordinateSystem, 'left');
    assert.deepStrictEqual(parser.parsePmx(fixtures.pmx(size, 2), false), raw);
    [false, true].forEach(function(right) {
      var model = parser.parsePmx(fixtures.pmx(size, 2), right);
      var z = right ? -1 : 1;
      assert.strictEqual(model.metadata.coordinateSystem, right ? 'right' : 'left');
      assert.strictEqual(model.metadata.boneIndexSize, size);
      assert.strictEqual(model.metadata.vertexCount, 4);
      assert.deepStrictEqual(model.vertices.map(function(v) { return v.type; }), [0, 1, 2, 3]);
      assert.deepStrictEqual(model.vertices.map(function(v) { return v.skinIndices; }),
        [[-1], [-1, 0], [-1, 0, 1, 0], [-1, 0]]);
      assert.deepStrictEqual(model.vertices.map(function(v) { return v.skinWeights; }),
        [[1], [0.25, 0.75], [0.25, 0.25, 0.25, 0.25], [0.25, 0.75]]);
      model.vertices.forEach(function(vertex) {
        assert.deepStrictEqual(vertex.position, [1, 2, 3 * z]);
        assert.deepStrictEqual(vertex.normal, [0, 1, 2 * z]);
        assert.deepStrictEqual(vertex.uv, [0.25, 0.75]);
        assert.deepStrictEqual(vertex.auvs, [[1, 2, 3, 4]]);
        assert.strictEqual(vertex.edgeRatio, 1);
        if (vertex.type !== 3) {
          ['skinC', 'skinR0', 'skinR1'].forEach(function(key) {
            assert.strictEqual(key in vertex, false);
          });
        }
      });
      assert.deepStrictEqual(model.vertices[3].skinC, [1, 2, 3 * z]);
      assert.deepStrictEqual(model.vertices[3].skinR0, [4, 5, 6 * z]);
      assert.deepStrictEqual(model.vertices[3].skinR1, [7, 8, 9 * z]);
      // Non-empty sections following the SDEF bytes must remain aligned.
      var indices = [size === 1 ? 255 : size === 2 ? 65535 : -1, 1, 2];
      assert.deepStrictEqual(model.faces[0].indices, right ? indices.reverse() : indices);
      assert.deepStrictEqual(model.textures, ['texture.png']);
      assert.strictEqual(model.materials.length, 2);
      assert.strictEqual(model.materials[1].name, 'material');
      assert.strictEqual(model.bones.length, 2);
      assert.deepStrictEqual(model.bones[0].position, [1, 2, 3 * z]);
      assert.strictEqual(model.morphs.length, 5);
      assert.deepStrictEqual(model.morphs[1].elements, [{ index: 0, position: [1, 2, 3 * z] }]);
      assert.deepStrictEqual(model.frames, [{ name: 'frame', englishName: 'english', type: 0,
        elementCount: 2, elements: [{ target: 0, index: 0 }, { target: 1, index: 1 }] }]);
      assert.strictEqual(model.rigidBodies.length, 1);
      assert.deepStrictEqual(model.rigidBodies[0].position, [4, 5, 6 * z]);
      assert.strictEqual(model.constraints.length, 1);
      assert.deepStrictEqual(model.constraints[0].position, [1, 2, 3 * z]);
      if (right) {
        // Explicit conversion must match parsing with conversion enabled.
        parser.leftToRightModel(raw);
        assert.deepStrictEqual(raw, model);
        var snapshot = JSON.stringify(model);
        parser.leftToRightModel(model);
        parser.leftToRightModel(model);
        assert.strictEqual(JSON.stringify(model), snapshot);
      }
    });
  });
};
