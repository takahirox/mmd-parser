var assert = require('assert');
var fixtures = require('./fixtures');

// Exercise PMX regressions against the installed tarball, with no source fallback.
module.exports = function(Parser) {
  require('./pmx-bone-morph')(Parser);
  console.log('Installed PMX bone morphs: translations, quaternions, mixed morphs and idempotence passed');
  require('./pmx-sdef')(Parser);
  console.log('Installed PMX skinning: BDEF1/BDEF2/BDEF4/SDEF, all index widths and coordinate modes passed');
  var parser = new Parser();
  [1, 2, 4].forEach(function(size) {
    [4, 5, 6, 7].forEach(function(type) {
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
        assert.deepStrictEqual(model.morphs[1].elements, [
          { index: 1, position: [1, 2, right ? -3 : 3] }
        ]);
        assert.deepStrictEqual(model.frames, [{ name: 'following frame', englishName: 'frame',
          type: 0, elementCount: 2, elements: [{ target: 1, index: 0 }, { target: 1, index: 1 }] }]);
        assert.strictEqual(model.metadata.rigidBodyCount, 0);
        assert.strictEqual(model.metadata.constraintCount, 0);
        assert.deepStrictEqual(model.rigidBodies, []);
        assert.deepStrictEqual(model.constraints, []);
      });
    });
  });
  console.log('Installed PMX additional UV morphs: types 4–7, all index widths and coordinate modes passed');
};
