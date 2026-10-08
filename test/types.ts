// Compile-only contracts: each expected error must actually be rejected by tsc.
import { MMDParser, Parser, CharsetEncoder } from '..';
import type { Pmd, Pmx, Vmd, Vpd, PmxVertex, PmxMorph, Vector2, Vector3, Vector4, Quaternion, IndexSize } from '..';
import { DataViewEx } from '../build/types/src/DataViewEx';

const parser: Parser = new MMDParser.Parser();
const buffer = new ArrayBuffer(0);
const pmd: Pmd = parser.parsePmd(buffer);
const pmx: Pmx = parser.parsePmx(buffer, true);
const vmd: Vmd = parser.parseVmd(buffer);
const vpd: Vpd = parser.parseVpd('');
const merged: Vmd = parser.mergeVmds([vmd]);
parser.leftToRightModel(pmd);
parser.leftToRightModel(pmx);
parser.leftToRightVmd(merged);
parser.leftToRightVpd(vpd);
new CharsetEncoder().s2u(new Uint8Array(0));
const dv = new DataViewEx(buffer);
const indexSize: IndexSize = dv.getIndexSize();
const position: Vector3 = dv.getFloat32Array(3);
const uv: Vector2 = dv.getFloat32Array(2);
const quaternion: Quaternion = dv.getFloat32Array(4);
const indices: Vector3 = dv.getIndexArray(indexSize, 3, true);
const single: [number] = dv.getIndexArray(1, 1);
const interpolation: { length: 64 } = dv.getUint8Array(64);
const dynamic: number[] = dv.getFloat32Array(pmd.metadata.vertexCount);

const vertex: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1,
  type: 0, skinIndices: [1], skinWeights: [1] };
if (vertex.type === 0) {
  const oneIndex: [number] = vertex.skinIndices;
  // @ts-expect-error BDEF1 indices cannot be read as a pair.
  const twoIndices: Vector2 = vertex.skinIndices;
}
function morphPosition(morph: PmxMorph): Vector3 | undefined {
  if (morph.type === 1) {
    for (const element of morph.elements) return element.position;
  }
  return undefined;
}
const morph: PmxMorph = { name: '', englishName: '', panel: 0, elementCount: 1,
  type: 1, elements: [{ index: 0, position }] };
morphPosition(morph);

const boneMorph: Extract<PmxMorph, { type: 2 }> = { ...morph, type: 2,
  elements: [{ index: 1, position, rotation: quaternion }] };
function boneMorphData(morph: PmxMorph): void {
  if (morph.type === 2) {
    for (const element of morph.elements) {
      const index: number = element.index;
      const translation: Vector3 = element.position;
      const rotation: Quaternion = element.rotation;
      // @ts-expect-error Bone offsets have no morph weight or group ratio.
      const ratio: number = element.ratio;
    }
  }
}
boneMorphData(boneMorph);
// @ts-expect-error A bone morph offset requires a quaternion.
const missingBoneRotation: PmxMorph = { ...boneMorph, elements: [{ index: 0, position }] };
// @ts-expect-error Bone morph quaternions have four components.
const shortBoneRotation: PmxMorph = { ...boneMorph, elements: [{ index: 0, position, rotation: position }] };

// Each additional-UV discriminator exposes non-empty four-component offsets.
const additionalUv4: Extract<PmxMorph, { type: 4 }> = { ...morph, type: 4, elements: [{ index: 0, uv: quaternion }] };
const additionalUv5: Extract<PmxMorph, { type: 5 }> = { ...morph, type: 5, elements: [{ index: 0, uv: quaternion }] };
const additionalUv6: Extract<PmxMorph, { type: 6 }> = { ...morph, type: 6, elements: [{ index: 0, uv: quaternion }] };
const additionalUv7: Extract<PmxMorph, { type: 7 }> = { ...morph, type: 7, elements: [{ index: 0, uv: quaternion }] };
function morphUv(morph: PmxMorph): Vector4 | undefined {
  switch (morph.type) {
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      for (const element of morph.elements) return element.uv;
  }
  return undefined;
}
[additionalUv4, additionalUv5, additionalUv6, additionalUv7].forEach(morphUv);
// @ts-expect-error Additional UV offsets have four components, not three.
const shortMorphUv: PmxMorph = { ...morph, type: 4, elements: [{ index: 0, uv: position }] };
// @ts-expect-error Additional UV morph elements require UV offsets, not positions.
const wrongAdditionalUv: PmxMorph = { ...morph, type: 7, elements: [{ index: 0, position }] };
// @ts-expect-error Each additional UV variant preserves its numeric discriminator.
const wrongUvType: Extract<PmxMorph, { type: 4 }> = additionalUv5;

