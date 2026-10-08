var assert = require('assert');
var fixtures = require('./fixtures');

// Shared by every offline bundle and both installed package entry points.
module.exports = function(Parser) {
  var parser = new Parser();
  [1, 2, 4].forEach(function(size) {
    var buffer = fixtures.pmx(size, 2);
    var raw = parser.parsePmx(buffer);
    var original = parser.parsePmx(buffer, false);
    assert.deepStrictEqual(raw, original);
    assert.strictEqual(raw.metadata.coordinateSystem, 'left');
    assert.deepStrictEqual(raw.morphs.map(function(m) { return m.type; }), [0, 1, 2, 3, 8]);
    assert.deepStrictEqual(raw.morphs[2], {
      name: 'morph', englishName: 'english', panel: 1, type: 2, elementCount: 2,
      elements: [
        { index: 1, position: [1, 2, 3], rotation: [0.125, -0.25, 0.5, 0.75] },
        { index: 0, position: [-4, 5, -6], rotation: [-0.5, 0.125, -0.25, 0.875] }
      ]
    });
    var right = parser.parsePmx(buffer, true);
    assert.strictEqual(right.metadata.coordinateSystem, 'right');
    assert.deepStrictEqual(right.morphs[2], {
      name: 'morph', englishName: 'english', panel: 1, type: 2, elementCount: 2,
      elements: [
        { index: 1, position: [1, 2, -3], rotation: [-0.125, 0.25, 0.5, 0.75] },
        { index: 0, position: [-4, 5, 6], rotation: [0.5, -0.125, -0.25, 0.875] }
      ]
    });
    assert.deepStrictEqual(right.morphs[0].elements, [{ index: 2, ratio: 0.5 }]);
    assert.deepStrictEqual(raw.morphs[1].elements, [{ index: 0, position: [1, 2, 3] }]);
    assert.deepStrictEqual(right.morphs[1].elements, [{ index: 0, position: [1, 2, -3] }]);
    [0, 3, 4].forEach(function(i) { assert.deepStrictEqual(right.morphs[i], raw.morphs[i]); });
    // Counts, nonspatial sections and data following the bone offsets stay aligned.
    assert.deepStrictEqual(right.metadata, Object.assign({}, raw.metadata, { coordinateSystem: 'right' }));
    ['textures', 'materials', 'frames'].forEach(function(key) {
      assert.deepStrictEqual(right[key], raw[key]);
    });
    assert.deepStrictEqual(right.morphs[3].elements, [{ index: 0, uv: [1, 2, 3, 4] }]);
    assert.deepStrictEqual(right.morphs[4].elements[0].toonColor, [1, 2, 3, 4]);
    assert.deepStrictEqual(right.frames, [{ name: 'frame', englishName: 'english', type: 0,
      elementCount: 2, elements: [{ target: 0, index: 0 }, { target: 1, index: 1 }] }]);
    assert.strictEqual(right.rigidBodies.length, 1);
    assert.deepStrictEqual(right.rigidBodies[0].position, [4, 5, -6]);
    assert.strictEqual(right.constraints.length, 1);
    assert.deepStrictEqual(right.constraints[0].position, [1, 2, -3]);
    // Explicit conversion mutates the existing typed payload and matches parsePmx(true).
    var element = raw.morphs[2].elements[0];
    var position = element.position;
    var rotation = element.rotation;
    parser.leftToRightModel(raw);
    assert.strictEqual(raw.morphs[2].elements[0], element);
    assert.strictEqual(element.position, position);
    assert.strictEqual(element.rotation, rotation);
    assert.deepStrictEqual(raw, right);
    var snapshot = JSON.stringify(right);
    parser.leftToRightModel(right);
    parser.leftToRightModel(right);
    parser.leftToRightModel(raw);
    assert.strictEqual(JSON.stringify(right), snapshot);
    assert.deepStrictEqual(raw, right);
    // Parsing the same buffer again must still return untouched left-handed values.
    assert.deepStrictEqual(parser.parsePmx(buffer), original);
    assert.deepStrictEqual(parser.parsePmx(buffer, false), original);
  });
};
