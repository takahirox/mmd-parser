// Small, shareable binary fixtures exercising the sections this parser reads.
function Writer() { this.parts = []; }
Writer.prototype.number = function(method, size, value) {
  var bytes = Buffer.alloc(size);
  bytes[method](value, 0);
  this.parts.push(bytes);
  return this;
};
Writer.prototype.u8 = function(v) { return this.number('writeUInt8', 1, v); };
Writer.prototype.i8 = function(v) { return this.number('writeInt8', 1, v); };
Writer.prototype.u16 = function(v) { return this.number('writeUInt16LE', 2, v); };
Writer.prototype.i16 = function(v) { return this.number('writeInt16LE', 2, v); };
Writer.prototype.u32 = function(v) { return this.number('writeUInt32LE', 4, v); };
Writer.prototype.i32 = function(v) { return this.number('writeInt32LE', 4, v); };
Writer.prototype.f32 = function(v) { return this.number('writeFloatLE', 4, v); };
Writer.prototype.floats = function(values) {
  var writer = this;
  values.forEach(function(value) { writer.f32(value); });
  return this;
};
Writer.prototype.bytes = function(values) { this.parts.push(Buffer.from(values)); return this; };
Writer.prototype.chars = function(text, size) {
  var bytes = Buffer.alloc(size);
  Buffer.from(text).copy(bytes);
  this.parts.push(bytes);
  return this;
};
Writer.prototype.text = function(text) {
  var bytes = Buffer.from(text, 'utf16le');
  this.u32(bytes.length);
  this.parts.push(bytes);
  return this;
};
Writer.prototype.index = function(size, value, unsigned) {
  return size === 1 ? (unsigned ? this.u8(value) : this.i8(value)) :
    size === 2 ? (unsigned ? this.u16(value) : this.i16(value)) : this.i32(value);
};
Writer.prototype.buffer = function() {
  var bytes = Buffer.concat(this.parts);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};