// @ts-expect-error A model result must include all of its sections.
const incomplete: Pmd = { metadata: pmd.metadata, vertices: [] };
// @ts-expect-error Vector3 has exactly three components.
const shortPosition: Vector3 = [1, 2];
// @ts-expect-error Quaternion has exactly four components.
const longQuaternion: Quaternion = [1, 2, 3, 4, 5];
// @ts-expect-error Binary indices use only 1, 2, or 4 bytes.
dv.getIndex(3);
// @ts-expect-error Ordinary binary data requires no tuple assertions.
const wrongTuple: Vector2 = dv.getFloat32Array(3);
// @ts-expect-error Skinning discriminator and tuple length must agree.
const wrongSkin: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 2, skinIndices: [0], skinWeights: [1] };
// @ts-expect-error Group morph elements require a ratio, not a position.
const wrongMorph: PmxMorph = { name: '', englishName: '', panel: 0, elementCount: 1, type: 0, elements: [{ index: 0, position }] };
// @ts-expect-error Coordinate state is a finite union.
pmd.metadata.coordinateSystem = 'other';
// @ts-expect-error The charset boundary accepts bytes, not text.
new CharsetEncoder().s2u('text');
// @ts-expect-error A merged VMD may lack magic; parsed fields remain optional here.
const magic: string = merged.metadata.magic;

// @ts-expect-error SDEF's retained vectors must be present together.
const partialSdef: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 3, skinIndices: [0, 1], skinWeights: [0.5, 0.5], skinC: position };
// @ts-expect-error SDEF fields belong to type 3, not BDEF2.
const wrongSdefType: PmxVertex = { position, normal: position, uv, auvs: [], edgeRatio: 1, type: 1, skinIndices: [0, 1], skinWeights: [0.5, 0.5], skinC: position, skinR0: position, skinR1: position };

const sdef: Extract<PmxVertex, { type: 3 }> = { position, normal: position, uv, auvs: [], edgeRatio: 1,
  type: 3, skinIndices: [0, 1], skinWeights: [0.25, 0.75], skinC: position, skinR0: position, skinR1: position };
function skinningData(vertex: PmxVertex): void {
  if (vertex.type === 3) {
    const indices: Vector2 = vertex.skinIndices;
    const weights: Vector2 = vertex.skinWeights;
    const c: Vector3 = vertex.skinC;
    const r0: Vector3 = vertex.skinR0;
    const r1: Vector3 = vertex.skinR1;
    // @ts-expect-error SDEF indices have exactly two components.
    const fourIndices: Vector4 = vertex.skinIndices;
  } else if (vertex.type === 1) {
    const indices: Vector2 = vertex.skinIndices;
    const weights: Vector2 = vertex.skinWeights;
    // @ts-expect-error BDEF2 has no SDEF vector.
    const c: Vector3 = vertex.skinC;
  }
}
skinningData(sdef);
// @ts-expect-error SDEF requires two bone indices.
const shortSdefIndices: PmxVertex = { ...sdef, skinIndices: [0] };
// @ts-expect-error SDEF requires two weights.
const shortSdefWeights: PmxVertex = { ...sdef, skinWeights: [1] };
// @ts-expect-error SDEF vectors have exactly three components.
const shortSdefVector: PmxVertex = { ...sdef, skinR1: [1, 2] };