function body(writer) {
  writer.u8(2).u16(65535).u8(1).floats([1, 2, 3]).floats([4, 5, 6])
    .floats([0.25, 0.5, 0.75]).floats([1, 2, 3, 4, 5]).u8(2);
}
function constraint(writer) {
  for (var i = 0; i < 8; i++) writer.floats([i + 1, i + 2, i + 3]);
}
function pmd(english) {
  var w = new Writer();
  w.chars('Pmd', 3).f32(1).chars('model', 20).chars('comment', 256).u32(3);
  for (var i = 0; i < 3; i++) {
    w.floats([1, 2, 3]).floats([0, 1, 2]).floats([0.25, 0.75])
      .u16(0).u16(1).u8(25).u8(0);
  }
  w.u32(3).u16(0).u16(1).u16(2).u32(1);
  w.floats([1, 0.5, 0.25, 1]).f32(2).floats([1, 2, 3]).floats([4, 5, 6])
    .i8(-1).u8(1).u32(3).chars('texture.png', 20);
  w.u16(2);
  for (i = 0; i < 2; i++) {
    w.chars('bone' + i, 20).i16(-1).i16(1).u8(0).i16(-1).floats([1, 2, 3]);
  }
  w.u16(1).u16(0).u16(1).u8(2).u16(10).f32(0.5).u16(0).u16(1);
  w.u16(2);
  for (i = 0; i < 2; i++) {
    w.chars('morph' + i, 20).u32(1).u8(i).u32(0).floats([1, 2, 3]);
  }
  w.u8(1).u16(1).u8(1).chars('frame', 50).u32(1).i16(0).u8(1).u8(english ? 1 : 0);
  if (english) {
    w.chars('english', 20).chars('english comment', 256).chars('bone0', 20)
      .chars('bone1', 20).chars('morph1', 20).chars('frame', 50);
  }
  for (i = 0; i < 10; i++) w.chars('toon' + i, 100);
  w.u32(1).chars('body', 20).i16(-1);
  body(w);
  w.u32(1).chars('constraint', 20).u32(0).u32(0);
  constraint(w);
  return w.buffer();
}
function pmx(size, version, unsupported) {
  var w = new Writer();
  w.chars('PMX ', 4).f32(version).u8(8).u8(0).u8(1);
  for (var i = 0; i < 6; i++) w.u8(size);
  w.text('モデル').text('model').text('comment').text('english comment').u32(4);
  for (var type = 0; type < 4; type++) {
    w.floats([1, 2, 3]).floats([0, 1, 2]).floats([0.25, 0.75]).floats([1, 2, 3, 4]).u8(type);
    w.index(size, -1);
    if (type !== 0) w.index(size, 0);
    if (type === 2) w.index(size, 1).index(size, 0).floats([0.25, 0.25, 0.25, 0.25]);
    else if (type !== 0) w.f32(0.25);
    if (type === 3) w.floats([1, 2, 3]).floats([4, 5, 6]).floats([7, 8, 9]);
    w.f32(1);
  }
  // Include a high unsigned vertex index without allocating a large model.
  w.u32(3).index(size, size === 1 ? 255 : size === 2 ? 65535 : -1, true)
    .index(size, 1, true).index(size, 2, true);
  w.u32(1).text('texture.png').u32(2);
  for (var toon = 0; toon < 2; toon++) {
    w.text('material').text('english').floats([1, 2, 3, 4]).floats([1, 2, 3])
      .f32(2).floats([4, 5, 6]).u8(0).floats([1, 2, 3, 4]).f32(1)
      .index(size, -1).index(size, -1).u8(0).u8(toon);
    if (toon === 0) w.index(size, -1);
    else w.i8(-1);
    w.text('comment').u32(3);
  }
  w.u32(2);
  w.text('bone0').text('english').floats([1, 2, 3]).index(size, -1).u32(0).u16(0).floats([1, 2, 3]);
  w.text('bone1').text('english').floats([1, 2, 3]).index(size, -1).u32(1).u16(0x2fa1)
    .index(size, 0).index(size, 0).f32(0.5).floats([1, 2, 3]).floats([4, 5, 6]).floats([7, 8, 9]).u32(5)
    .index(size, 0).u32(10).f32(0.5).u32(2).index(size, 0).u8(1).floats([-1, -2, -3]).floats([1, 2, 3])
    .index(size, 1).u8(0);
  var morphTypes = unsupported ? [0, 1, 2, 3, 8, 9, 10, 255] : [0, 1, 2, 3, 8];
  w.u32(morphTypes.length);
  morphTypes.forEach(function(morphType) {
    w.text('morph').text('english').u8(1).u8(morphType).u32(morphType === 2 ? 2 : 1);
    if ([0, 1, 2, 3, 8].indexOf(morphType) === -1) return; // Existing reader consumes no bytes.
    w.index(size, morphType === 0 ? 2 : morphType === 2 ? 1 : 0);
    if (morphType === 0) w.f32(0.5);
    else if (morphType === 1) w.floats([1, 2, 3]);
    else if (morphType === 2) {
      // Two ordered bone offsets with nonzero, asymmetric, exactly representable values.
      w.floats([1, 2, 3]).floats([0.125, -0.25, 0.5, 0.75]);
      w.index(size, 0).floats([-4, 5, -6]).floats([-0.5, 0.125, -0.25, 0.875]);
    }
    else if (morphType === 3) w.floats([1, 2, 3, 4]);
    else {
      w.u8(1).floats([1, 2, 3, 4]).floats([1, 2, 3]).f32(2).floats([4, 5, 6])
        .floats([1, 2, 3, 4]).f32(1).floats([1, 2, 3, 4]).floats([1, 2, 3, 4]).floats([1, 2, 3, 4]);
    }
  });
  w.u32(1).text('frame').text('english').u8(0).u32(2).u8(0).index(size, 0).u8(1).index(size, 1);
  w.u32(1).text('body').text('english').index(size, -1);
  body(w);
  w.u32(1).text('constraint').text('english').u8(0).index(size, 0).index(size, 0);
  constraint(w);
  return w.buffer();
}
// Valid PMX 2.0 with two additional-UV offsets and following morph/frame data.
// Other index sizes stay at one byte to catch use of the wrong header field.
function pmxAdditionalUv(size, type) {
  var w = new Writer();
  w.chars('PMX ', 4).f32(2).u8(8).bytes([0, 4, size, 1, 1, 1, 1, 1]);
  w.text('additional UV').text('additional UV').text('').text('').u32(3);
  for (var i = 0; i < 3; i++) {
    w.floats([i, 0, 0]).floats([0, 1, 0]).floats([0, 0]);
    for (var j = 0; j < 4; j++) w.floats([0, 0, 0, 0]);
    w.u8(0).i8(0).f32(1); // BDEF1, bone 0, edge ratio.
  }
  w.u32(0).u32(0).u32(0).u32(1); // Faces, textures, materials, bones.
  w.text('bone').text('bone').floats([0, 0, 0]).i8(-1).u32(0).u16(0).floats([0, 1, 0]);
  w.u32(2).text('additional UV morph').text('additional UV morph').u8(4).u8(type).u32(2);
  w.index(size, 2, true).floats([0.25, -0.5, 0.75, -1]);
  w.index(size, 0, true).floats([-2, 3, -4, 5]);
  w.text('following vertex morph').text('vertex morph').u8(1).u8(1).u32(1)
    .index(size, 1, true).floats([1, 2, 3]);
  w.u32(1).text('following frame').text('frame').u8(0).u32(2)
    .u8(1).i8(0).u8(1).i8(1);
  w.u32(0).u32(0); // Rigid bodies and constraints.
  return w.buffer();
}
function vmd() {
  var w = new Writer();
  w.chars('Vocaloid Motion Data 0002', 30).chars('model', 20).u32(1)
    .chars('bone', 15).u32(10).floats([1, 2, 3]).floats([0.25, 0.5, 0.75, 1]);
  for (var i = 0; i < 64; i++) w.u8(i);
  w.u32(1).chars('morph', 15).u32(20).f32(0.5).u32(1).u32(30).f32(10).floats([1, 2, 3]).floats([1, 2, 3]);
  for (i = 0; i < 24; i++) w.u8(i);
  w.u32(45).u8(1);
  return w.buffer();
}
var vpd = 'Vocaloid Pose Data file\n\nmodel.pmd;\n1;\nBone0{bone\n1.0,2.0,3.0;\n0.25,0.5,0.75,1.0;\n}\n';
module.exports = { Writer: Writer, pmd: pmd, pmx: pmx, pmxAdditionalUv: pmxAdditionalUv, vmd: vmd, vpd: vpd };
